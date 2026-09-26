from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.security import verify_password, create_access_token, create_refresh_token, decode_token
from app.models.user import User
from app.schemas.all_schemas import Token, UserLogin, UserResponse
from app.api.deps import get_current_user, record_audit_log

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=Token)
async def login(credentials: UserLogin, request: Request, db: AsyncSession = Depends(get_db)):
    stmt = select(User).where(User.email == credentials.email)
    res = await db.execute(stmt)
    user = res.unique().scalar_one_or_none()

    if not user or not verify_password(credentials.password, user.hashed_password):
        await record_audit_log(
            db, credentials.email, "UNKNOWN", "LOGIN_FAILED", "User", None, "FAILED",
            {"reason": "Invalid credentials"}, request.client.host if request.client else None
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )

    user_role = user.roles[0].name if user.roles else "VIEWER"
    access_token = create_access_token(data={"sub": user.email, "role": user_role})
    refresh_token = create_refresh_token(data={"sub": user.email, "role": user_role})

    await record_audit_log(
        db, user.email, user_role, "LOGIN_SUCCESS", "User", str(user.id), "SUCCESS",
        None, request.client.host if request.client else None
    )

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "role": user_role,
        "email": user.email
    }

@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(current_user: User = Depends(get_current_user)):
    user_role = current_user.roles[0].name if current_user.roles else "VIEWER"
    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "role": user_role,
        "is_active": current_user.is_active,
        "created_at": current_user.created_at
    }
