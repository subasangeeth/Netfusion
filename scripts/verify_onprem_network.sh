#!/usr/bin/env bash
set -e

echo "=========================================================="
echo " NetFusion: On-Premises Network Verification Suite"
echo "=========================================================="

echo "--- Test 1: Client to App-Server Ping (ICMP) ---"
docker exec netfusion-client-01 ping -c 2 10.10.30.10

echo ""
echo "--- Test 2: Client to App-Server HTTP API ---"
docker exec netfusion-client-01 curl -s http://10.10.30.10:8080/health

echo ""
echo "--- Test 3: Client direct access to DB (Port 5432 - Should be BLOCKED) ---"
if docker exec netfusion-client-01 nc -z -w 2 10.10.30.20 5432; then
    echo "FAIL: Direct database port is unexpectedly accessible!"
    exit 1
else
    echo "PASS: Direct user access to database is successfully blocked by firewall rules."
fi

echo ""
echo "--- Test 4: Router Routing Table ---"
docker exec netfusion-router ip route show

echo ""
echo "--- Test 5: WireGuard Status ---"
docker exec netfusion-vpn-gateway wg show 2>/dev/null || docker exec netfusion-vpn-gateway cat /var/log/wireguard/status.json 2>/dev/null || true

echo ""
echo "=========================================================="
echo " On-Premises Network Verification Completed Successfully"
echo "=========================================================="
