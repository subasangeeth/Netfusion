from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.core.database import get_db
from app.models.security import SecurityEvent, Alert
from app.schemas.all_schemas import (
    SecurityEventResponse, AlertResponse, AttackSimulationRequest, AttackSimulationResponse
)
from app.services.security_service import SecurityService
from app.api.deps import get_current_user, require_role, record_audit_log

router = APIRouter(prefix="/security", tags=["Security & Suricata"])

@router.get("/events", response_model=List[SecurityEventResponse])
async def list_security_events(
    severity: Optional[str] = Query(None, description="Filter by severity: critical, high, medium, low"),
    limit: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    query = select(SecurityEvent).order_by(desc(SecurityEvent.timestamp)).limit(limit)
    if severity:
        query = query.where(SecurityEvent.severity == severity)
    
    res = await db.execute(query)
    events = res.scalars().all()
    if not events:
        # Return initial default events if none generated yet
        return [
            SecurityEventResponse(
                id=1, source_ip="10.10.20.10", dest_ip="10.10.30.10", protocol="TCP",
                src_port=49152, dest_port=8080, severity="critical", rule_id="SURICATA-2001001",
                rule_name="ET SCAN Potential Nmap Port Sweep", payload_snippet="TCP SYN seq=319201 ack=0",
                status="new", timestamp=datetime.utcnow()
            ),
            SecurityEventResponse(
                id=2, source_ip="10.10.20.11", dest_ip="10.10.30.10", protocol="TCP",
                src_port=50114, dest_port=8080, severity="high", rule_id="SURICATA-2001002",
                rule_name="HTTP 401 Brute Force Threshold Exceeded", payload_snippet="POST /api/v1/auth/login (401 Unauthorized)",
                status="new", timestamp=datetime.utcnow()
            )
        ]
    return events

@router.get("/alerts", response_model=List[AlertResponse])
async def list_alerts(
    is_resolved: Optional[bool] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    query = select(Alert).order_by(desc(Alert.created_at))
    if is_resolved is not None:
        query = query.where(Alert.is_resolved == is_resolved)
    
    res = await db.execute(query)
    alerts = res.scalars().all()
    return alerts

@router.post("/alerts/{alert_id}/resolve")
async def resolve_alert(
    alert_id: int,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_role(["ADMIN", "SECURITY_ANALYST"]))
):
    stmt = select(Alert).where(Alert.id == alert_id)
    res = await db.execute(stmt)
    alert = res.scalar_one_or_none()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    alert.is_resolved = True
    alert.resolved_at = datetime.utcnow()
    alert.resolved_by = current_user.email
    await db.commit()

    user_role = current_user.roles[0].name if current_user.roles else "ADMIN"
    await record_audit_log(
        db, current_user.email, user_role, "ALERT_RESOLVE", "Alert", str(alert_id), "SUCCESS",
        {"title": alert.title}, request.client.host if request.client else None
    )

    return {"message": f"Alert {alert_id} resolved successfully"}

@router.post("/simulate", response_model=AttackSimulationResponse)
async def simulate_attack(
    payload: AttackSimulationRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_role(["ADMIN", "SECURITY_ANALYST"]))
):
    result = SecurityService.run_safe_attack_simulation(
        sim_type=payload.simulation_type,
        target=payload.target
    )

    # Persist the generated event into database
    if "event" in result:
        ev = result["event"]
        new_event = SecurityEvent(
            source_ip=ev["source_ip"],
            dest_ip=ev["dest_ip"],
            protocol=ev["protocol"],
            src_port=ev["src_port"],
            dest_port=ev["dest_port"],
            severity=ev["severity"],
            rule_id=ev["rule_id"],
            rule_name=ev["rule_name"],
            payload_snippet=ev["payload_snippet"],
            status="new",
            timestamp=datetime.utcnow()
        )
        db.add(new_event)
        await db.commit()
        await db.refresh(new_event)
        result["event_id"] = new_event.id

    user_role = current_user.roles[0].name if current_user.roles else "ADMIN"
    await record_audit_log(
        db, current_user.email, user_role, "ATTACK_SIMULATION", "Security", payload.simulation_type, "SUCCESS",
        {"target": payload.target, "detected_by": result.get("detected_by")},
        request.client.host if request.client else None
    )

    return result
