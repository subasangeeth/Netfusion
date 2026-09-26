# NetFusion: AI-Powered Hybrid Cloud Network Automation & Security Platform

[![Docker](https://img.shields.io/badge/Docker-28.3-blue.svg)](https://www.docker.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-green.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19.3-cyan.svg)](https://react.dev/)
[![WireGuard](https://img.shields.io/badge/VPN-WireGuard-red.svg)](https://www.wireguard.com/)
[![Suricata](https://img.shields.io/badge/Security-Suricata-orange.svg)](https://suricata.io/)
[![Terraform](https://img.shields.io/badge/IaC-Terraform-purple.svg)](https://www.terraform.io/)

NetFusion is an enterprise-grade hybrid cloud platform that bridges an isolated **Docker-based simulated on-premises network** with an **AWS Cloud VPC** via an encrypted **WireGuard hybrid VPN tunnel**. Managed from a centralized, dark-mode NOC operations dashboard, NetFusion orchestrates network automation, intrusion detection, observability, and safe, allowlist-restricted AI troubleshooting.

---

## Key Highlights

- **Pure Docker & Linux Networking**: Zero GNS3 or Cisco Packet Tracer required. Uses real Linux `iproute2`, `iptables`, kernel forwarding, and network namespaces.
- **Dual Operating Modes**:
  - `NETFUSION_MODE=demo`: Operates out-of-the-box with zero AWS fees or hardware prerequisites. High-fidelity dynamic simulation of AWS VPCs, WireGuard telemetry, and Suricata alerts clearly labeled **"DEMO DATA"**.
  - `NETFUSION_MODE=production`: Communicates with real Docker containers, live AWS Boto3 API, real WireGuard tunnels, live Prometheus metrics, and live Suricata `eve.json` alerts.
- **Modular AWS Terraform**: Complete modular IaC (`modules/vpc`, `subnet`, `security`, `ec2`, `vpn`) for reproducible AWS deployments.
- **Enterprise Cybersecurity**: Real Suricata IDS container analyzing traffic across the on-premise security segment, paired with an in-lab safe attack simulator.
- **AI-Powered Diagnostics**: Built-in AI assistant running strictly allowlisted diagnostic tools (routes, interfaces, VPN status, security events, AWS route tables) with full audit logging and safety gates.
- **Role-Based Access Control**: Complete RBAC with `ADMIN`, `NETWORK_ENGINEER`, `SECURITY_ANALYST`, and `VIEWER` roles.

---

## Architecture Overview

```text
                     NETFUSION PLATFORM
                             |
                 React 18 NOC Dashboard
                             |
                      FastAPI Backend
                             |
    +------------------------+------------------------+
    |                        |                        |
Network Service          AWS Service              Security Service
(Linux / Docker)       (Boto3 / Terraform)       (Suricata / Collector)
    |                        |                        |
Docker On-Premises           |                 PostgreSQL & Prometheus
(10.10.0.0/16)               |                        |
    |                        |                        |
    +--- Hybrid WireGuard VPN (10.50.0.0/30) ---------+
                             |
                          AWS VPC
                       (10.20.0.0/16)
                             |
             +---------------+---------------+
             |                               |
       Public Subnet                  Private Subnet
       (10.20.1.0/24)                 (10.20.2.0/24)
             |                               |
        Bastion Host                  App EC2 Instance
```

---

## Directory Structure

```text
NetFusion/
├── frontend/                  # React 18 + Vite + Tailwind CSS NOC Dashboard
├── backend/                   # FastAPI Backend (REST APIs, SQLAlchemy 2.0, Boto3, AI)
├── onprem/                    # Docker On-Premises Linux Networking (Router, Firewall, Hosts)
│   ├── router/                # Alpine router with IP forwarding & policy routing
│   ├── firewall/              # Stateful iptables zone filtering
│   ├── servers/               # App and Database server containers
│   ├── clients/               # Diagnostic test client containers
│   └── vpn/                   # On-Prem WireGuard VPN gateway
├── terraform/                 # Modular Terraform for AWS Cloud VPC & WireGuard
│   ├── modules/               # vpc, subnet, security, ec2, vpn
│   └── environments/          # dev, prod
├── security/                  # Suricata IDS, event collector, safe attack simulator
├── monitoring/                # Prometheus scrapers & Grafana dashboards
├── docker/                    # Shared container configurations & entrypoints
├── scripts/                   # Verification, start, and lab simulation scripts
├── tests/                     # Unit, integration, and network verification tests
├── docs/                      # 14 Detailed architectural & operations guides
├── docker-compose.yml         # Unified container orchestration
├── .env.example               # Environment variables template
└── README.md
```

---

## Quick Start

### 1. Prerequisites
- Docker Engine 24+ & Docker Compose v2.20+
- Python 3.10+ (for local backend development)
- Node.js v20+ (for local frontend development)

### 2. Launching with Docker Compose
```bash
# Clone the repository
git clone https://github.com/organization/NetFusion.git
cd NetFusion

# Copy environment variables
cp .env.example .env

# Start all services (Frontend, Backend, PostgreSQL, On-Prem network, Suricata, Prometheus)
docker compose up -d
```

Access the services:
- **NOC Operations Dashboard**: `http://localhost:3000`
- **FastAPI Documentation**: `http://localhost:8000/docs`
- **Prometheus Metrics**: `http://localhost:9090`
- **Grafana Dashboard**: `http://localhost:3001` (admin / admin)

### 3. Default Credentials
- **Administrator**: `admin@netfusion.local` / `Admin@NetFusion2026!`
- **Network Engineer**: `neteng@netfusion.local` / `NetEng@NetFusion2026!`
- **Security Analyst**: `secanalyst@netfusion.local` / `SecAnalyst@NetFusion2026!`
- **Viewer**: `viewer@netfusion.local` / `Viewer@NetFusion2026!`

---

## Documentation Index

Comprehensive guides are located in the `docs/` folder:
- [Implementation Plan](docs/IMPLEMENTATION_PLAN.md)
- [System Architecture](docs/architecture.md)
- [Docker On-Premises Networking](docs/docker-onprem.md)
- [Hybrid Routing & VLANs](docs/networking.md)
- [WireGuard Hybrid VPN](docs/vpn.md)
- [AWS Cloud & Terraform](docs/aws.md)
- [Cybersecurity & Suricata](docs/security.md)
- [Observability & Monitoring](docs/monitoring.md)
- [AI Diagnostic Assistant](docs/ai.md)
- [CI/CD Pipeline](docs/cicd.md)
- [Deployment Guide](docs/deployment.md)
- [Troubleshooting & Runbooks](docs/troubleshooting.md)
- [Demo Mode Specification](docs/demo.md)
