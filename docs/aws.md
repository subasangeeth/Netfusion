# AWS Cloud Integration Guide

## 1. Dual Mode Management

NetFusion supports two modes for managing AWS Cloud resources:

### 1.1 Demo Mode (`NETFUSION_MODE=demo`)
- Requires **zero AWS credentials** and incurs **zero cloud charges**.
- Generates high-fidelity simulated VPCs, subnets, EC2 instances, and security groups.
- Displayed resources are prominently tagged **"DEMO DATA"**.

### 1.2 Production Mode (`NETFUSION_MODE=production`)
- Connects directly to the AWS API via **Boto3**.
- Automatically synchronizes VPC topology, EC2 state, security groups, and route tables.
- AWS credentials (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`) are read securely from environment variables and never exposed to the frontend.

---

## 2. Configured AWS Resources

- **VPC**: `NetFusion-Prod-VPC` (`10.20.0.0/16`) in `us-east-1`.
- **Public Subnet**: `10.20.1.0/24` with Internet Gateway and Elastic IP.
- **Private Subnet**: `10.20.2.0/24` with NAT Gateway for outbound traffic.
- **Bastion Host**: Public EC2 instance terminating the WireGuard VPN overlay tunnel.
- **Application Instance**: Private EC2 instance (`10.20.2.45`) running internal enterprise APIs on TCP port 8080.
