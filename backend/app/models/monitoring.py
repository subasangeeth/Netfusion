from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime
from app.core.database import Base

class MonitoringMetric(Base):
    __tablename__ = "monitoring_metrics"

    id = Column(Integer, primary_key=True, index=True)
    target_id = Column(String(100), nullable=False) # e.g. "netfusion-router" or "i-09ab12cd"
    target_type = Column(String(50), nullable=False) # container, ec2, vpn, interface
    metric_name = Column(String(100), nullable=False) # cpu_utilization, memory_usage, throughput_bps, latency_ms
    value = Column(Float, nullable=False)
    unit = Column(String(20), default="%") # %, Mbps, ms, bytes
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
