from sqlalchemy import Column, Integer, String, Float, DateTime, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class Device(Base):
    __tablename__ = "devices"

    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(String(50), unique=True, index=True, nullable=False) # e.g. "netfusion-router"
    hostname = Column(String(100), nullable=False)
    ip_address = Column(String(50), nullable=False)
    device_type = Column(String(50), nullable=False) # router, firewall, server, client, vpn_gateway
    tier = Column(String(50), default="onprem") # onprem, transit, cloud
    zone = Column(String(50), default="onprem-management")
    status = Column(String(20), default="online") # online, warning, critical, offline
    cpu_usage = Column(Float, default=0.0)
    memory_usage = Column(Float, default=0.0)
    model = Column(String(100), nullable=True)
    os_info = Column(String(100), default="Linux")
    created_at = Column(DateTime, default=datetime.utcnow)
    last_seen = Column(DateTime, default=datetime.utcnow)

    interfaces = relationship("Interface", back_populates="device", cascade="all, delete-orphan")
