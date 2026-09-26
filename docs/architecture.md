# NetFusion System Architecture

## 1. System Vision & Overview

**NetFusion** is an AI-powered hybrid cloud network automation, cybersecurity, and observability platform designed to bridge simulated enterprise on-premises networks and hyperscale cloud infrastructure (AWS).

Rather than relying on proprietary, resource-heavy network emulators like GNS3 or Cisco Packet Tracer, NetFusion uses **native Docker containers and Linux kernel networking (`iproute2`, `iptables`, network namespaces, and bridge interfaces)**. This guarantees:
1. **Lightweight, headless execution**: Operates in CI/CD pipelines, local developer laptops, or cloud VMs.
2. **Deterministic repeatability**: The entire on-premises topology spins up reliably with a single `docker compose up -d`.
3. **True Linux network semantics**: Real ARP tables, real IP forwarding, real packet filtering, real routing tables, and real packet captures via Suricata.

---

## 2. High-Level Architecture Diagram

```text
                                 +-------------------------------------+
                                 |         NetFusion NOC UI            |
                                 |    (React 18 + Vite + Tailwind)     |
                                 |        Port 3000 / WebBrowser       |
                                 +------------------+------------------+
                                                    |
                                                    | REST / WebSocket / JSON
                                                    v
                                 +-------------------------------------+
                                 |        FastAPI Backend Engine       |
                                 |         Port 8000 (Python 3.10)     |
                                 +------------------+------------------+
                                                    |
             +--------------------+-----------------+--------------------+--------------------+
             |                    |                 |                    |                    |
             v                    v                 v                    v                    v
     +---------------+    +---------------+ +---------------+    +---------------+    +---------------+
     |  PostgreSQL   |    |  Prometheus   | | Network Auto  |    |  Security     |    |  AWS Service  |
     |   Port 5432   |    |   Port 9090   | | Service       |    |  Collector    |    | (Boto3 & TF)  |
     +---------------+    +---------------+ +-------+-------+    +-------+-------+    +-------+-------+
                                                    |                    |                    |
                                                    | Docker Exec / API  | eve.json tail      | AWS API / TF
                                                    v                    v                    v
+===================================================+====================+====================+======================+
| DOCKER SIMULATED ON-PREMISES (10.10.0.0/16)                                                AWS VPC (10.20.0.0/16)   |
|                                                                                                                     |
|  [onprem-management] 10.10.10.0/24                                                         [Public Subnet]          |
|    - router (10.10.10.1)                                                                     - Bastion EC2          |
|                                                                                              - Internet Gateway     |
|  [onprem-users] 10.10.20.0/24                                                                 - WG AWS Endpoint     |
|    - client-01 (10.10.20.10)                                                                                        |
|    - client-02 (10.10.20.11)                                                               [Private Subnet]         |
|                                                                                              - App Server EC2       |
|  [onprem-servers] 10.10.30.0/24                                                              - NAT Gateway          |
|    - app-server (10.10.30.10)                                                                                       |
|    - db-server  (10.10.30.20)                                                                                       |
|                                                                                                                     |
|  [onprem-security] 10.10.40.0/24                                                                                    |
|    - suricata IDS (10.10.40.10)                                                                                     |
|                                                                                                                     |
|  [onprem-transit] 10.10.100.0/24                                                                                    |
|    - vpn-gateway (10.10.100.10)                                                                                     |
|          |                                                                                                          |
|          +==================== Encrypted WireGuard Tunnel (10.50.0.0/30) ===================+                       |
|                                UDP Port 51820                                                                       |
+=====================================================================================================================+
```

---

## 3. Core Subsystems

### 3.1 Frontend Subsystem (React 18 + Vite)
- **Framework**: React 18 / Vite with Tailwind CSS, Lucide icons, and Recharts.
- **Pages**:
  1. **Dashboard (Overview)**: Real-time telemetry, KPI cards, hybrid health index, alert notifications.
  2. **AWS Cloud**: Multi-region VPCs, subnets, EC2 instances, security groups, route tables.
  3. **On-Premises**: Inventory of Linux containers (Router, Firewall, App Server, DB, Clients).
  4. **Network**: Interface status, routing table manager, diagnostic ping/traceroute/curl execution.
  5. **Topology**: Visual interactive 3-tier hybrid topology canvas (On-Premises -> WireGuard -> AWS).
  6. **VPN**: WireGuard tunnel telemetry: real-time transfer counters, handshake timer, allowed IPs.
  7. **Security**: Suricata IDS event feed, severity badges, safe in-lab attack simulator.
  8. **Monitoring**: Prometheus graphs for CPU, RAM, network throughput, and backend response latency.
  9. **Terraform**: Workspace selector, plan preview, state inspector, apply/destroy confirmation modals.
  10. **Automation**: Config backup repository, automated network validation suite.
  11. **AI Assistant**: Diagnostic chat, allowlisted tool execution logs, evidence analysis cards.
  12. **Audit Logs**: Filterable audit trail table with CSV export.
  13. **Settings**: Mode switch (`demo` vs `production`), AWS credentials status, API tokens.
- **Mode Indicator**: Persistent banner indicating `DEMO DATA` vs `LIVE SYSTEM`.

### 3.2 Backend Subsystem (FastAPI)
- **Framework**: FastAPI (async Python 3.10).
- **Persistence**: PostgreSQL 16 via SQLAlchemy 2.0 ORM and Alembic migrations.
- **Authentication & Security**:
  - JWT tokens with SHA-256 signatures.
  - Password hashing with Bcrypt.
  - Role-Based Access Control (RBAC): `ADMIN`, `NETWORK_ENGINEER`, `SECURITY_ANALYST`, `VIEWER`.
  - Immutable audit logging for all mutations and AI tool calls.
- **Controlled Automation Services**:
  - `NetworkService`: Inspects Docker container interfaces, adds/deletes routes via validated parameters, executes ping/traceroute.
  - `VpnService`: Parses `wg show` outputs, monitors handshake liveness, calculates bandwidth deltas.
  - `AwsService`: Queries AWS APIs via Boto3 (EC2, VPC, Route53, CloudWatch) or provides high-fidelity simulation in Demo mode.
  - `TerraformService`: Formats, plans, and applies Terraform configurations with explicit confirmation gates.
  - `SecurityService`: Ingests Suricata `eve.json` records, maps CVEs and alert severities, triggers safe attack simulations.
  - `AiService`: Allowlist-constrained troubleshooting engine with 12 read-only diagnostic tools.

### 3.3 On-Premises Simulation Subsystem (Pure Docker & Linux)
- **Logical Networks**:
  - `onprem-management` (`10.10.10.0/24`): Gateway `10.10.10.1`
  - `onprem-users` (`10.10.20.0/24`): Gateway `10.10.20.1`
  - `onprem-servers` (`10.10.30.0/24`): Gateway `10.10.30.1`
  - `onprem-security` (`10.10.40.0/24`): Gateway `10.10.40.1`
  - `onprem-transit` (`10.10.100.0/24`): Inter-connecting router, firewall, and VPN gateway.
- **Routing & Firewalling**:
  - `router`: Multi-homed Alpine container with `ip_forward=1` and static routes connecting all on-prem subnets.
  - `firewall`: Stateful `iptables` inspection container enforcing inter-zone security policies.
  - `vpn-gateway`: WireGuard gateway container terminating the tunnel to AWS.

### 3.4 Hybrid WireGuard VPN Subsystem
- **Tunnel Network**: `10.50.0.0/30`
  - On-Premises Endpoint: `10.50.0.1`
  - AWS Cloud Endpoint: `10.50.0.2`
- **Routing**:
  - On-Premises route to AWS: `ip route add 10.20.0.0/16 via 10.50.0.2 dev wg0`
  - AWS route to On-Premises: `ip route add 10.10.0.0/16 via 10.50.0.1 dev wg0`
- **Telemetry**: Real-time extraction of bytes received/transmitted, latest handshake timestamp, and peer connectivity status.

### 3.5 Cybersecurity Subsystem (Suricata & In-Lab Attack Simulation)
- **Suricata Engine**: Deployed with custom `local.rules` inspecting network traffic.
- **Collector Daemon**: Tailing `/var/log/suricata/eve.json` and pushing parsed JSON alert objects into PostgreSQL.
- **Safe Attack Simulator**: In-lab test runner generating controlled network anomalies:
  - Port scans (`nmap` / `nc` probes)
  - Simulated brute-force HTTP requests
  - ICMP flood / rate-limiting tests

### 3.6 Observability Subsystem (Prometheus & Grafana)
- **Prometheus**: Scrapes `/metrics` from the FastAPI backend and node metrics from containers.
- **Grafana**: Visualizes real-time CPU, RAM, network bandwidth, and application response times.
- **Frontend Telemetry**: Recharts components reflecting live time-series metrics.

---

## 4. Port & Network Allocation Matrix

| Service | Internal IP / Host | Port | Protocol | Purpose |
|---|---|---|---|---|
| **Frontend** | `frontend` | 3000 | HTTP | React Web Dashboard |
| **Backend** | `backend` | 8000 | HTTP | FastAPI REST & Docs |
| **PostgreSQL** | `postgres` | 5432 | TCP | Relational DB |
| **Prometheus** | `prometheus` | 9090 | HTTP | Metrics Storage |
| **Grafana** | `grafana` | 3001 | HTTP | Observability Dashboards |
| **VPN Gateway** | `vpn-gateway` | 51820 | UDP | WireGuard Encrypted Tunnel |
| **Router** | `router` | — | IP | On-Prem Default Gateway |
| **Firewall** | `firewall` | — | IP | Stateful Packet Filter |
| **App Server** | `app-server` (10.10.30.10) | 8080 | HTTP | Internal Business Application |
| **DB Server** | `db-server` (10.10.30.20) | 5432 | TCP | Internal Application Database |
| **Client-01** | `client-01` (10.10.20.10) | — | IP | User Simulation & Diagnostics |
| **Client-02** | `client-02` (10.10.20.11) | — | IP | User Simulation & Diagnostics |
| **Suricata** | `suricata` (10.10.40.10) | — | Raw IP | Network Intrusion Detection |

---

## 5. Security & Isolation Boundaries

1. **AI Safety Gate**: The AI assistant runs read-only allowlisted diagnostic commands. It can propose remediation scripts, but **never** executes modifying actions without explicit user confirmation in the UI.
2. **Zone Segmentation**: Traffic between `onprem-users` (10.10.20.0/24) and `onprem-servers` (10.10.30.0/24) must traverse the `firewall` container with strict stateful rules.
3. **Secrets Management**: No plaintext passwords or AWS keys in repository code or frontend bundles. All sensitive tokens are managed via environment variables and hashed using bcrypt.
