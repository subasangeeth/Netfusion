from typing import List, Dict, Any
from datetime import datetime, timedelta
import random
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.api.deps import get_current_user

router = APIRouter(prefix="/monitoring", tags=["Monitoring & Telemetry"])

@router.get("/metrics")
async def get_metrics(current_user = Depends(get_current_user)):
    """Returns telemetry time-series metrics matching Recharts schemas."""
    now = datetime.utcnow()
    points = []
    
    # Generate 12 time-series sample data points over the last hour
    for i in range(12, -1, -1):
        t = now - timedelta(minutes=i * 5)
        points.append({
            "timestamp": t.strftime("%H:%M"),
            "cpu_router": round(24.0 + random.uniform(-3, 6), 1),
            "cpu_firewall": round(18.0 + random.uniform(-2, 4), 1),
            "cpu_app": round(32.0 + random.uniform(-5, 10), 1),
            "cpu_aws_bastion": round(12.0 + random.uniform(-1, 3), 1),
            "memory_usage": round(46.0 + random.uniform(-2, 3), 1),
            "throughput_in_mbps": round(145.2 + random.uniform(-15, 25), 1),
            "throughput_out_mbps": round(198.6 + random.uniform(-20, 30), 1),
            "vpn_latency_ms": round(11.4 + random.uniform(-0.6, 1.2), 1),
            "direct_connect_latency_ms": 8.4
        })

    return {
        "status": "UP",
        "scrape_interval_seconds": 15,
        "active_targets": 7,
        "time_series": points,
        "system_health_score": 98.4
    }

@router.get("/overview")
async def get_overview_kpis(current_user = Depends(get_current_user)):
    """KPI summary cards for the NOC dashboard."""
    return {
        "total_devices": 7,
        "devices_online": 7,
        "critical_alerts": 0,
        "warning_alerts": 2,
        "vpn_status": "CONNECTED",
        "vpn_latency": "11.4 ms",
        "aws_vpcs": 1,
        "aws_instances": 2,
        "network_throughput": "343.8 Mbps",
        "health_score": 98.4,
        "mode": "DEMO"
    }
