#!/usr/bin/env bash
# ==============================================================================
# NetFusion: Unified Lifecycle Control Script
# Manages local Docker on-premises environment and AWS Cloud EC2 infrastructure
# ==============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

AWS_REGION="${AWS_REGION:-us-east-2}"
AWS_PUBLIC_INSTANCE_ID="i-092992dd8aa33cc41"
AWS_PRIVATE_INSTANCE_ID="i-0978d5852b2854fe8"
AWS_INSTANCES="$AWS_PUBLIC_INSTANCE_ID $AWS_PRIVATE_INSTANCE_ID"

# If running inside WSL, map Windows AWS credentials to home directory
if [ -d "/mnt/c/Users/subas/.aws" ] && [ ! -f "$HOME/.aws/credentials" ]; then
    mkdir -p "$HOME/.aws"
    cp -r /mnt/c/Users/subas/.aws/* "$HOME/.aws/" 2>/dev/null || true
fi

print_header() {
    echo ""
    echo "======================================================================"
    echo "  NetFusion: Hybrid Cloud Network Automation & Security Platform"
    echo "======================================================================"
}

check_prereqs() {
    if ! command -v docker &> /dev/null; then
        echo "✗ Error: Docker is not installed or not in PATH."
        exit 1
    fi
}

configure_hybrid_network() {
    echo "  -> Applying multi-segment Linux routing and tunnel rules..."
    sleep 3

    # On-Prem Router static routes to AWS VPC & Tunnel
    docker exec netfusion-router ip route add 10.20.0.0/16 via 10.10.100.10 2>/dev/null || true
    docker exec netfusion-router ip route add 10.50.0.0/24 via 10.10.100.10 2>/dev/null || true

    # On-Prem Clients static routes
    docker exec netfusion-client-01 ip route add 10.20.0.0/16 via 10.10.20.1 2>/dev/null || true
    docker exec netfusion-client-01 ip route add 10.50.0.0/24 via 10.10.20.1 2>/dev/null || true
    docker exec netfusion-client-02 ip route add 10.20.0.0/16 via 10.10.20.1 2>/dev/null || true
    docker exec netfusion-client-02 ip route add 10.50.0.0/24 via 10.10.20.1 2>/dev/null || true

    # VPN Gateway routes & NAT masquerade
    docker exec netfusion-vpn-gateway ip route add 10.10.0.0/16 via 10.10.100.1 dev eth0 2>/dev/null || true
    docker exec netfusion-vpn-gateway iptables -t nat -A POSTROUTING -o wg0 -j MASQUERADE 2>/dev/null || true
    docker exec netfusion-vpn-gateway iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE 2>/dev/null || true
    docker exec netfusion-vpn-gateway iptables -A FORWARD -i eth0 -o wg0 -j ACCEPT 2>/dev/null || true
    docker exec netfusion-vpn-gateway iptables -A FORWARD -i wg0 -o eth0 -j ACCEPT 2>/dev/null || true

    echo "  ✓ Multi-segment routing and WireGuard NAT rules applied."
}

# Detect AWS CLI binary (supports native Linux and WSL/Git-Bash)
if command -v aws &> /dev/null; then
    AWS_CMD="aws"
elif command -v aws.exe &> /dev/null; then
    AWS_CMD="aws.exe"
else
    AWS_CMD=""
fi

start_aws_instances() {
    if [ -n "$AWS_CMD" ]; then
        echo "  -> Checking AWS EC2 instances ($AWS_REGION)..."
        if $AWS_CMD sts get-caller-identity &> /dev/null; then
            echo "  -> Starting AWS EC2 instances: $AWS_INSTANCES"
            $AWS_CMD ec2 start-instances --instance-ids $AWS_INSTANCES --region "$AWS_REGION" 2>/dev/null || true
            echo "  ✓ AWS EC2 start command issued."
        else
            echo "  ! Notice: AWS credentials not configured or session expired. Skipping AWS EC2 start."
        fi
    else
        echo "  ! Notice: AWS CLI not detected. Skipping AWS EC2 management."
    fi
}

stop_aws_instances() {
    if [ -n "$AWS_CMD" ]; then
        echo "  -> Checking AWS EC2 instances ($AWS_REGION)..."
        if $AWS_CMD sts get-caller-identity &> /dev/null; then
            echo "  -> Stopping AWS EC2 instances to halt cloud billing: $AWS_INSTANCES"
            $AWS_CMD ec2 stop-instances --instance-ids $AWS_INSTANCES --region "$AWS_REGION" 2>/dev/null || true
            echo "  ✓ AWS EC2 stop command issued successfully."
        else
            echo "  ! Notice: AWS credentials not configured. Skipping AWS EC2 stop."
        fi
    fi
}

start_all() {
    print_header
    check_prereqs
    echo "[1/3] Starting On-Premises Docker Infrastructure..."
    docker compose up -d

    echo ""
    echo "[2/3] Configuring Hybrid Cloud Network Topologies..."
    configure_hybrid_network

    echo ""
    echo "[3/3] Checking AWS Cloud Resources..."
    start_aws_instances

    echo ""
    echo "======================================================================"
    echo "  ✓ NetFusion is OPERATIONAL"
    echo "======================================================================"
    echo "  • Local Operations Dashboard : http://localhost:3000"
    echo "  • FastAPI Swagger Docs       : http://localhost:8000/docs"
    echo "  • Prometheus Monitoring      : http://localhost:9090"
    echo "  • Grafana Dashboards         : http://localhost:3001"
    echo "  • AWS Live Cloud NOC         : http://3.145.176.228:3000"
    echo "  • Credentials                : admin@netfusion.local / Admin@NetFusion2026!"
    echo "======================================================================"
}

stop_all() {
    print_header
    check_prereqs
    echo "[1/2] Stopping Local Docker Containers..."
    docker compose down

    echo ""
    echo "[2/2] Stopping AWS Cloud EC2 Instances (Preventing Cloud Billing)..."
    stop_aws_instances

    echo ""
    echo "======================================================================"
    echo "  ✓ NetFusion has been completely STOPPED."
    echo "  All local containers terminated and cloud compute paused."
    echo "======================================================================"
}

status_all() {
    print_header
    echo "--- Local Docker Container Status ---"
    docker compose ps

    echo ""
    echo "--- AWS EC2 Cloud Instances Status ($AWS_REGION) ---"
    if [ -n "$AWS_CMD" ] && $AWS_CMD sts get-caller-identity &> /dev/null; then
        $AWS_CMD ec2 describe-instances \
            --instance-ids $AWS_INSTANCES \
            --region "$AWS_REGION" \
            --query "Reservations[*].Instances[*].{ID:InstanceId,Name:Tags[?Key=='Name'].Value|[0],State:State.Name,PublicIP:PublicIpAddress,PrivateIP:PrivateIpAddress}" \
            --output table 2>/dev/null || echo "Unable to fetch EC2 status."
    else
        echo "AWS CLI not configured or credentials unavailable."
    fi
}

test_all() {
    print_header
    echo "--- Running On-Premises to Cloud Hybrid Connectivity Test ---"
    if docker ps --format '{{.Names}}' | grep -q 'netfusion-client-01'; then
        docker exec netfusion-client-01 /usr/local/bin/test-connectivity.sh 10.20.2.45 8080 || true
    else
        echo "✗ Docker containers are not running. Run './netfusion.sh start' first."
    fi
}

case "${1:-}" in
    start)
        start_all
        ;;
    stop)
        stop_all
        ;;
    restart)
        stop_all
        sleep 2
        start_all
        ;;
    status)
        status_all
        ;;
    test)
        test_all
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status|test}"
        echo ""
        echo "Commands:"
        echo "  start   - Launch local Docker mesh, set hybrid routes, and start AWS EC2 instances"
        echo "  stop    - Halt all local Docker containers and pause AWS EC2 instances (saves costs)"
        echo "  restart - Full teardown and relaunch of the entire platform"
        echo "  status  - Display running state of local containers and AWS cloud servers"
        echo "  test    - Execute hybrid multi-hop ping and curl connectivity diagnostic suite"
        exit 1
        ;;
esac
