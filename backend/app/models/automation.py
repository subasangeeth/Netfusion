from sqlalchemy import Column, Integer, String, Text, DateTime, JSON
from datetime import datetime
from app.core.database import Base

class AutomationJob(Base):
    __tablename__ = "automation_jobs"

    id = Column(Integer, primary_key=True, index=True)
    job_type = Column(String(100), nullable=False) # config_backup, connectivity_test, route_injection, firewall_policy
    target_device = Column(String(100), nullable=False) # netfusion-router, etc.
    status = Column(String(50), default="pending") # pending, running, completed, failed
    params = Column(JSON, nullable=True)
    output = Column(Text, nullable=True)
    initiated_by = Column(String(100), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    completed_at = Column(DateTime, nullable=True)
