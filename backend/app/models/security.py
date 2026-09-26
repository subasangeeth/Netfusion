from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean
from datetime import datetime
from app.core.database import Base

class SecurityEvent(Base):
    __tablename__ = "security_events"

    id = Column(Integer, primary_key=True, index=True)
    source_ip = Column(String(50), nullable=False)
    dest_ip = Column(String(50), nullable=False)
    protocol = Column(String(20), default="TCP")
    src_port = Column(Integer, nullable=True)
    dest_port = Column(Integer, nullable=True)
    severity = Column(String(20), default="medium") # critical, high, medium, low, info
    rule_id = Column(String(50), nullable=True) # e.g. "SURICATA-2001219"
    rule_name = Column(String(255), nullable=False) # e.g. "ET SCAN Potential Nmap SYN Scan"
    payload_snippet = Column(Text, nullable=True)
    status = Column(String(20), default="new") # new, triaged, resolved
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    severity = Column(String(20), default="warning") # critical, warning, info
    category = Column(String(50), default="network") # network, security, vpn, cloud, system
    source = Column(String(100), nullable=False) # e.g. "Suricata IDS", "WireGuard Engine"
    is_resolved = Column(Boolean, default=False)
    acknowledged_by = Column(String(100), nullable=True)
    resolved_by = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    resolved_at = Column(DateTime, nullable=True)
