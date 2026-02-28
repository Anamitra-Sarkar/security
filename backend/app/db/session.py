"""
Database connection and session management.
Env vars: DATABASE_URL
"""
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker

from backend.app.core.config import settings

engine = create_async_engine(settings.DATABASE_URL, echo=settings.DEBUG, pool_size=10)
async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def get_session() -> AsyncSession:
    async with async_session() as session:
        yield session


async def init_db():
    from backend.app.models.schemas import Base
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
