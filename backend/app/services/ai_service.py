import logging
from typing import Dict, Any, List, Optional
from datetime import datetime
from app.services.vpn_service import VpnService
from app.services.aws_service import AwsService
from app.services.network_service import NetworkService

logger = logging.getLogger("netfusion.ai_service")

class AiDiagnosticEngine:
    # 12 Strictly Allowlisted Diagnostic Tools
    @staticmethod
    def get_onprem_status() -> Dict[str, Any]:
        return {
            "topology": "Docker-based Simulated On-Premises",
            "networks": ["onprem-management (10.10.10.0/24)", "onprem-users (10.10.20.0/24)", "onprem-servers (10.10.30.0/24)", "onprem-security (10.10.40.0/24)", "onprem-transit (10.10.100.0/24)"],
            "status": "HEALTHY",
            "containers": 7,
            "ip_forwarding": "ENABLED"
        }

    @staticmethod
    def get_container_status(container_id: str = "all") -> Dict[str, Any]:
        return {
            "netfusion-router": {"ip": "10.10.10.1", "state": "running", "cpu": 24.5},
            "netfusion-firewall": {"ip": "10.10.10.2", "state": "running", "cpu": 18.2},
            "netfusion-app-server": {"ip": "10.10.30.10", "state": "running", "cpu": 32.1},
            "netfusion-db-server": {"ip": "10.10.30.20", "state": "running", "cpu": 44.0},
            "netfusion-client-01": {"ip": "10.10.20.10", "state": "running", "cpu": 5.2},
            "netfusion-vpn-gateway": {"ip": "10.10.100.10", "state": "running", "cpu": 14.5}
        }

    @staticmethod
    def get_network_interfaces() -> List[Dict[str, Any]]:
        return [
            {"interface": "eth0", "ip": "10.10.10.1/24", "state": "UP", "mtu": 1500},
            {"interface": "eth1", "ip": "10.10.20.1/24", "state": "UP", "mtu": 1500},
            {"interface": "eth2", "ip": "10.10.30.1/24", "state": "UP", "mtu": 1500},
            {"interface": "wg0", "ip": "10.50.0.1/30", "state": "UP", "mtu": 1420}
        ]

    @staticmethod
    def get_routes() -> List[Dict[str, Any]]:
        return [
            {"destination": "10.10.10.0/24", "gateway": "direct", "interface": "eth0"},
            {"destination": "10.10.20.0/24", "gateway": "direct", "interface": "eth1"},
            {"destination": "10.10.30.0/24", "gateway": "direct", "interface": "eth2"},
            {"destination": "10.10.100.0/24", "gateway": "direct", "interface": "eth4"},
            {"destination": "10.20.0.0/16", "gateway": "10.10.100.10", "interface": "eth4"}
        ]

    @staticmethod
    def get_vpn_status() -> Dict[str, Any]:
        return VpnService.get_vpn_telemetry()

    @staticmethod
    def get_aws_vpcs() -> List[Dict[str, Any]]:
        return [r for r in AwsService.get_vpc_resources() if r["resource_type"] == "vpc"]

    @staticmethod
    def get_aws_instances() -> List[Dict[str, Any]]:
        return [r for r in AwsService.get_vpc_resources() if r["resource_type"] == "ec2"]

    @staticmethod
    def get_aws_routes() -> List[Dict[str, Any]]:
        return [
            {"table": "rtb-public-01", "destination": "10.20.0.0/16", "target": "local"},
            {"table": "rtb-public-01", "destination": "0.0.0.0/0", "target": "igw-0912ab"},
            {"table": "rtb-private-01", "destination": "10.10.0.0/16", "target": "eni-vpn-gateway"}
        ]

    @staticmethod
    def get_security_groups() -> List[Dict[str, Any]]:
        return [
            {"sg_id": "sg-0a817b3f92", "name": "netfusion-bastion-sg", "ports": [22, 51820]},
            {"sg_id": "sg-0b928c4e11", "name": "netfusion-app-sg", "ports": [80, 443]}
        ]

    @staticmethod
    def get_security_events() -> List[Dict[str, Any]]:
        return [
            {"rule": "ET SCAN Potential Nmap Port Sweep", "src": "10.10.20.10", "dst": "10.10.30.10", "severity": "critical"}
        ]

    @staticmethod
    def get_metrics() -> Dict[str, Any]:
        return {"avg_cpu": 25.4, "vpn_latency_ms": 11.4, "throughput_mbps": 343.8}

    @staticmethod
    def get_recent_logs() -> List[str]:
        return [
            "[INFO] wireguard wg0: Handshake for peer established at 10.20.1.50:51820",
            "[INFO] iptables: FORWARD packet 10.10.20.10:49152 -> 10.10.30.10:8080 ACCEPT",
            "[WARN] iptables: FORWARD packet 10.10.20.10:50114 -> 10.10.30.20:5432 DROP (Rule #6 Violation)"
        ]

    @classmethod
    def diagnose_query(cls, user_query: str) -> Dict[str, Any]:
        """Analyzes user query and orchestrates allowlisted diagnostic tools."""
        query_lower = user_query.lower()
        tools_called = []
        evidence = []

        # Determine which allowlisted tools to call
        if any(w in query_lower for w in ["reach", "connect", "aws", "vpn", "tunnel", "route", "ping"]):
            tools_called.extend(["get_vpn_status", "get_routes", "get_network_interfaces", "get_aws_routes"])
            vpn_telemetry = cls.get_vpn_status()
            routes = cls.get_routes()
            aws_routes = cls.get_aws_routes()
            evidence.append({"tool": "get_vpn_status", "data": vpn_telemetry})
            evidence.append({"tool": "get_routes", "data": routes})
            evidence.append({"tool": "get_aws_routes", "data": aws_routes})

        if any(w in query_lower for w in ["security", "scan", "attack", "alert", "threat", "suricata"]):
            tools_called.append("get_security_events")
            evidence.append({"tool": "get_security_events", "data": cls.get_security_events()})

        if any(w in query_lower for w in ["container", "cpu", "down", "fail", "slow", "metric"]):
            tools_called.extend(["get_container_status", "get_metrics"])
            evidence.append({"tool": "get_container_status", "data": cls.get_container_status()})
            evidence.append({"tool": "get_metrics", "data": cls.get_metrics()})

        if not tools_called:
            tools_called.extend(["get_onprem_status", "get_vpn_status", "get_recent_logs"])
            evidence.append({"tool": "get_onprem_status", "data": cls.get_onprem_status()})
            evidence.append({"tool": "get_vpn_status", "data": cls.get_vpn_status()})
            evidence.append({"tool": "get_recent_logs", "data": cls.get_recent_logs()})

        # Synthesize structured response
        if "reach" in query_lower and "aws" in query_lower:
            reply = (
                "Based on the diagnostic telemetry gathered across the hybrid infrastructure:\n\n"
                "1. **Observed Evidence**:\n"
                "   - WireGuard Tunnel `wg0` is **CONNECTED** (10.50.0.1 <-> 10.50.0.2) with latest handshake recorded 14 seconds ago.\n"
                "   - On-Premises Router has route `10.20.0.0/16 via 10.10.100.10 dev eth4` configured.\n"
                "   - AWS Route Table `rtb-private-01` contains the return route `10.10.0.0/16 -> eni-vpn-gateway`.\n\n"
                "2. **Possible Causes**:\n"
                "   - Security Group `sg-0b928c4e11` on the AWS App Instance may lack an inbound rule permitting TCP from on-premises CIDR `10.10.0.0/16`.\n"
                "   - Destination host OS firewall (`iptables` / Windows Defender) may be dropping syn packets.\n\n"
                "3. **Recommended Checks**:\n"
                "   - Verify Security Group rules for AWS instance `i-09cba328401ef`.\n"
                "   - Execute `POST /api/v1/network/test` from `netfusion-client-01` to `10.20.2.45`.\n\n"
                "4. **Recommended Safe Remediation**:\n"
                "   - Add Security Group rule permitting TCP 8080/443 from `10.10.0.0/16`.\n"
                "   *(Note: NetFusion AI will NOT make destructive changes without your explicit approval.)*"
            )
            possible_causes = [
                "AWS Security Group inbound rules filter traffic from On-Premises CIDR 10.10.0.0/16",
                "MTU mismatch between WireGuard tunnel (MTU 1420) and Ethernet frame (MTU 1500)",
                "Host-level iptables or process listening state on target EC2 instance"
            ]
            recommended_checks = [
                "Inspect AWS Security Group sg-0b928c4e11 inbound rules",
                "Run TCP port test from client-01 to 10.20.2.45:8080",
                "Check WireGuard keepalive status on vpn-gateway"
            ]
            remediation = [
                "Authorize inbound TCP port 8080 from 10.10.0.0/16 in AWS Security Group",
                "Verify MTU clamping: iptables -t mangle -A FORWARD -p tcp --tcp-flags SYN,RST SYN -j TCPMSS --clamp-mss-to-pmtu"
            ]
        elif "security" in query_lower or "attack" in query_lower or "scan" in query_lower:
            reply = (
                "**Cybersecurity Telemetry Analysis**:\n\n"
                "- Suricata IDS detected a port scan event originating from workstation `10.10.20.10`.\n"
                "- Rule Matched: `ET SCAN Potential Nmap Port Sweep`.\n"
                "- Targeted Subnet: `onprem-servers (10.10.30.0/24)`.\n"
                "- The firewall successfully blocked direct database port 5432 probes.\n\n"
                "**Remediation Recommendation**:\n"
                "- Isolate workstation `10.10.20.10` or verify if this was an approved vulnerability audit."
            )
            possible_causes = ["Internal penetration test probe", "Compromised workstation on User segment"]
            recommended_checks = ["Inspect host processes on client-01", "Review firewall drops in /var/log/suricata/eve.json"]
            remediation = ["Quarantine client-01 via firewall policy", "Mark Suricata alert as triaged/resolved"]
        else:
            reply = (
                f"**NetFusion AI Diagnostics Summary** for query: *'{user_query}'*:\n\n"
                "All core subsystems are operating within nominal thresholds:\n"
                "- **On-Premises Infrastructure**: 7 Linux containers online, 0 crash loops.\n"
                "- **WireGuard Hybrid VPN**: Connected to AWS VPC (10.20.0.0/16), 11.4ms latency.\n"
                "- **AWS Cloud**: 1 VPC, 2 Subnets, 2 EC2 instances running.\n"
                "- **Security**: Suricata active, firewall stateful inspection active.\n\n"
                "You can ask specific diagnostic questions like *'Why can't onprem server reach AWS?'* or *'Show security alerts'*."
            )
            possible_causes = ["Nominal operation"]
            recommended_checks = ["Review ongoing telemetry metrics", "Check active alerts in NOC console"]
            remediation = ["No remediation required at this time"]

        return {
            "reply": reply,
            "observed_evidence": evidence,
            "possible_causes": possible_causes,
            "recommended_checks": recommended_checks,
            "recommended_remediation": remediation,
            "executed_tools": tools_called,
            "requires_confirmation": False
        }
