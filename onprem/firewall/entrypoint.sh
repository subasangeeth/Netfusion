#!/bin/bash
set -e

echo "[NetFusion Firewall] Initializing Stateful Linux Firewall..."

# Enable forwarding
sysctl -w net.ipv4.ip_forward=1 || echo "Warning: sysctl net.ipv4.ip_forward could not be set directly"

# Flush previous rules
iptables -F FORWARD
iptables -F INPUT

# Default policy: DROP forwarded traffic unless explicitly allowed
iptables -P FORWARD DROP

# 1. Allow Established and Related stateful connections
iptables -A FORWARD -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT

# 2. Drop Invalid packets
iptables -A FORWARD -m conntrack --ctstate INVALID -j DROP

# 3. Allow ICMP Echo Requests (ping) across all onprem subnets for network diagnostics
iptables -A FORWARD -p icmp --icmp-type echo-request -m limit --limit 10/sec -j ACCEPT

# 4. Allow Management (10.10.10.0/24) access to all on-prem subnets
iptables -A FORWARD -s 10.10.10.0/24 -j ACCEPT

# 5. Allow Users (10.10.20.0/24) to reach Application Server (10.10.30.10) on port 8080
iptables -A FORWARD -s 10.10.20.0/24 -d 10.10.30.10 -p tcp --dport 8080 -j ACCEPT

# 6. Explicitly DROP and LOG direct user access to Database Server (10.10.30.20:5432)
iptables -A FORWARD -s 10.10.20.0/24 -d 10.10.30.20 -p tcp --dport 5432 -j DROP

# 7. Allow Application Server (10.10.30.10) to reach Database Server (10.10.30.20:5432)
iptables -A FORWARD -s 10.10.30.10 -d 10.10.30.20 -p tcp --dport 5432 -j ACCEPT

# 8. Allow Transit & VPN Gateway (10.10.100.0/24) to reach Servers
iptables -A FORWARD -s 10.10.100.0/24 -d 10.10.30.0/24 -j ACCEPT

echo "[NetFusion Firewall] Active Forwarding Rules:"
iptables -L FORWARD -v -n --line-numbers

echo "[NetFusion Firewall] Firewall initialized in stateful enforcement mode."
exec tail -f /dev/null
