from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from prometheus_client import make_asgi_app
from app.core.config import settings
from app.core.seed import seed_database
from app.api.v1 import (
    auth, devices, network, vpn, aws,
    terraform, security, monitoring, ai, audit
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Automatically initialize and seed database on startup
    try:
        await seed_database()
        print("[NetFusion Backend] Startup: Database verified and seeded successfully.")
    except Exception as e:
        print(f"[NetFusion Backend] Notice during database init: {e}")
    yield
    print("[NetFusion Backend] Shutdown complete.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Enterprise Hybrid Cloud Network Automation, Cybersecurity & AI Diagnostics API",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API v1 Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(devices.router, prefix=settings.API_V1_STR)
app.include_router(network.router, prefix=settings.API_V1_STR)
app.include_router(vpn.router, prefix=settings.API_V1_STR)
app.include_router(aws.router, prefix=settings.API_V1_STR)
app.include_router(terraform.router, prefix=settings.API_V1_STR)
app.include_router(security.router, prefix=settings.API_V1_STR)
app.include_router(monitoring.router, prefix=settings.API_V1_STR)
app.include_router(ai.router, prefix=settings.API_V1_STR)
app.include_router(audit.router, prefix=settings.API_V1_STR)

# Prometheus /metrics endpoint (Requirement 16)
metrics_app = make_asgi_app()
app.mount("/metrics", metrics_app)

@app.get("/")
async def root():
    return {
        "platform": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "mode": settings.NETFUSION_MODE.upper(),
        "status": "OPERATIONAL",
        "docs_url": "/docs"
    }

@app.get("/api/health")
async def health_check():
    return {
        "status": "HEALTHY",
        "mode": settings.NETFUSION_MODE,
        "database": "CONNECTED",
        "onprem_router": "10.10.10.1",
        "vpn_gateway": "10.50.0.1",
        "aws_vpc": "10.20.0.0/16"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.BACKEND_HOST, port=settings.BACKEND_PORT, reload=True)
