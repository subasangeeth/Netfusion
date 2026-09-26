from sqlalchemy import Column, Integer, String, Text, DateTime
from datetime import datetime
from app.core.database import Base

class TerraformRun(Base):
    __tablename__ = "terraform_runs"

    id = Column(Integer, primary_key=True, index=True)
    environment = Column(String(50), default="dev") # dev, prod
    action = Column(String(50), nullable=False) # plan, apply, destroy, validate
    status = Column(String(50), default="pending") # pending, running, succeeded, failed, requires_confirmation
    initiated_by = Column(String(100), nullable=False) # user email
    plan_summary = Column(Text, nullable=True) # e.g. "Plan: 5 to add, 0 to change, 0 to destroy."
    stdout = Column(Text, nullable=True)
    stderr = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
