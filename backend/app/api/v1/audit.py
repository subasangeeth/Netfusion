from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.core.database import get_db
from app.models.audit import AuditLog
from app.schemas.all_schemas import AuditLogResponse
from app.api.deps import get_current_user, require_role

router = APIRouter(prefix="/audit", tags=["Audit Logs"])

@router.get("/logs", response_model=List[AuditLogResponse])
async def list_audit_logs(
    resource_type: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    limit: int = Query(100, ge=1, le=500),
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_role(["ADMIN", "SECURITY_ANALYST"]))
):
    query = select(AuditLog).order_by(desc(AuditLog.timestamp)).limit(limit)
    if resource_type:
        query = query.where(AuditLog.resource_type == resource_type)
    if status:
        query = query.where(AuditLog.status == status)

    res = await db.execute(query)
    logs = res.scalars().all()
    return logs
