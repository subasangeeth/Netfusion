# NetFusion: Implementation Plan

**AI-Powered Hybrid Cloud Network Automation & Security Platform**

---

## Executive Overview

NetFusion unifies an isolated Docker-based simulated on-premises enterprise network with AWS Cloud infrastructure through an encrypted WireGuard hybrid VPN tunnel. The entire system is monitored and managed via a high-performance FastAPI backend, a modern React (Vite + Tailwind CSS + Lucide + Recharts) NOC operations dashboard, Suricata intrusion detection, Prometheus/Grafana metrics, and an allowlist-restricted AI diagnostic assistant.

---

## Workspace Inspection Findings

| Tool | Version / Status | Implementation Strategy |
|---|---|---|
| **Docker** | 28.3.2 (Running) | Used for isolated on-premise Linux routing/firewall topology, containers, and services |
| **Docker Compose** | v2.39.1 | Orchestrates the unified local lab stack (`docker compose up -d`) |
| **Python** | 3.10.8 | Powers FastAPI backend, network automation, Boto3, Suricata collector, AI engine |
| **Node.js** | v22.14.0 | Powers the React + Vite frontend dashboard |
| **Git** | 2.45.1 | Version control and CI/CD triggers |
| **AWS CLI** | 2.36.29 | Live AWS management and credential authentication |
| **Terraform** | Dockerized `hashicorp/terraform` + Winget local CLI detection | Fully reproducible IaC execution via containerized runner |
| **Existing Code** | React NOC dashboard | Migrating root assets into `frontend/`, enhancing with 13 required pages & full API connectivity |

---

## Project Structure (Target)

```text
NetFusion/
├── frontend/                  # React 18 + Vite + Tailwind CSS NOC Dashboard
│   ├── src/
│   │   ├── pages/             # 13 dedicated operational views
│   │   ├── components/        # Glassmorphic NOC widgets & modal dialogs
│   │   ├── layouts/           # Sidebar, topbar, status footer
│   │   ├── services/          # Real API client (FastAPI) + Mock toggle
│   │   ├── charts/            # Recharts telemetry graphs
│   │   └── hooks/             # Polling & debounce hooks
│   ├── package.json
│   ├── vite.config.js
│   └── Dockerfile
├── backend/                   # FastAPI Backend Application
│   ├── app/
│   │   ├── api/v1/            # 12 REST API routers (auth, devices, network, vpn, aws, etc.)
│   │   ├── core/              # Config, DB, Security, RBAC, Middleware
│   │   ├── models/            # SQLAlchemy 2.0 ORM models (16 tables)
│   │   ├── schemas/           # Pydantic v2 schemas
│   │   ├── services/          # Business logic (network, VPN, AWS, AI, Suricata)
│   │   ├── repositories/      # Database CRUD layer
│   │   └── ai/                # Allowlisted AI diagnostic tools & runbooks
│   ├── tests/                 # Pytest test suite
│   ├── requirements.txt
│   └── Dockerfile
├── onprem/                    # Docker-Based On-Premises Simulation (Pure Linux)
│   ├── router/                # Multi-homed Linux router with iproute2 & iptables
│   ├── firewall/              # Stateful packet inspection & zone filtering
│   ├── servers/               # Internal app-server and db-server
│   ├── clients/               # Diagnostic test clients (client-01, client-02)
│   └── vpn/                   # On-Prem WireGuard VPN Gateway
├── terraform/                 # Modular AWS Infrastructure as Code
│   ├── modules/
│   │   ├── vpc/               # VPC 10.20.0.0/16, IGW, NAT
│   │   ├── subnet/            # Public & Private subnets
│   │   ├── security/          # Security groups (Bastion, App, WireGuard)
│   │   ├── ec2/               # Bastion & App EC2 instances
│   │   └── vpn/               # WireGuard Cloud Endpoint
│   └── environments/
│       ├── dev/
│       └── prod/
├── security/                  # Cybersecurity Stack
│   ├── suricata/              # Suricata IDS configuration & custom local.rules
│   ├── collector/             # Python daemon streaming eve.json to PostgreSQL
│   └── attack_sim/            # Controlled, safe in-lab attack simulator
├── monitoring/                # Observability Stack
│   ├── prometheus/            # Prometheus scraping configs & rules
│   └── grafana/               # Pre-provisioned dashboards & datasources
├── docker/                    # Shared Docker configs & entrypoints
├── scripts/                   # Management, verification & attack simulation scripts
├── tests/                     # End-to-end integration test suite
├── docs/                      # 14 Comprehensive architecture & operations guides
├── .github/workflows/         # CI/CD pipeline
├── docker-compose.yml         # Single-command environment orchestration
├── .env.example               # Environment variables template
├── .gitignore
└── README.md
```

---

## 15-Phase Execution Plan

### Phase 1 — Architecture & Project Scaffolding
- Establish clean directory hierarchy.
- Migrate root frontend files cleanly into `frontend/`.
- Create `.env.example`, `.gitignore`, root `README.md`, and architectural blueprint in `docs/architecture.md`.

### Phase 2 — Docker On-Premises Network Topology
- Define isolated Docker networks:
  - `onprem-management` (`10.10.10.0/24`)
  - `onprem-users` (`10.10.20.0/24`)
  - `onprem-servers` (`10.10.30.0/24`)
  - `onprem-security` (`10.10.40.0/24`)
  - `onprem-transit` (`10.10.100.0/24`)
- Build lightweight Docker images for `router`, `firewall`, `app-server`, `db-server`, `client-01`, and `client-02`.
- Configure Linux IP forwarding (`net.ipv4.ip_forward=1`), policy routing, and iptables zone filters.
- Document network segmentation and VLAN 802.1Q sub-interface concepts (`docs/docker-onprem.md`, `docs/networking.md`).

### Phase 3 — PostgreSQL & Database Schema
- Deploy PostgreSQL 16 container with persistent volumes and health checks.
- Build SQLAlchemy 2.0 ORM models and Alembic migrations for 16 tables:
  1. `users`, 2. `roles`, 3. `devices`, 4. `networks`, 5. `interfaces`, 6. `routes`,
  7. `vpn_connections`, 8. `aws_resources`, 9. `terraform_runs`, 10. `monitoring_metrics`,
  11. `security_events`, 12. `alerts`, 13. `automation_jobs`, 14. `audit_logs`,
  15. `ai_conversations`, 16. `ai_messages`.
- Seed database with default roles (`ADMIN`, `NETWORK_ENGINEER`, `SECURITY_ANALYST`, `VIEWER`) and demo entities.

### Phase 4 — FastAPI Backend Core & REST APIs
- Initialize FastAPI with Pydantic v2 settings, async PostgreSQL engine, and JWT authentication with bcrypt.
- Implement REST API endpoints:
  - `/api/v1/auth`: Login, JWT tokens, user profile.
  - `/api/v1/devices`: Device inventory, health, container status.
  - `/api/v1/network`: Interfaces, routes, safe route addition, diagnostic ping/traceroute/curl test runner.
  - `/api/v1/vpn`: WireGuard status, handshake logs, peer metrics.
  - `/api/v1/aws`: Live Boto3 integration or high-fidelity simulation in Demo mode (`NETFUSION_MODE=demo`).
  - `/api/v1/terraform`: Workspaces, plan/apply preview, execution logs.
  - `/api/v1/security`: Suricata event stream, alert triage, safe attack simulation.
  - `/api/v1/monitoring`: Prometheus `/metrics` endpoint, container stats, latency metrics.
  - `/api/v1/ai`: Allowlisted troubleshooting assistant with audit logging.
  - `/api/v1/audit`: Immutable audit trail for all destructive or diagnostic actions.

### Phase 5 — React 18 + Vite Frontend Dashboard
- Build and optimize the 13 required operational views:
  1. **Dashboard (Overview)**: KPI cards, hybrid health score, active alerts, topology snapshot.
  2. **AWS Cloud**: VPCs, subnets, EC2 instances, route tables, security groups.
  3. **On-Premises**: Inventory of Linux containers (Router, Firewall, Servers, Clients).
  4. **Network**: Interfaces, routing tables, interactive ping/traceroute/curl test tool.
  5. **Topology**: Interactive 3-tier visual canvas (On-Premises -> WireGuard VPN -> AWS VPC).
  6. **VPN**: WireGuard tunnel telemetry: status, handshake timestamp, RX/TX bandwidth graphs.
  7. **Security**: Suricata IDS event feed, severity badges, safe attack simulation controls.
  8. **Monitoring**: Prometheus time-series charts for CPU, RAM, network throughput, latencies.
  9. **Terraform**: Workspace selector, plan preview, state inspector, apply/destroy confirmation modals.
  10. **Automation**: Config backup repository, network test suite runner.
  11. **AI Assistant**: Troubleshooting chat, allowlisted tool execution logs, evidence analysis cards.
  12. **Audit Logs**: Filterable audit trail table with CSV export.
  13. **Settings**: Mode switch (`demo` vs `production`), AWS credentials status, API tokens.
- Add prominent **"DEMO DATA"** banner when in demo mode.

### Phase 6 — AWS Infrastructure as Code (Terraform)
- Create modular Terraform modules in `terraform/modules/`:
  - `vpc`: CIDR `10.20.0.0/16`, Internet Gateway, NAT Gateway.
  - `subnet`: Public (`10.20.1.0/24`) and Private (`10.20.2.0/24`) subnets.
  - `security`: Security groups for Bastion, Application EC2, and WireGuard.
  - `ec2`: Bastion host (public) and internal app instance (private).
  - `vpn`: WireGuard EC2 / Customer Gateway with routes to on-prem `10.10.0.0/16`.
- Provide `environments/dev/` and `environments/prod/` configurations.
- Dockerized Terraform runner service in backend for guaranteed cross-platform execution.

### Phase 7 — Hybrid WireGuard VPN
- Implement WireGuard tunnel connecting Docker on-prem (`vpn-gateway`) to AWS (`10.20.0.0/16`):
  - On-Prem CIDR: `10.10.0.0/16`
  - AWS VPC CIDR: `10.20.0.0/16`
  - Tunnel Subnet: `10.50.0.0/30` (On-Prem `10.50.0.1`, AWS `10.50.0.2`)
  - Port: UDP `51820`
- WireGuard parser in backend extracting real-time handshake, transfer metrics, and endpoint status.

### Phase 8 — Network Automation Service
- Python Linux networking automation service using Docker SDK and controlled commands.
- Interface inspection, IP address discovery, route table management with schema validation.
- Safe route management (blocks invalid CIDRs or destructive default gateway drops without confirmation).
- Automated configuration backup of iptables rules and routing tables to PostgreSQL.

### Phase 9 — Cybersecurity (Suricata & Safe Attack Simulation)
- Configure Suricata IDS container on the security network segment (`10.10.40.10`).
- Custom rules (`local.rules`) for ICMP flood, SYN scan, unauthorized HTTP access, and brute force.
- Security collector daemon streaming `eve.json` alerts to PostgreSQL and frontend.
- Safe in-lab attack simulator executing controlled tests between `client-01` and `app-server`.

### Phase 10 — Observability & Monitoring (Prometheus & Grafana)
- Configure Prometheus to scrape backend `/metrics` and container stats.
- Provide pre-configured Grafana dashboard (`netfusion.json`) with datasources.
- In-app Recharts telemetry matching Prometheus data.

### Phase 11 — AI Assistant with Allowlisted Tools
- Context-aware troubleshooting engine with 12 strictly allowlisted read-only tools:
  - `get_onprem_status`, `get_container_status`, `get_network_interfaces`, `get_routes`
  - `get_vpn_status`, `get_aws_vpcs`, `get_aws_instances`, `get_aws_routes`
  - `get_security_groups`, `get_security_events`, `get_metrics`, `get_recent_logs`
  - Strict audit logging of all AI tool invocations.
  - Safety barrier: No shell execution, no silent destructive modifications.

### Phase 12 — CI/CD Pipeline
- GitHub Actions workflow (`.github/workflows/ci.yml`):
  - Backend pytest & linting.
  - Frontend build & test.
  - Docker Compose syntax validation.
  - Terraform fmt and validate.
  - Security scanning (`pip-audit`, `npm audit`).

### Phase 13 — Testing Suite
- Comprehensive automated test suite:
  - Backend API unit and integration tests.
  - Database migration and seed tests.
  - RBAC permission tests.
  - On-prem network routing verification (`client-01` -> `router` -> `app-server`).
  - WireGuard tunnel verification.
  - Attack simulation & Suricata alert verification.

### Phase 14 — Unified Docker Compose Integration
- Single-command orchestration via `docker compose up -d` for:
  - `frontend`, `backend`, `postgres`, `prometheus`, `grafana`
  - `router`, `firewall`, `app-server`, `db-server`, `client-01`, `client-02`, `vpn-gateway`, `suricata`, `security-collector`
- Health checks, volume mappings, and graceful dependency ordering.

### Phase 15 — Documentation Suite
- Comprehensive technical documentation in `docs/`:
  - `architecture.md`, `docker-onprem.md`, `networking.md`, `vpn.md`, `aws.md`
  - `terraform.md`, `security.md`, `monitoring.md`, `ai.md`, `cicd.md`
  - `deployment.md`, `troubleshooting.md`, `demo.md`

---

## Status & Progress

- [x] Workspace inspection completed.
- [x] Initial plan created.
- [x] Phase 1 — Architecture & Project Scaffolding
- [x] Phase 2 — Docker On-Premises Network (Pure Linux `iproute2`, `iptables`, Alpine router/firewall)
- [x] Phase 3 — PostgreSQL & Schemas (SQLAlchemy 2.0 ORM, 16 tables, idempotent seeder)
- [x] Phase 4 — FastAPI Backend (REST APIs, JWT, RBAC, Boto3, Docker SDK, Audit logs)
- [x] Phase 5 — React 18 Dashboard (13 dedicated pages, dark NOC aesthetic, dynamic mode toggle)
- [x] Phase 6 — AWS / Terraform (Modular VPC, subnets, security, EC2, VPN runner with safety gate)
- [x] Phase 7 — Hybrid VPN (WireGuard overlay tunnel 10.50.0.0/30, real-time telemetry)
- [x] Phase 8 — Network Automation (Safe route injection, ping/curl/nc connectivity runner, backups)
- [x] Phase 9 — Cybersecurity & Suricata (Suricata 7.0 engine, local.rules, collector daemon, safe in-lab attack simulator)
- [x] Phase 10 — Observability (Prometheus scrape configs, pre-provisioned Grafana dashboards, Recharts)
- [x] Phase 11 — AI Assistant (12 allowlisted diagnostic tools, audit logging, zero arbitrary shell access)
- [x] Phase 12 — CI/CD (.github/workflows/ci.yml with pytest, linting, build, terraform validate)
- [x] Phase 13 — Testing (Pytest and standard library unittest suite, network CIDR tests)
- [x] Phase 14 — Integration (Single-command docker-compose.yml with health checks and volume mounts)
- [x] Phase 15 — Documentation (14 comprehensive technical and architectural guides in docs/)
