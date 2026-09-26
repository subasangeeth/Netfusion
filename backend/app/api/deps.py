from typing import List, Optional
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.security import decode_token
from app.models.user import User
from app.models.audit import AuditLog
from app.core.config import settings

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login", auto_error=False)

async def get_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
) -> User:
    # If in demo mode and no token supplied, allow default viewer/admin for painless initial access
    if not token:
        if settings.NETFUSION_MODE == "demo":
            stmt = select(User).where(User.email == "admin@netfusion.local")
            res = await db.execute(stmt)
            user = res.unique().scalar_one_or_none()
            if user:
                return user
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token required",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = decode_token(token)
    if not payload or not payload.get("sub"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    email = payload.get("sub")
    stmt = select(User).where(User.email == email)
    res = await db.execute(stmt)
    user = res.unique().scalar_one_or_none()

    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account inactive or not found",
        )

    return user

def require_role(allowed_roles: List[str]):
    """RBAC dependency to enforce permitted roles."""
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        user_roles = [r.name for r in current_user.roles] if current_user.roles else ["VIEWER"]
        if "ADMIN" in user_roles:
            return current_user # Admin has superuser privileges
        
        has_permission = any(role in allowed_roles for role in user_roles)
        if not has_permission:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Requires one of roles: {', '.join(allowed_roles)}"
            )
        return current_user
    return role_checker

async def record_audit_log(
    db: AsyncSession,
    user_email: str,
    role: str,
    action: str,
    resource_type: str,
    resource_id: Optional[str] = None,
    status_result: str = "SUCCESS",
    details: Optional[dict] = None,
    ip_address: Optional[str] = None
):
    """Helper to record an immutable audit entry."""
    try:
        log_entry = AuditLog(
            user_email=user_email,
            role=role,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            status=status_result,
            details=details or {},
            ip_address=ip_address
        )
        db.add(log_entry)
        await db.commit()
    except Exception as e:
        print(f"[Audit Log Error] Failed to write audit log: {e}")
