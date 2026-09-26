from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.core.database import get_db
from app.models.terraform import TerraformRun
from app.schemas.all_schemas import TerraformRunRequest, TerraformRunResponse
from app.services.terraform_service import TerraformService
from app.api.deps import get_current_user, require_role, record_audit_log

router = APIRouter(prefix="/terraform", tags=["Terraform Automation"])

@router.get("/runs", response_model=List[TerraformRunResponse])
async def list_terraform_runs(db: AsyncSession = Depends(get_db), current_user = Depends(get_current_user)):
    stmt = select(TerraformRun).order_by(desc(TerraformRun.created_at))
    res = await db.execute(stmt)
    runs = res.scalars().all()
    if not runs:
        return [
            TerraformRunResponse(
                id=1, environment="dev", action="plan", status="succeeded", initiated_by="admin@netfusion.local",
                plan_summary="Plan: 5 to add, 0 to change, 0 to destroy.", stdout="Plan succeeded.",
                stderr=None, created_at=datetime.utcnow(), completed_at=datetime.utcnow()
            )
        ]
    return runs

@router.post("/run", response_model=TerraformRunResponse)
async def trigger_terraform(
    payload: TerraformRunRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_role(["ADMIN"]))
):
    result = TerraformService.run_terraform(
        action=payload.action,
        env=payload.environment,
        confirm=payload.confirm_destructive
    )

    new_run = TerraformRun(
        environment=payload.environment,
        action=payload.action,
        status=result["status"],
        initiated_by=current_user.email,
        plan_summary=result.get("plan_summary"),
        stdout=result.get("stdout"),
        stderr=result.get("stderr"),
        created_at=datetime.utcnow(),
        completed_at=datetime.utcnow() if result["status"] != "requires_confirmation" else None
    )
    db.add(new_run)
    await db.commit()
    await db.refresh(new_run)

    user_role = current_user.roles[0].name if current_user.roles else "ADMIN"
    await record_audit_log(
        db, current_user.email, user_role, f"TERRAFORM_{payload.action.upper()}", "Terraform",
        payload.environment, result["status"].upper(),
        {"action": payload.action, "summary": result.get("plan_summary")},
        request.client.host if request.client else None
    )

    return new_run
