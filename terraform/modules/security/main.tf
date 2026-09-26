resource "aws_security_group" "bastion" {
  name        = "${var.environment}-netfusion-bastion-sg"
  description = "Security group for Bastion and WireGuard Endpoint"
  vpc_id      = var.vpc_id

  # WireGuard UDP Tunnel Port
  ingress {
    description = "WireGuard Tunnel"
    from_port   = 51820
    to_port     = 51820
    protocol    = "udp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # SSH Management
  ingress {
    description = "Admin SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.admin_cidr]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.environment}-bastion-sg"
  }
}

resource "aws_security_group" "app" {
  name        = "${var.environment}-netfusion-app-sg"
  description = "Security group for Private Application EC2"
  vpc_id      = var.vpc_id

  # Allow HTTP from On-Premises Network (Hybrid Flow)
  ingress {
    description = "HTTP from Docker On-Prem"
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = [var.onprem_cidr, var.vpc_cidr]
  }

  # Allow ICMP Ping for diagnostics
  ingress {
    description = "ICMP Ping"
    from_port   = -1
    to_port     = -1
    protocol    = "icmp"
    cidr_blocks = [var.onprem_cidr, var.vpc_cidr]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.environment}-app-sg"
  }
}
