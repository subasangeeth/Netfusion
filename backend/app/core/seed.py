import asyncio
from datetime import datetime, timedelta
from sqlalchemy import select
from app.core.database import AsyncSessionLocal, engine, Base
from app.core.security import get_password_hash
from app.models import (
    User, Role, Device, Network, Interface, Route,
    VpnConnection, AwsResource, SecurityEvent, Alert,
    MonitoringMetric, AuditLog
)

async def seed_database():
    """Idempotently seed the NetFusion database with default records."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        # 1. Seed Roles
        roles_data = [
            ("ADMIN", "Full administrative access across all domains", "all:manage"),
            ("NETWORK_ENGINEER", "Network automation, routing, interfaces, VPN", "network:manage,vpn:manage,device:view"),
            ("SECURITY_ANALYST", "Security event triage, Suricata alerts, attack simulation", "security:manage,audit:view"),
            ("VIEWER", "Read-only access to all operational views", "all:view")
        ]

        role_map = {}
        for name, desc, perms in roles_data:
            stmt = select(Role).where(Role.name == name)
            res = await session.execute(stmt)
            role = res.scalar_one_or_none()
            if not role:
                role = Role(name=name, description=desc, permissions=perms)
                session.add(role)
                await session.flush()
            role_map[name] = role

        # 2. Seed Users
        users_data = [
            ("admin@netfusion.local", "Admin@NetFusion2026!", "NetFusion Lead Administrator", "ADMIN"),
            ("neteng@netfusion.local", "NetEng@NetFusion2026!", "Lead Network Automation Engineer", "NETWORK_ENGINEER"),
            ("secanalyst@netfusion.local", "SecAnalyst@NetFusion2026!", "Lead Cybersecurity Analyst", "SECURITY_ANALYST"),
            ("viewer@netfusion.local", "Viewer@NetFusion2026!", "Operations Center Observer", "VIEWER")
        ]

        for email, pwd, name, role_name in users_data:
            stmt = select(User).where(User.email == email)
            res = await session.execute(stmt)
            if not res.scalar_one_or_none():
                user = User(
                    email=email,
                    hashed_password=get_password_hash(pwd),
                    full_name=name,
                    is_active=True,
                    created_at=datetime.utcnow()
                )
                user.roles.append(role_map[role_name])
                session.add(user)

        # 3. Seed Logical Networks
        networks_data = [
            ("onprem-management", "10.10.10.0/24", "10.10.10.1", 10, "Management", "Core management segment"),
            ("onprem-users", "10.10.20.0/24", "10.10.20.1", 20, "Users", "Corporate client workstations"),
            ("onprem-servers", "10.10.30.0/24", "10.10.30.1", 30, "Servers", "Production application and database tier"),
            ("onprem-security", "10.10.40.0/24", "10.10.40.1", 40, "Security", "Suricata IDS sensors and collectors"),
            ("onprem-transit", "10.10.100.0/24", "10.10.100.1", 100, "Transit", "Edge routing & VPN gateway interconnect")
        ]

        for name, cidr, gw, vlan, zone, desc in networks_data:
            stmt = select(Network).where(Network.name == name)
            res = await session.execute(stmt)
            if not res.scalar_one_or_none():
                net = Network(name=name, cidr=cidr, gateway=gw, vlan_id=vlan, zone=zone, description=desc)
                session.add(net)

        # 4. Seed Devices
        devices_data = [
            ("netfusion-router", "hq-core-rtr01", "10.10.10.1", "router", "onprem", "onprem-management", "online", 24.5, 42.1, "Linux Router (iproute2)"),
            ("netfusion-firewall", "hq-fw-zone01", "10.10.10.2", "firewall", "onprem", "onprem-management", "online", 18.2, 38.4, "Linux Stateful Firewall (iptables)"),
            ("netfusion-app-server", "app-prod-01", "10.10.30.10", "server", "onprem", "onprem-servers", "online", 32.1, 55.6, "Python Enterprise App (Port 8080)"),
            ("netfusion-db-server", "db-prod-01", "10.10.30.20", "server", "onprem", "onprem-servers", "online", 44.0, 68.2, "PostgreSQL 16 Database"),
            ("netfusion-client-01", "ws-client-01", "10.10.20.10", "client", "onprem", "onprem-users", "online", 5.2, 18.0, "Alpine Linux User Workstation"),
            ("netfusion-client-02", "ws-client-02", "10.10.20.11", "client", "onprem", "onprem-users", "online", 6.8, 19.4, "Alpine Linux User Workstation"),
            ("netfusion-vpn-gateway", "gw-wireguard-01", "10.10.100.10", "vpn_gateway", "transit", "onprem-transit", "online", 14.5, 30.2, "WireGuard VPN Gateway (wg0)")
        ]

        for dev_id, host, ip, dtype, tier, zone, status, cpu, mem, model in devices_data:
            stmt = select(Device).where(Device.device_id == dev_id)
            res = await session.execute(stmt)
            if not res.scalar_one_or_none():
                dev = Device(
                    device_id=dev_id,
                    hostname=host,
                    ip_address=ip,
                    device_type=dtype,
                    tier=tier,
                    zone=zone,
                    status=status,
                    cpu_usage=cpu,
                    memory_usage=mem,
                    model=model
                )
                session.add(dev)

        # 5. Seed WireGuard VPN Connection
        stmt = select(VpnConnection).where(VpnConnection.name == "WireGuard Hybrid Tunnel")
        res = await session.execute(stmt)
        if not res.scalar_one_or_none():
            vpn = VpnConnection(
                name="WireGuard Hybrid Tunnel",
                vpn_type="WireGuard",
                status="CONNECTED",
                local_endpoint="10.10.100.10:51820",
                remote_endpoint="10.20.1.50:51820",
                local_tunnel_ip="10.50.0.1/30",
                remote_tunnel_ip="10.50.0.2/30",
                onprem_cidr="10.10.0.0/16",
                aws_cidr="10.20.0.0/16",
                allowed_networks="10.20.0.0/16, 10.50.0.2/32",
                public_key="G7yE8vSj4X3nK9mP2qW5rT1uA6dF8hZ0bV4cY9eM3xL=",
                peer_public_key="bV4cY9eM3xLG7yE8vSj4X3nK9mP2qW5rT1uA6dF8hZ0=",
                last_handshake=datetime.utcnow() - timedelta(seconds=24),
                connected_time_seconds=14400,
                rx_bytes=104857600,
                tx_bytes=188743680,
                latency_ms=11.8
            )
            session.add(vpn)

        # 6. Seed AWS Resources (Demo / Live Cache)
        aws_data = [
            ("vpc-01982ab91c4", "vpc", "us-east-1", "NetFusion-Prod-VPC", "available", "10.20.0.0/16", "vpc-01982ab91c4", {"tenancy": "default", "enable_dns": True}),
            ("subnet-07b92c4e12", "subnet", "us-east-1", "NetFusion-Public-Subnet-1", "available", "10.20.1.0/24", "vpc-01982ab91c4", {"availability_zone": "us-east-1a"}),
            ("subnet-08c31e9a34", "subnet", "us-east-1", "NetFusion-Private-Subnet-1", "available", "10.20.2.0/24", "vpc-01982ab91c4", {"availability_zone": "us-east-1a"}),
            ("i-08fe37b1029ba", "ec2", "us-east-1", "NetFusion-Bastion-Host", "running", "10.20.1.15", "vpc-01982ab91c4", {"instance_type": "t3.micro", "public_ip": "54.210.88.19"}),
            ("i-09cba328401ef", "ec2", "us-east-1", "NetFusion-App-Instance", "running", "10.20.2.45", "vpc-01982ab91c4", {"instance_type": "t3.medium", "public_ip": None}),
            ("sg-0a817b3f92", "security_group", "us-east-1", "netfusion-bastion-sg", "active", "0.0.0.0/0", "vpc-01982ab91c4", {"inbound_ports": [22, 51820]})
        ]

        for r_id, r_type, reg, r_name, stat, cidr, vpc_id, details in aws_data:
            stmt = select(AwsResource).where(AwsResource.resource_id == r_id)
            res = await session.execute(stmt)
            if not res.scalar_one_or_none():
                res_obj = AwsResource(
                    resource_id=r_id,
                    resource_type=r_type,
                    region=reg,
                    name=r_name,
                    status=stat,
                    cidr_or_ip=cidr,
                    vpc_id=vpc_id,
                    details=details,
                    is_simulated="true"
                )
                session.add(res_obj)

        # 7. Seed Initial Security Events & Alerts
        alerts_data = [
            ("High Latency on Hybrid WireGuard Tunnel", "Latency spiked to 45ms over tunnel interface wg0. Handshake valid.", "warning", "vpn", "WireGuard Engine"),
            ("Suricata Port Scan Detection", "Detected fast TCP SYN probe from client-01 (10.10.20.10) to app-server (10.10.30.10).", "critical", "security", "Suricata IDS")
        ]

        for title, msg, sev, cat, src in alerts_data:
            stmt = select(Alert).where(Alert.title == title)
            res = await session.execute(stmt)
            if not res.scalar_one_or_none():
                session.add(Alert(title=title, message=msg, severity=sev, category=cat, source=src))

        # 8. Seed Audit Log Entry
        stmt = select(AuditLog).limit(1)
        res = await session.execute(stmt)
        if not res.scalar_one_or_none():
            session.add(AuditLog(
                user_email="system@netfusion.local",
                role="ADMIN",
                action="SYSTEM_INIT",
                resource_type="System",
                resource_id="0",
                status="SUCCESS",
                details={"message": "NetFusion platform initialized and seeded successfully."}
            ))

        await session.commit()
        print("[NetFusion Seed] Database initialized and seeded successfully.")

if __name__ == "__main__":
    asyncio.run(seed_database())
