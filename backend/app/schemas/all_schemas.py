from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

# ================= AUTH SCHEMAS =================
class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    role: str
    email: str

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    role: Optional[str] = None
    exp: Optional[int] = None

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: Optional[str]
    role: str
    is_active: bool
    created_at: datetime
    class Config:
        from_attributes = True

# ================= DEVICE SCHEMAS =================
class DeviceResponse(BaseModel):
    id: int
    device_id: str
    hostname: str
    ip_address: str
    device_type: str
    tier: str
    zone: str
    status: str
    cpu_usage: float
    memory_usage: float
    model: Optional[str]
    os_info: str
    last_seen: datetime
    class Config:
        from_attributes = True

# ================= NETWORK SCHEMAS =================
class InterfaceResponse(BaseModel):
    id: int
    device_id: int
    name: str
    mac_address: Optional[str]
    ip_address: Optional[str]
    mtu: int
    state: str
    rx_bytes: int
    tx_bytes: int
    class Config:
        from_attributes = True

class RouteResponse(BaseModel):
    id: int
    destination_cidr: str
    next_hop: str
    interface_name: str
    metric: int
    is_active: bool
    created_at: datetime
    class Config:
        from_attributes = True

class RouteCreateRequest(BaseModel):
    destination_cidr: str = Field(..., example="10.20.0.0/16")
    next_hop: str = Field(..., example="10.10.100.10")
    interface_name: str = Field(..., example="eth4")
    metric: int = Field(default=100)

class ConnectivityTestRequest(BaseModel):
    source_device: str = Field(default="netfusion-client-01", example="netfusion-client-01")
    target_host: str = Field(..., example="10.10.30.10")
    test_type: str = Field(default="ping", example="ping") # ping, tcp_probe, http_get, traceroute
    port: int = Field(default=8080)

class ConnectivityTestResult(BaseModel):
    source: str
    target: str
    test_type: str
    port: Optional[int]
    success: bool
    latency_ms: Optional[float]
    output: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

# ================= VPN SCHEMAS =================
class VpnStatusResponse(BaseModel):
    id: int
    name: str
    vpn_type: str
    status: str
    local_endpoint: str
    remote_endpoint: str
    local_tunnel_ip: str
    remote_tunnel_ip: str
    onprem_cidr: str
    aws_cidr: str
    allowed_networks: str
    public_key: Optional[str]
    peer_public_key: Optional[str]
    last_handshake: Optional[datetime]
    last_handshake_seconds_ago: Optional[int]
    connected_time_seconds: int
    rx_bytes: int
    tx_bytes: int
    latency_ms: float
    is_demo: bool = False
    class Config:
        from_attributes = True

# ================= AWS SCHEMAS =================
class AwsResourceResponse(BaseModel):
    id: int
    resource_id: str
    resource_type: str
    region: str
    name: Optional[str]
    status: str
    cidr_or_ip: Optional[str]
    vpc_id: Optional[str]
    details: Optional[Dict[str, Any]]
    is_simulated: str
    synced_at: datetime
    class Config:
        from_attributes = True

# ================= SECURITY SCHEMAS =================
class SecurityEventResponse(BaseModel):
    id: int
    source_ip: str
    dest_ip: str
    protocol: str
    src_port: Optional[int]
    dest_port: Optional[int]
    severity: str
    rule_id: Optional[str]
    rule_name: str
    payload_snippet: Optional[str]
    status: str
    timestamp: datetime
    class Config:
        from_attributes = True

class AlertResponse(BaseModel):
    id: int
    title: str
    message: str
    severity: str
    category: str
    source: str
    is_resolved: bool
    acknowledged_by: Optional[str]
    created_at: datetime
    class Config:
        from_attributes = True

class AttackSimulationRequest(BaseModel):
    simulation_type: str = Field(..., example="port_scan") # port_scan, failed_login, icmp_flood
    target: str = Field(default="10.10.30.10")

class AttackSimulationResponse(BaseModel):
    simulation_type: str
    target: str
    status: str
    details: str
    detected_by: str = "Suricata IDS (local.rules)"
    event_id: Optional[int] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

# ================= TERRAFORM SCHEMAS =================
class TerraformRunRequest(BaseModel):
    action: str = Field(..., example="plan") # plan, apply, validate, destroy
    environment: str = Field(default="dev")
    confirm_destructive: bool = False

class TerraformRunResponse(BaseModel):
    id: int
    environment: str
    action: str
    status: str
    initiated_by: str
    plan_summary: Optional[str]
    stdout: Optional[str]
    stderr: Optional[str]
    created_at: datetime
    completed_at: Optional[datetime]
    class Config:
        from_attributes = True

# ================= AI SCHEMAS =================
class AiChatRequest(BaseModel):
    conversation_id: Optional[int] = None
    message: str
    confirm_action: bool = False

class AiChatResponse(BaseModel):
    conversation_id: int
    reply: str
    observed_evidence: List[Dict[str, Any]] = []
    possible_causes: List[str] = []
    recommended_checks: List[str] = []
    recommended_remediation: List[str] = []
    executed_tools: List[str] = []
    requires_confirmation: bool = False
    pending_action: Optional[str] = None

# ================= AUDIT SCHEMAS =================
class AuditLogResponse(BaseModel):
    id: int
    user_email: str
    role: str
    action: str
    resource_type: str
    resource_id: Optional[str]
    status: str
    details: Optional[Dict[str, Any]]
    ip_address: Optional[str]
    timestamp: datetime
    class Config:
        from_attributes = True
