# Troubleshooting & Operational Runbooks

## 1. Common Diagnostics & Solutions

### 1.1 "Client cannot reach Application Server"
- **Symptom**: `ping 10.10.30.10` fails from `client-01`.
- **Root Cause**: Linux IP forwarding disabled on `netfusion-router` or firewall drops.
- **Runbook**:
  ```bash
  # Check IP forwarding on router
  docker exec netfusion-router sysctl net.ipv4.ip_forward
  # Re-enable if 0:
  docker exec netfusion-router sysctl -w net.ipv4.ip_forward=1
  # Check iptables forward rules on firewall:
  docker exec netfusion-firewall iptables -L FORWARD -n -v
  ```

### 1.2 "WireGuard Handshake Timeout"
- **Symptom**: WireGuard status reports `DEGRADED` or last handshake > 180s.
- **Root Cause**: UDP 51820 filtered by AWS Security Group or local firewall.
- **Runbook**:
  ```bash
  # Inspect WireGuard dump on VPN gateway
  docker exec netfusion-vpn-gateway wg show
  # Trigger soft re-keying:
  curl -X POST http://localhost:8000/api/v1/vpn/restart
  ```

### 1.3 "Direct Database Access Refused"
- **Symptom**: `nc -z -w 2 10.10.30.20 5432` from `client-01` times out.
- **Normal Behavior**: **Expected**. Firewall policy #6 explicitly drops direct workstation access to the database tier. Workstations must communicate through the application server (`10.10.30.10:8080`).

---

## 2. Asking the AI Assistant
Use the in-app AI Assistant for instant context-aware triage:
```text
User: "Why can't the on-prem server reach the AWS application?"
```
The AI executes allowlisted tools (`get_vpn_status`, `get_routes`, `get_aws_routes`), checks MTU and Security Groups, and reports exact remediation advice.
