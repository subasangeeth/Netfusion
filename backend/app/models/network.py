from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, BigInteger
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class Network(Base):
    __tablename__ = "networks"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False) # e.g. "onprem-users"
    cidr = Column(String(50), nullable=False) # e.g. "10.10.20.0/24"
    gateway = Column(String(50), nullable=False) # e.g. "10.10.20.1"
    vlan_id = Column(Integer, nullable=True) # e.g. 20 (Simulated / Linux bridge)
    zone = Column(String(50), nullable=False) # Users, Servers, Management, Security, Transit
    description = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    routes = relationship("Route", back_populates="network", cascade="all, delete-orphan")

class Interface(Base):
    __tablename__ = "interfaces"

    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(Integer, ForeignKey("devices.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(50), nullable=False) # eth0, wg0, eth0.20
    mac_address = Column(String(50), nullable=True)
    ip_address = Column(String(50), nullable=True)
    mtu = Column(Integer, default=1500)
    state = Column(String(20), default="UP") # UP, DOWN
    rx_bytes = Column(BigInteger, default=0)
    tx_bytes = Column(BigInteger, default=0)
    rx_packets = Column(BigInteger, default=0)
    tx_packets = Column(BigInteger, default=0)
    last_updated = Column(DateTime, default=datetime.utcnow)

    device = relationship("Device", back_populates="interfaces")

class Route(Base):
    __tablename__ = "routes"

    id = Column(Integer, primary_key=True, index=True)
    network_id = Column(Integer, ForeignKey("networks.id", ondelete="CASCADE"), nullable=True)
    device_id = Column(Integer, ForeignKey("devices.id", ondelete="CASCADE"), nullable=True)
    destination_cidr = Column(String(50), nullable=False) # e.g. "10.20.0.0/16"
    next_hop = Column(String(50), nullable=False) # e.g. "10.10.100.10"
    interface_name = Column(String(50), nullable=False) # e.g. "eth4" or "wg0"
    metric = Column(Integer, default=100)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    network = relationship("Network", back_populates="routes")
