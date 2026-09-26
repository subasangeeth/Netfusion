import pytest
import os
import sys

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "backend")))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "platform" in data
    assert data["status"] == "OPERATIONAL"

def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "HEALTHY"

def test_vpn_status_endpoint():
    response = client.get("/api/v1/vpn/status")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "CONNECTED"
    assert data["vpn_type"] == "WireGuard"
    assert data["onprem_cidr"] == "10.10.0.0/16"
    assert data["aws_cidr"] == "10.20.0.0/16"

def test_aws_resources_endpoint():
    response = client.get("/api/v1/aws/resources")
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0

def test_monitoring_overview():
    response = client.get("/api/v1/monitoring/overview")
    assert response.status_code == 200
    data = response.json()
    assert data["devices_online"] >= 1
    assert data["health_score"] > 90

def test_ai_allowlisted_diagnostic():
    payload = {"message": "Why can't the on-prem server reach the AWS application?"}
    response = client.post("/api/v1/ai/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert len(data["executed_tools"]) > 0
    assert "get_vpn_status" in data["executed_tools"]
    assert len(data["recommended_remediation"]) > 0

def test_security_simulation():
    payload = {"simulation_type": "port_scan", "target": "10.10.30.10"}
    response = client.post("/api/v1/security/simulate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "DETECTED"
    assert "Suricata" in data["detected_by"]
