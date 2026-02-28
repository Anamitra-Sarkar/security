"""
Authentication routes for user registration and login.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from backend.app.api.models import AuthRequest, TokenResponse
from backend.app.core.auth import hash_password, verify_password, create_access_token
from backend.app.db.session import get_session
from backend.app.models.schemas import User

router = APIRouter(prefix="/api/auth", tags=["authentication"])


@router.post("/register", response_model=TokenResponse, status_code=201)
async def register(req: AuthRequest, session: AsyncSession = Depends(get_session)):
    """Register a new user."""
    stmt = select(User).where(User.email == req.email)
    existing = await session.execute(stmt)
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Email already registered")

    user = User(email=req.email, hashed_password=hash_password(req.password))
    session.add(user)
    await session.commit()
    token = create_access_token(subject=user.id)
    return TokenResponse(access_token=token)


@router.post("/login", response_model=TokenResponse)
async def login(req: AuthRequest, session: AsyncSession = Depends(get_session)):
    """Login with email and password."""
    stmt = select(User).where(User.email == req.email)
    result = await session.execute(stmt)
    user = result.scalar_one_or_none()
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token(subject=user.id)
    return TokenResponse(access_token=token)
