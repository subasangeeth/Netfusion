# Cybersecurity & Suricata IDS Architecture

## 1. Security Architecture Overview

NetFusion implements defense-in-depth across the simulated on-premises and AWS cloud environments:

```text
[onprem-users: 10.10.20.0/24]
              |
              v (Untrusted Workstation Traffic)
[onprem-security: 10.10.40.10 - Suricata IDS Engine]
              |
              v (eve.json)
[Security Collector Daemon]
              |
              v (HTTP POST)
[FastAPI Backend / PostgreSQL `security_events` Table]
              |
              v
[React Operations Console (Security & Alerts View)]
```

---

## 2. Active Suricata Signatures (`local.rules`)

1. **SID 2001001**: `ET SCAN Potential Nmap Port Sweep`
   - Detects TCP SYN scans exceeding 5 unique ports within 5 seconds.
2. **SID 2001002**: `POLICY Direct User Access to Database Server Blocked`
   - Detects workstations on `10.10.20.0/24` attempting direct TCP 5432 connections to the internal DB (`10.10.30.20`).
3. **SID 2001003**: `GPL ICMP Anomalous Echo Request Rate`
   - Detects ICMP ping rates exceeding 20 packets within 2 seconds.
4. **SID 2001004**: `HTTP 401 Repeated Authentication Failure`
   - Detects brute-force credential stuffing attempts returning HTTP 401.

---

## 3. Safe In-Lab Attack Simulator

To evaluate detection fidelity without endangering external networks, NetFusion provides a sandboxed attack generator:
- **Port Scan Simulation**: `client-01` sweeps ports 22, 80, 8080, and 5432 on `app-server`.
- **HTTP Brute Force**: Generates rapid unauthorized API calls.
- **ICMP Rate Burst**: Sends short ICMP bursts against the default gateway.

All simulation events are logged in the immutable audit trail and visible in the NOC console.
