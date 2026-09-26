from sqlalchemy import Column, Integer, String, BigInteger, DateTime, Float
from datetime import datetime
from app.core.database import Base

class VpnConnection(Base):
    __tablename__ = "vpn_connections"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False) # e.g. "WireGuard Hybrid Tunnel"
    vpn_type = Column(String(50), default="WireGuard") # WireGuard or IPsec
    status = Column(String(20), default="CONNECTED") # CONNECTED, DEGRADED, DISCONNECTED
    local_endpoint = Column(String(100), nullable=False) # 10.10.100.10:51820
    remote_endpoint = Column(String(100), nullable=False) # 10.20.1.50:51820
    local_tunnel_ip = Column(String(50), default="10.50.0.1/30")
    remote_tunnel_ip = Column(String(50), default="10.50.0.2/30")
    onprem_cidr = Column(String(50), default="10.10.0.0/16")
    aws_cidr = Column(String(50), default="10.20.0.0/16")
    allowed_networks = Column(String(255), default="10.20.0.0/16, 10.50.0.2/32")
    public_key = Column(String(100), nullable=True)
    peer_public_key = Column(String(100), nullable=True)
    last_handshake = Column(DateTime, default=datetime.utcnow)
    connected_time_seconds = Column(Integer, default=3600)
    rx_bytes = Column(BigInteger, default=10485760)
    tx_bytes = Column(BigInteger, default=15728640)
    latency_ms = Column(Float, default=12.4)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
