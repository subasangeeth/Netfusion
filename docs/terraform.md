# Modular AWS Terraform Architecture

## 1. Directory Structure

```text
terraform/
├── modules/
│   ├── vpc/             # VPC 10.20.0.0/16, IGW, NAT Gateway, Elastic IP
│   ├── subnet/          # Public (10.20.1.0/24) & Private (10.20.2.0/24) subnets
│   ├── security/        # Security groups (Bastion/WireGuard & Private App)
│   ├── ec2/             # Bastion host & Internal app EC2 instances
│   └── vpn/             # Hybrid routing to on-premise CIDR (10.10.0.0/16)
│
└── environments/
    ├── dev/             # Single-AZ development environment
    └── prod/            # Production environment
```

---

## 2. Hybrid Routing Architecture

```text
Docker On-Premises (10.10.0.0/16)
               |
               v
     Docker VPN Gateway (10.10.100.10)
               |
               v [WireGuard Encrypted Tunnel: 10.50.0.0/30]
               v
     AWS Bastion / WireGuard Gateway (54.210.88.19 / 10.20.1.15)
               |
               v [AWS Route Table: 10.10.0.0/16 -> Bastion ENI]
               v
     AWS Private App EC2 (10.20.2.45:8080)
```

---

## 3. Terraform Automation & Safety Gates

1. **Plan Preview**: All Terraform actions start with `terraform plan` to verify resource creation or deletion.
2. **Explicit Confirmation**: The NetFusion UI prevents silent execution of `apply` or `destroy`. A checkbox must be toggled by an `ADMIN` user before execution proceeds.
3. **Execution Tracking**: Every run is stored in PostgreSQL table `terraform_runs` with execution stdout/stderr logs and initiator identity.
