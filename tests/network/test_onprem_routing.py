import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "backend")))

from app.services.network_service import NetworkService

def test_cidr_validation():
    assert NetworkService.validate_cidr("10.10.10.0/24") is True
    assert NetworkService.validate_cidr("10.20.0.0/16") is True
    assert NetworkService.validate_cidr("10.50.0.1/30") is True
    assert NetworkService.validate_cidr("999.999.999.999/24") is False
    assert NetworkService.validate_cidr("invalid-cidr") is False

def test_ip_validation():
    assert NetworkService.validate_ip("10.10.10.1") is True
    assert NetworkService.validate_ip("192.168.1.1") is True
    assert NetworkService.validate_ip("300.1.1.1") is False

def test_connectivity_probe_simulation():
    res = NetworkService.execute_connectivity_test("netfusion-client-01", "10.10.30.10", "ping")
    assert "target" in res
    assert res["target"] == "10.10.30.10"
    assert res["test_type"] == "ping"
