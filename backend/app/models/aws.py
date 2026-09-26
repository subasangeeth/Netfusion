from sqlalchemy import Column, Integer, String, DateTime, JSON
from datetime import datetime
from app.core.database import Base

class AwsResource(Base):
    __tablename__ = "aws_resources"

    id = Column(Integer, primary_key=True, index=True)
    resource_id = Column(String(100), unique=True, index=True, nullable=False) # vpc-xxxx, i-xxxx, sg-xxxx
    resource_type = Column(String(50), nullable=False) # vpc, subnet, ec2, security_group, route_table, nat_gateway
    region = Column(String(50), default="us-east-1")
    name = Column(String(100), nullable=True)
    status = Column(String(50), default="available") # available, running, stopped
    cidr_or_ip = Column(String(100), nullable=True) # 10.20.0.0/16 or 10.20.1.15
    vpc_id = Column(String(100), nullable=True)
    details = Column(JSON, nullable=True) # JSON details, tags, subnets
    is_simulated = Column(String(10), default="false") # "true" if demo mode, "false" if live Boto3
    synced_at = Column(DateTime, default=datetime.utcnow)
