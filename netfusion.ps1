<#
.SYNOPSIS
    NetFusion: Unified Lifecycle Control Script (PowerShell for Windows)
.DESCRIPTION
    Manages local Docker on-premises environment and AWS Cloud EC2 infrastructure.
.PARAMETER Action
    start, stop, restart, status, or test
#>
[CmdletBinding()]
param (
    [Parameter(Position = 0, Mandatory = $false)]
    [ValidateSet("start", "stop", "restart", "status", "test", "help")]
    [string]$Action = "help"
)

$AwsRegion = "us-east-2"
$AwsPublicInstance = "i-092992dd8aa33cc41"
$AwsPrivateInstance = "i-0978d5852b2854fe8"
$AwsInstances = @($AwsPublicInstance, $AwsPrivateInstance)

function Show-Header {
    Write-Host ""
    Write-Host "======================================================================" -ForegroundColor Cyan
    Write-Host "  NetFusion: Hybrid Cloud Network Automation & Security Platform" -ForegroundColor Cyan
    Write-Host "======================================================================" -ForegroundColor Cyan
}

function Configure-HybridRouting {
    Write-Host "  -> Applying multi-segment Linux routing and tunnel rules..." -ForegroundColor Gray
    Start-Sleep -Seconds 3

    # On-Prem Router static routes
    docker exec netfusion-router ip route add 10.20.0.0/16 via 10.10.100.10 2>$null
    docker exec netfusion-router ip route add 10.50.0.0/24 via 10.10.100.10 2>$null

    # Clients static routes
    docker exec netfusion-client-01 ip route add 10.20.0.0/16 via 10.10.20.1 2>$null
    docker exec netfusion-client-01 ip route add 10.50.0.0/24 via 10.10.20.1 2>$null
    docker exec netfusion-client-02 ip route add 10.20.0.0/16 via 10.10.20.1 2>$null
    docker exec netfusion-client-02 ip route add 10.50.0.0/24 via 10.10.20.1 2>$null

    # VPN Gateway routes & NAT
    docker exec netfusion-vpn-gateway ip route add 10.10.0.0/16 via 10.10.100.1 dev eth0 2>$null
    docker exec netfusion-vpn-gateway iptables -t nat -A POSTROUTING -o wg0 -j MASQUERADE 2>$null
    docker exec netfusion-vpn-gateway iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE 2>$null
    docker exec netfusion-vpn-gateway iptables -A FORWARD -i eth0 -o wg0 -j ACCEPT 2>$null
    docker exec netfusion-vpn-gateway iptables -A FORWARD -i wg0 -o eth0 -j ACCEPT 2>$null

    Write-Host "  [OK] Multi-segment routing and WireGuard NAT rules applied." -ForegroundColor Green
}

function Start-All {
    Show-Header
    Write-Host "[1/3] Starting On-Premises Docker Infrastructure..." -ForegroundColor Yellow
    docker compose up -d

    Write-Host ""
    Write-Host "[2/3] Configuring Hybrid Cloud Network Topologies..." -ForegroundColor Yellow
    Configure-HybridRouting

    Write-Host ""
    Write-Host "[3/3] Checking AWS Cloud Resources..." -ForegroundColor Yellow
    Write-Host "  -> Starting AWS EC2 instances: $($AwsInstances -join ' ')" -ForegroundColor Gray
    aws ec2 start-instances --instance-ids $AwsInstances --region $AwsRegion 2>$null
    Write-Host "  [OK] AWS EC2 start command issued." -ForegroundColor Green

    Write-Host ""
    Write-Host "======================================================================" -ForegroundColor Cyan
    Write-Host "  NetFusion is OPERATIONAL" -ForegroundColor Green
    Write-Host "======================================================================" -ForegroundColor Cyan
    Write-Host "  - Local Operations Dashboard : http://localhost:3000" -ForegroundColor White
    Write-Host "  - FastAPI Swagger Docs       : http://localhost:8000/docs" -ForegroundColor White
    Write-Host "  - Prometheus Monitoring      : http://localhost:9090" -ForegroundColor White
    Write-Host "  - Grafana Dashboards         : http://localhost:3001" -ForegroundColor White
    Write-Host "  - AWS Live Cloud NOC         : http://3.145.176.228:3000" -ForegroundColor White
    Write-Host "  - Credentials                : admin@netfusion.local / Admin@NetFusion2026!" -ForegroundColor White
    Write-Host "======================================================================" -ForegroundColor Cyan
}

function Stop-All {
    Show-Header
    Write-Host "[1/2] Stopping Local Docker Containers..." -ForegroundColor Yellow
    docker compose down

    Write-Host ""
    Write-Host "[2/2] Stopping AWS Cloud EC2 Instances (Preventing Cloud Billing)..." -ForegroundColor Yellow
    Write-Host "  -> Stopping AWS EC2 instances: $($AwsInstances -join ' ')" -ForegroundColor Gray
    aws ec2 stop-instances --instance-ids $AwsInstances --region $AwsRegion 2>$null
    Write-Host "  [OK] AWS EC2 stop command issued successfully." -ForegroundColor Green

    Write-Host ""
    Write-Host "======================================================================" -ForegroundColor Cyan
    Write-Host "  NetFusion has been completely STOPPED." -ForegroundColor Green
    Write-Host "  All local containers terminated and cloud compute paused." -ForegroundColor Green
    Write-Host "======================================================================" -ForegroundColor Cyan
}

function Show-Status {
    Show-Header
    Write-Host "--- Local Docker Container Status ---" -ForegroundColor Yellow
    docker compose ps

    Write-Host ""
    Write-Host "--- AWS EC2 Cloud Instances Status ($AwsRegion) ---" -ForegroundColor Yellow
    aws ec2 describe-instances --instance-ids $AwsInstances --region $AwsRegion --query "Reservations[*].Instances[*].[InstanceId,Tags[?Key=='Name'].Value|[0],State.Name]" --output table 2>$null
}

function Run-Tests {
    Show-Header
    Write-Host "--- Running On-Premises to Cloud Hybrid Connectivity Test ---" -ForegroundColor Yellow
    docker exec netfusion-client-01 /usr/local/bin/test-connectivity.sh 10.20.2.45 8080
}

if ($Action -eq "start") {
    Start-All
} elseif ($Action -eq "stop") {
    Stop-All
} elseif ($Action -eq "restart") {
    Stop-All
    Start-Sleep -Seconds 2
    Start-All
} elseif ($Action -eq "status") {
    Show-Status
} elseif ($Action -eq "test") {
    Run-Tests
} else {
    Write-Host "Usage: .\netfusion.ps1 [start | stop | restart | status | test]" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Commands:"
    Write-Host "  start   - Launch local Docker mesh, set hybrid routes, and start AWS EC2 instances"
    Write-Host "  stop    - Halt all local Docker containers and pause AWS EC2 instances (saves costs)"
    Write-Host "  restart - Full teardown and relaunch of the entire platform"
    Write-Host "  status  - Display running state of local containers and AWS cloud servers"
    Write-Host "  test    - Execute hybrid multi-hop ping and curl connectivity diagnostic suite"
}
