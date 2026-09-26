# AI Diagnostic Assistant & Safety Architecture

## 1. Operating Philosophy & Safety Principles

NetFusion integrates an AI-powered diagnostic engine tailored for network operations and DevOps. Rather than giving the AI unrestricted root shell access, NetFusion implements **Strict Allowlisted Tool Invocation**:

1. **Zero Raw Shell Execution**: The AI cannot execute arbitrary bash or PowerShell commands.
2. **Explicit Confirmation for Destructive Actions**: Actions that modify routes, firewall rules, or execute Terraform apply/destroy require direct user approval through the UI.
3. **Audit Logging**: Every single tool call executed by the AI is recorded in the PostgreSQL `audit_logs` table with user context and timestamp.

---

## 2. The 12 Allowlisted Diagnostic Tools

| Tool Function | Description | Read-Only |
|---|---|---|
| `get_onprem_status()` | Returns container states and logical network segment health | Yes |
| `get_container_status()` | Returns specific container CPU, memory, and IP state | Yes |
| `get_network_interfaces()` | Returns interface MTUs, IP addresses, and packet counters | Yes |
| `get_routes()` | Inspects on-premises Linux routing tables | Yes |
| `get_vpn_status()` | Extracts WireGuard tunnel handshake and bandwidth telemetry | Yes |
| `get_aws_vpcs()` | Queries AWS VPCs and CIDR allocations | Yes |
| `get_aws_instances()` | Queries EC2 instance states and IP addresses | Yes |
| `get_aws_routes()` | Queries AWS Route Tables associated with public/private subnets | Yes |
| `get_security_groups()` | Inspects AWS Security Group ingress/egress policies | Yes |
| `get_security_events()` | Fetches recent Suricata intrusion alerts | Yes |
| `get_metrics()` | Analyzes CPU, bandwidth, and latency anomalies | Yes |
| `get_recent_logs()` | Fetches sanitized syslog and firewall drop logs | Yes |

---

## 3. Structured Diagnostic Response Format

Whenever a user submits an investigation request (e.g. *"Why can't onprem server reach AWS?"*), the assistant structures its findings into four clear sections:
1. **Observed Evidence**: Facts gathered from allowlisted tools (e.g., WireGuard status, route tables).
2. **Possible Causes**: Technical hypotheses (e.g., Security Group filtering, MTU mismatch).
3. **Recommended Checks**: Specific non-destructive tests (e.g., ping probe, port check).
4. **Recommended Remediation**: Step-by-step remediation plan requiring administrator review.
