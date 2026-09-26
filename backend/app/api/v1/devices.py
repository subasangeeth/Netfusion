from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.device import Device
from app.schemas.all_schemas import DeviceResponse
from app.api.deps import get_current_user

router = APIRouter(prefix="/devices", tags=["Devices"])

@router.get("", response_model=List[DeviceResponse])
async def list_devices(
    tier: Optional[str] = Query(None, description="Filter by tier (onprem, transit, cloud)"),
    status: Optional[str] = Query(None, description="Filter by status (online, warning, critical)"),
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    query = select(Device)
    if tier:
        query = query.where(Device.tier == tier)
    if status:
        query = query.where(Device.status == status)
    
    res = await db.execute(query)
    devices = res.scalars().all()
    return devices

@router.get("/{device_id}", response_model=DeviceResponse)
async def get_device(
    device_id: str,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    stmt = select(Device).where((Device.device_id == device_id) | (Device.hostname == device_id))
    res = await db.execute(stmt)
    device = res.scalar_one_or_none()
    if not device:
        raise HTTPException(status_code=404, detail=f"Device {device_id} not found")
    return device

@router.get("/{device_id}/health")
async def get_device_health(
    device_id: str,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    stmt = select(Device).where((Device.device_id == device_id) | (Device.hostname == device_id))
    res = await db.execute(stmt)
    device = res.scalar_one_or_none()
    if not device:
        raise HTTPException(status_code=404, detail=f"Device {device_id} not found")

    return {
        "device_id": device.device_id,
        "hostname": device.hostname,
        "status": device.status,
        "cpu_usage": device.cpu_usage,
        "memory_usage": device.memory_usage,
        "ip_address": device.ip_address,
        "zone": device.zone,
        "tier": device.tier,
        "is_healthy": device.status == "online",
        "last_seen": device.last_seen
    }
