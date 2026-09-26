from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from app.core.config import settings
import logging

logger = logging.getLogger("netfusion.database")

Base = declarative_base()

# Configure database engine with fallback handling
try:
    if settings.NETFUSION_MODE == "demo" and not settings.POSTGRES_HOST.startswith("postgres"):
        # For lightweight local execution without full postgres container, allow sqlite async fallback
        import os
        db_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "netfusion.db"))
        DATABASE_URL = f"sqlite+aiosqlite:///{db_path}"
    else:
        DATABASE_URL = settings.ASYNC_DATABASE_URL
except Exception:
    DATABASE_URL = settings.ASYNC_DATABASE_URL

engine = create_async_engine(
    DATABASE_URL,
    echo=False,
    future=True,
    pool_pre_ping=True
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)

async def get_db():
    """Dependency for providing database sessions to endpoints."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
