# Observability & Monitoring Architecture

## 1. Metrics Pipeline

```text
FastAPI Backend (/metrics)
Docker Containers (Node Exporter)
AWS CloudWatch Telemetry
               |
               v [Scraped every 15s]
        Prometheus (Port 9090)
               |
               +-----------------------+
               |                       |
               v                       v
      Grafana Dashboards       React Operations UI
          (Port 3001)           (Recharts Telemetry)
```

---

## 2. Key Monitored Metrics

- **System Health Index**: Dynamic score (nominal 98.4%) calculated across device availability, alert severities, and VPN tunnel states.
- **Hybrid WAN Throughput**: Bandwidth utilization across WireGuard tunnel interface `wg0`.
- **Latency Probes**: Round-trip time (RTT) between on-premises workstations and AWS private workloads.
- **Container Resource Utilization**: CPU, memory, and interface packet drops across `router`, `firewall`, and `app-server`.
