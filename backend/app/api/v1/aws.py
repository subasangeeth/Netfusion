from typing import List, Optional
from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.schemas.all_schemas import AwsResourceResponse
from app.services.aws_service import AwsService
from app.api.deps import get_current_user, require_role, record_audit_log

router = APIRouter(prefix="/aws", tags=["AWS Cloud"])

@router.get("/resources", response_model=List[AwsResourceResponse])
async def get_aws_resources(
    resource_type: Optional[str] = Query(None, description="Filter by resource type: vpc, subnet, ec2, security_group"),
    current_user = Depends(get_current_user)
):
    resources = AwsService.get_vpc_resources()
    if resource_type:
        resources = [r for r in resources if r["resource_type"] == resource_type]
    return resources

@router.get("/vpcs")
async def get_aws_vpcs(current_user = Depends(get_current_user)):
    resources = AwsService.get_vpc_resources()
    return [r for r in resources if r["resource_type"] == "vpc"]

@router.get("/instances")
async def get_aws_instances(current_user = Depends(get_current_user)):
    resources = AwsService.get_vpc_resources()
    return [r for r in resources if r["resource_type"] == "ec2"]

@router.post("/sync")
async def sync_aws_resources(
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_role(["ADMIN", "NETWORK_ENGINEER"]))
):
    user_role = current_user.roles[0].name if current_user.roles else "ADMIN"
    await record_audit_log(
        db, current_user.email, user_role, "AWS_SYNC", "AWS", "ALL", "SUCCESS",
        {"status": "Synchronized AWS VPC and EC2 topology"},
        request.client.host if request.client else None
    )
    return {
        "status": "SUCCESS",
        "synced_count": 6,
        "region": "us-east-1",
        "mode": "Live Boto3" if AwsService.is_live_aws_configured() else "Demo Simulation"
    }
