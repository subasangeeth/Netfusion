#!/bin/bash
set -e

echo "[NetFusion Router] Initializing Linux Core Router..."

# Enable IPv4 forwarding
sysctl -w net.ipv4.ip_forward=1 || echo "Warning: sysctl net.ipv4.ip_forward could not be set directly (must be passed via docker sysctls)"

# Allow forwarding across all interfaces
iptables -P FORWARD ACCEPT
iptables -F FORWARD

# Display network interfaces and IP addresses
echo "[NetFusion Router] Detected Interfaces:"
ip -br addr show

# Static route to AWS Cloud VPC and Tunnel via VPN Gateway
ip route add 10.20.0.0/16 via 10.10.100.10 2>/dev/null || true
ip route add 10.50.0.0/24 via 10.10.100.10 2>/dev/null || true

echo "[NetFusion Router] Current Routing Table:"
ip route show

echo "[NetFusion Router] Core Router is running and forwarding packets."
# Keep container active
exec tail -f /dev/null
