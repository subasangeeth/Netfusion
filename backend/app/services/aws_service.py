import os
import logging
from typing import List, Dict, Any
from app.core.config import settings

logger = logging.getLogger("netfusion.aws_service")

class AwsService:
    @staticmethod
    def is_live_aws_configured() -> bool:
        return bool(settings.AWS_ACCESS_KEY_ID and settings.AWS_SECRET_ACCESS_KEY)

    @classmethod
    def get_vpc_resources(cls) -> List[Dict[str, Any]]:
        """Queries live AWS via Boto3 or generates high-fidelity simulated resources."""
        if cls.is_live_aws_configured() and settings.NETFUSION_MODE == "production":
            try:
                import boto3
                ec2 = boto3.client(
                    "ec2",
                    region_name=settings.AWS_DEFAULT_REGION,
                    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                    aws_session_token=settings.AWS_SESSION_TOKEN or None
                )
                vpcs = ec2.describe_vpcs().get("Vpcs", [])
                results = []
                for v in vpcs:
                    vpc_id = v.get("VpcId")
                    cidr = v.get("CidrBlock")
                    name = next((t["Value"] for t in v.get("Tags", []) if t["Key"] == "Name"), vpc_id)
                    results.append({
                        "id": len(results) + 1,
                        "resource_id": vpc_id,
                        "resource_type": "vpc",
                        "region": settings.AWS_DEFAULT_REGION,
                        "name": name,
                        "status": v.get("State", "available"),
                        "cidr_or_ip": cidr,
                        "vpc_id": vpc_id,
                        "details": {"is_default": v.get("IsDefault", False)},
                        "is_simulated": "false",
                        "synced_at": "2026-09-25T14:00:00Z"
                    })
                if results:
                    return results
            except Exception as e:
                logger.warning(f"Boto3 query failed ({e}); falling back to demo simulation.")

        # High-Fidelity Demo Simulation
        return [
            {
                "id": 1,
                "resource_id": "vpc-01982ab91c4",
                "resource_type": "vpc",
                "region": "us-east-1",
                "name": "NetFusion-Prod-VPC",
                "status": "available",
                "cidr_or_ip": "10.20.0.0/16",
                "vpc_id": "vpc-01982ab91c4",
                "details": {"tenancy": "default", "enable_dns_hostnames": True, "enable_dns_support": True},
                "is_simulated": "true",
                "synced_at": "2026-09-25T14:00:00Z"
            },
            {
                "id": 2,
                "resource_id": "subnet-07b92c4e12",
                "resource_type": "subnet",
                "region": "us-east-1",
                "name": "NetFusion-Public-Subnet-1",
                "status": "available",
                "cidr_or_ip": "10.20.1.0/24",
                "vpc_id": "vpc-01982ab91c4",
                "details": {"availability_zone": "us-east-1a", "route_to_igw": True},
                "is_simulated": "true",
                "synced_at": "2026-09-25T14:00:00Z"
            },
            {
                "id": 3,
                "resource_id": "subnet-08c31e9a34",
                "resource_type": "subnet",
                "region": "us-east-1",
                "name": "NetFusion-Private-Subnet-1",
                "status": "available",
                "cidr_or_ip": "10.20.2.0/24",
                "vpc_id": "vpc-01982ab91c4",
                "details": {"availability_zone": "us-east-1a", "route_to_nat": True},
                "is_simulated": "true",
                "synced_at": "2026-09-25T14:00:00Z"
            },
            {
                "id": 4,
                "resource_id": "i-08fe37b1029ba",
                "resource_type": "ec2",
                "region": "us-east-1",
                "name": "NetFusion-Bastion-Host",
                "status": "running",
                "cidr_or_ip": "10.20.1.15",
                "vpc_id": "vpc-01982ab91c4",
                "details": {"instance_type": "t3.micro", "public_ip": "54.210.88.19", "key_name": "netfusion-key"},
                "is_simulated": "true",
                "synced_at": "2026-09-25T14:00:00Z"
            },
            {
                "id": 5,
                "resource_id": "i-09cba328401ef",
                "resource_type": "ec2",
                "region": "us-east-1",
                "name": "NetFusion-App-Instance",
                "status": "running",
                "cidr_or_ip": "10.20.2.45",
                "vpc_id": "vpc-01982ab91c4",
                "details": {"instance_type": "t3.medium", "public_ip": None, "security_groups": ["sg-0a817b3f92"]},
                "is_simulated": "true",
                "synced_at": "2026-09-25T14:00:00Z"
            },
            {
                "id": 6,
                "resource_id": "sg-0a817b3f92",
                "resource_type": "security_group",
                "region": "us-east-1",
                "name": "netfusion-bastion-sg",
                "status": "active",
                "cidr_or_ip": "0.0.0.0/0",
                "vpc_id": "vpc-01982ab91c4",
                "details": {"inbound": [{"port": 22, "protocol": "tcp"}, {"port": 51820, "protocol": "udp"}]},
                "is_simulated": "true",
                "synced_at": "2026-09-25T14:00:00Z"
            }
        ]
