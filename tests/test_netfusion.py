import unittest
import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from app.services.network_service import NetworkService
from app.services.ai_service import AiDiagnosticEngine
from app.services.vpn_service import VpnService
from app.services.aws_service import AwsService
from app.services.security_service import SecurityService
from app.services.terraform_service import TerraformService

class TestNetFusionCore(unittest.TestCase):
    def test_cidr_validation(self):
        """Test IPv4 CIDR validation logic."""
        self.assertTrue(NetworkService.validate_cidr("10.10.10.0/24"))
        self.assertTrue(NetworkService.validate_cidr("10.20.0.0/16"))
        self.assertTrue(NetworkService.validate_cidr("10.50.0.1/30"))
        self.assertFalse(NetworkService.validate_cidr("invalid-cidr"))
        self.assertFalse(NetworkService.validate_cidr("999.999.999.999/24"))

    def test_ip_validation(self):
        """Test IP address validation logic."""
        self.assertTrue(NetworkService.validate_ip("10.10.10.1"))
        self.assertTrue(NetworkService.validate_ip("192.168.1.1"))
        self.assertFalse(NetworkService.validate_ip("300.1.1.1"))

    def test_connectivity_probe_simulation(self):
        """Test safe connectivity test simulation."""
        res = NetworkService.execute_connectivity_test("netfusion-client-01", "10.10.30.10", "ping")
        self.assertEqual(res["target"], "10.10.30.10")
        self.assertEqual(res["test_type"], "ping")
        self.assertTrue(res["success"])

    def test_vpn_telemetry(self):
        """Test WireGuard telemetry structure."""
        telemetry = VpnService.get_vpn_telemetry()
        self.assertEqual(telemetry["vpn_type"], "WireGuard")
        self.assertEqual(telemetry["status"], "CONNECTED")
        self.assertEqual(telemetry["onprem_cidr"], "10.10.0.0/16")
        self.assertEqual(telemetry["aws_cidr"], "10.20.0.0/16")
        self.assertIn("latency_ms", telemetry)

    def test_aws_demo_resources(self):
        """Test AWS resources query."""
        resources = AwsService.get_vpc_resources()
        self.assertGreaterEqual(len(resources), 5)
        vpc = next((r for r in resources if r["resource_type"] == "vpc"), None)
        self.assertIsNotNone(vpc)
        self.assertEqual(vpc["cidr_or_ip"], "10.20.0.0/16")

    def test_ai_allowlisted_diagnostics(self):
        """Test AI diagnostic engine with allowlisted tools."""
        res = AiDiagnosticEngine.diagnose_query("Why can't the on-prem server reach the AWS application?")
        self.assertIn("get_vpn_status", res["executed_tools"])
        self.assertIn("get_routes", res["executed_tools"])
        self.assertGreater(len(res["observed_evidence"]), 0)
        self.assertGreater(len(res["possible_causes"]), 0)
        self.assertGreater(len(res["recommended_remediation"]), 0)
        self.assertFalse(res["requires_confirmation"])

    def test_security_safe_attack_simulation(self):
        """Test controlled in-lab attack simulator."""
        sim = SecurityService.run_safe_attack_simulation("port_scan", "10.10.30.10")
        self.assertEqual(sim["status"], "DETECTED")
        self.assertIn("Suricata", sim["detected_by"])

    def test_terraform_safety_gate(self):
        """Test that destructive Terraform actions require explicit confirmation."""
        # Unconfirmed apply should trigger safety gate
        res = TerraformService.run_terraform("apply", env="dev", confirm=False)
        self.assertEqual(res["status"], "requires_confirmation")
        self.assertIn("SAFETY GATE TRIGGERED", res["stdout"])

        # Plan requires no confirmation
        plan_res = TerraformService.run_terraform("plan", env="dev", confirm=False)
        self.assertEqual(plan_res["status"], "succeeded")

if __name__ == "__main__":
    unittest.main()
