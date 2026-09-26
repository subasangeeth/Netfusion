# NetFusion Deployment Guide

## 1. Local Development & Evaluation Setup

To spin up the entire NetFusion platform, including the on-premises Docker topology, Suricata, Prometheus, Grafana, PostgreSQL, backend, and frontend:

```bash
# 1. Clone repository
git clone https://github.com/organization/NetFusion.git
cd NetFusion

# 2. Configure environment
cp .env.example .env

# 3. Launch with Docker Compose
docker compose up -d

# 4. Verify running containers
docker compose ps
```

---

## 2. Service Access Points

| Service | Local URL / Port | Default Credentials |
|---|---|---|
| **Operations Dashboard** | `http://localhost:3000` | admin@netfusion.local / Admin@NetFusion2026! |
| **FastAPI REST API Docs** | `http://localhost:8000/docs` | Bearer JWT / OAuth2 |
| **Prometheus Telemetry** | `http://localhost:9090` | None |
| **Grafana Dashboards** | `http://localhost:3001` | admin / admin |
| **App Server (Internal)** | `http://localhost:8080/health` | None |
| **WireGuard VPN UDP** | `UDP 51820` | Public Key Handshake |

---

## 3. Production Deployment Considerations

1. **Secrets**: Update `SECRET_KEY`, `POSTGRES_PASSWORD`, and `GF_SECURITY_ADMIN_PASSWORD` in `.env` to secure, cryptographically random strings.
2. **Reverse Proxy & SSL**: In production, deploy behind an AWS Application Load Balancer or Nginx reverse proxy with valid TLS/SSL certificates (`Let's Encrypt` or AWS ACM).
3. **Database Persistence**: Ensure `postgres_data` volume is backed up or migrate to AWS RDS Aurora PostgreSQL.
