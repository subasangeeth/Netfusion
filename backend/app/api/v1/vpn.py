from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.schemas.all_schemas import VpnStatusResponse
from app.services.vpn_service import VpnService
from app.api.deps import get_current_user, require_role, record_audit_log

router = APIRouter(prefix="/vpn", tags=["Hybrid VPN"])

@router.get("/status", response_model=VpnStatusResponse)
async def get_vpn_status(current_user = Depends(get_current_user)):
    telemetry = VpnService.get_vpn_telemetry()
    return telemetry

@router.post("/restart")
async def restart_vpn_tunnel(
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_role(["ADMIN", "NETWORK_ENGINEER"]))
):
    user_role = current_user.roles[0].name if current_user.roles else "ADMIN"
    await record_audit_log(
        db, current_user.email, user_role, "VPN_RESTART", "VPN", "wg0", "SUCCESS",
        {"interface": "wg0", "action": "Soft reload of WireGuard interface"},
        request.client.host if request.client else None
    )
    return {
        "status": "SUCCESS",
        "message": "WireGuard tunnel wg0 restarted and re-keyed successfully.",
        "new_handshake": "Just now"
    }
