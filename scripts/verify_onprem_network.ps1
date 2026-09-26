Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " NetFusion: On-Premises Network Verification Suite" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# Check if containers are running
$containers = @("netfusion-router", "netfusion-firewall", "netfusion-app-server", "netfusion-db-server", "netfusion-client-01", "netfusion-vpn-gateway")
$allRunning = $true

foreach ($c in $containers) {
    $status = docker inspect -f '{{.State.Running}}' $c 2>$null
    if ($status -eq "true") {
        Write-Host "[OK] Container $c is RUNNING." -ForegroundColor Green
    } else {
        Write-Host "[WAIT] Container $c is not running yet." -ForegroundColor Yellow
        $allRunning = $false
    }
}

if (-not $allRunning) {
    Write-Host "Tip: Run 'docker compose up -d' first to launch the lab containers." -ForegroundColor DarkGray
    exit 0
}

Write-Host "`n--- Test 1: Client to App-Server Ping (ICMP) ---" -ForegroundColor Yellow
docker exec netfusion-client-01 ping -c 2 10.10.30.10

Write-Host "`n--- Test 2: Client to App-Server HTTP API ---" -ForegroundColor Yellow
docker exec netfusion-client-01 curl -s http://10.10.30.10:8080/health

Write-Host "`n--- Test 3: Client direct access to DB (Port 5432 - Should be BLOCKED by Firewall) ---" -ForegroundColor Yellow
docker exec netfusion-client-01 nc -z -w 2 10.10.30.20 5432
if ($LASTEXITCODE -ne 0) {
    Write-Host "PASS: Direct user access to database is successfully blocked by firewall rules!" -ForegroundColor Green
} else {
    Write-Host "FAIL: Direct database port is unexpectedly accessible." -ForegroundColor Red
}

Write-Host "`n--- Test 4: Router Routing Table ---" -ForegroundColor Yellow
docker exec netfusion-router ip route show

Write-Host "`n--- Test 5: WireGuard Status ---" -ForegroundColor Yellow
docker exec netfusion-vpn-gateway wg show 2>$null
if ($LASTEXITCODE -ne 0) {
    docker exec netfusion-vpn-gateway cat /var/log/wireguard/status.json 2>$null
}

Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host " On-Premises Network Verification Completed" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
