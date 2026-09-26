# NetFusion Demo Mode Specification

## 1. Zero-Cloud Dependency Philosophy

To allow instructors, evaluators, and engineers to run and test NetFusion without requiring an active AWS subscription or physical network equipment, NetFusion provides **Demo Mode**:

```env
NETFUSION_MODE=demo
```

---

## 2. Dynamic Simulation Capabilities

In Demo Mode, the following subsystems run high-fidelity simulations:

1. **AWS Cloud**:
   - Simulates AWS VPC (`10.20.0.0/16`), public and private subnets, Bastion EC2 (`10.20.1.15`), and App EC2 (`10.20.2.45`).
   - Every resource is explicitly flagged with the badge **"DEMO DATA"**.
2. **WireGuard VPN**:
   - Generates realistic handshakes, latency jitter (11.2 - 12.4ms), and byte counters.
3. **Suricata Intrusion Detection**:
   - In-lab attack simulator triggers synthetic port sweeps, brute-force requests, and ICMP floods.
4. **Terraform**:
   - Provides dry-run plan generation and simulated apply runs with safety confirmation gates.

---

## 3. Switching to Production Mode

To switch NetFusion into production mode with real AWS Boto3 and live WireGuard tunnels:
```env
NETFUSION_MODE=production
AWS_ACCESS_KEY_ID=<your-access-key>
AWS_SECRET_ACCESS_KEY=<your-secret-key>
AWS_DEFAULT_REGION=us-east-1
```
In production mode, NetFusion communicates exclusively with live resources and **never** displays simulated data.
