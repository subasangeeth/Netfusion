#!/bin/bash

TARGET=${1:-10.10.30.10}
PORT=${2:-8080}

echo "======================================================"
echo "[NetFusion Client] Diagnostic Connectivity Test Suite"
echo "Source Host: $(hostname) ($(ip -br addr show eth0 | awk '{print $3}'))"
echo "Target Host: $TARGET : $PORT"
echo "Timestamp  : $(date -u)"
echo "======================================================"

echo ""
echo "--- 1. ICMP Ping Test ---"
if ping -c 3 -W 2 "$TARGET" > /dev/null 2>&1; then
    echo "✓ PING SUCCESS: Host $TARGET is reachable via ICMP."
else
    echo "✗ PING FAILURE: Host $TARGET is unreachable via ICMP."
fi

echo ""
echo "--- 2. TCP Port Probe (nc) ---"
if nc -z -w 3 "$TARGET" "$PORT" > /dev/null 2>&1; then
    echo "✓ TCP SUCCESS: Port $PORT on $TARGET is open and accepting connections."
else
    echo "✗ TCP FAILURE: Port $PORT on $TARGET is closed or filtered by firewall."
fi

if [ "$PORT" -eq 8080 ] || [ "$PORT" -eq 80 ]; then
    echo ""
    echo "--- 3. HTTP Application Health Probe ---"
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 3 "http://$TARGET:$PORT/health" || echo "000")
    if [ "$HTTP_CODE" = "200" ]; then
        echo "✓ HTTP 200 OK: Application service is healthy."
        curl -s "http://$TARGET:$PORT/health" | head -n 10
    else
        echo "✗ HTTP PROBE FAILED: Response code $HTTP_CODE"
    fi
fi

echo ""
echo "--- 4. Layer 3 Traceroute Path ---"
traceroute -n -w 2 "$TARGET" 2>&1 | head -n 6

echo ""
echo "======================================================"
echo "[NetFusion Client] Test execution complete."
echo "======================================================"
