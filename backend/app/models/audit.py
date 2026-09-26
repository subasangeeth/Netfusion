from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    user_email = Column(String(100), nullable=False)
    role = Column(String(50), default="VIEWER")
    action = Column(String(100), nullable=False) # e.g. "ROUTE_ADD", "TERRAFORM_APPLY", "AI_TOOL_CALL"
    resource_type = Column(String(50), nullable=False) # Route, Device, Firewall, Terraform, AI
    resource_id = Column(String(100), nullable=True)
    status = Column(String(20), default="SUCCESS") # SUCCESS, FAILED, DENIED
    details = Column(JSON, nullable=True)
    ip_address = Column(String(50), nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)

    user = relationship("User", back_populates="audit_logs")
