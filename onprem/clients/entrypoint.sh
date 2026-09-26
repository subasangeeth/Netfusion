#!/bin/bash
# Configure static routes to corporate router
ip route add 10.10.30.0/24 via 10.10.20.1 2>/dev/null || true
ip route add 10.20.0.0/16 via 10.10.20.1 2>/dev/null || true
ip route add 10.50.0.0/24 via 10.10.20.1 2>/dev/null || true

exec tail -f /dev/null
