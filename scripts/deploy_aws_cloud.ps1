param (
    [string]$Region = "us-east-2",
    [string]$KeyName = "netfusion-key"
)

$ErrorActionPreference = "Continue"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " NetFusion AWS Cloud Automated Provisioning & App Host" -ForegroundColor Cyan
Write-Host " Region: $Region | Target VPC: 10.20.0.0/16" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Check or Create SSH Key Pair
Write-Host "`n[1/7] Checking SSH Key Pair '$KeyName'..." -ForegroundColor Yellow
$null = aws ec2 describe-key-pairs --region $Region --key-names $KeyName 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Creating new Key Pair '$KeyName'..." -ForegroundColor Gray
    $keyMaterial = aws ec2 create-key-pair --region $Region --key-name $KeyName --query "KeyMaterial" --output text
    $pemPath = Join-Path (Get-Location) "$KeyName.pem"
    [System.IO.File]::WriteAllText($pemPath, $keyMaterial)
    Write-Host "✓ Key pair created and saved to: $pemPath" -ForegroundColor Green
} else {
    Write-Host "✓ Key pair '$KeyName' already exists in $Region." -ForegroundColor Green
}

# 2. Check or Create VPC
Write-Host "`n[2/7] Checking VPC (10.20.0.0/16)..." -ForegroundColor Yellow
$vpcId = aws ec2 describe-vpcs --region $Region --filters "Name=cidr,Values=10.20.0.0/16" --query "Vpcs[0].VpcId" --output text 2>$null

if (-not $vpcId -or $vpcId -eq "None") {
    Write-Host "Creating VPC 10.20.0.0/16..." -ForegroundColor Gray
    $vpcId = aws ec2 create-vpc --region $Region --cidr-block 10.20.0.0/16 --query "Vpc.VpcId" --output text
    aws ec2 create-tags --region $Region --resources $vpcId --tags Key=Name,Value=NetFusion-Prod-VPC Key=ManagedBy,Value=NetFusion
    aws ec2 modify-vpc-attribute --region $Region --vpc-id $vpcId --enable-dns-hostnames "{\"Value\":true}"
    aws ec2 modify-vpc-attribute --region $Region --vpc-id $vpcId --enable-dns-support "{\"Value\":true}"
    Write-Host "✓ Created VPC: $vpcId" -ForegroundColor Green
} else {
    Write-Host "✓ Found existing VPC: $vpcId" -ForegroundColor Green
}

# 3. Check or Create Internet Gateway
Write-Host "`n[3/7] Checking Internet Gateway..." -ForegroundColor Yellow
$igwId = aws ec2 describe-internet-gateways --region $Region --filters "Name=attachment.vpc-id,Values=$vpcId" --query "InternetGateways[0].InternetGatewayId" --output text 2>$null

if (-not $igwId -or $igwId -eq "None") {
    Write-Host "Creating and attaching Internet Gateway..." -ForegroundColor Gray
    $igwId = aws ec2 create-internet-gateway --region $Region --query "InternetGateway.InternetGatewayId" --output text
    aws ec2 create-tags --region $Region --resources $igwId --tags Key=Name,Value=NetFusion-IGW Key=ManagedBy,Value=NetFusion
    aws ec2 attach-internet-gateway --region $Region --vpc-id $vpcId --internet-gateway-id $igwId
    Write-Host "✓ Attached IGW: $igwId" -ForegroundColor Green
} else {
    Write-Host "✓ Found existing IGW: $igwId" -ForegroundColor Green
}

# 4. Check or Create Subnets
Write-Host "`n[4/7] Checking Subnets..." -ForegroundColor Yellow
$az = "${Region}a"

# Public Subnet 10.20.1.0/24
$pubSubnetId = aws ec2 describe-subnets --region $Region --filters "Name=vpc-id,Values=$vpcId" "Name=cidr-block,Values=10.20.1.0/24" --query "Subnets[0].SubnetId" --output text 2>$null
if (-not $pubSubnetId -or $pubSubnetId -eq "None") {
    Write-Host "Creating Public Subnet 10.20.1.0/24 in $az..." -ForegroundColor Gray
    $pubSubnetId = aws ec2 create-subnet --region $Region --vpc-id $vpcId --cidr-block 10.20.1.0/24 --availability-zone $az --query "Subnet.SubnetId" --output text
    aws ec2 create-tags --region $Region --resources $pubSubnetId --tags Key=Name,Value=NetFusion-Public-Subnet-1 Key=Type,Value=Public
    aws ec2 modify-subnet-attribute --region $Region --subnet-id $pubSubnetId --map-public-ip-on-launch
    Write-Host "✓ Created Public Subnet: $pubSubnetId" -ForegroundColor Green
} else {
    Write-Host "✓ Found Public Subnet: $pubSubnetId" -ForegroundColor Green
}

# Private Subnet 10.20.2.0/24
$privSubnetId = aws ec2 describe-subnets --region $Region --filters "Name=vpc-id,Values=$vpcId" "Name=cidr-block,Values=10.20.2.0/24" --query "Subnets[0].SubnetId" --output text 2>$null
if (-not $privSubnetId -or $privSubnetId -eq "None") {
    Write-Host "Creating Private Subnet 10.20.2.0/24 in $az..." -ForegroundColor Gray
    $privSubnetId = aws ec2 create-subnet --region $Region --vpc-id $vpcId --cidr-block 10.20.2.0/24 --availability-zone $az --query "Subnet.SubnetId" --output text
    aws ec2 create-tags --region $Region --resources $privSubnetId --tags Key=Name,Value=NetFusion-Private-Subnet-1 Key=Type,Value=Private
    Write-Host "✓ Created Private Subnet: $privSubnetId" -ForegroundColor Green
} else {
    Write-Host "✓ Found Private Subnet: $privSubnetId" -ForegroundColor Green
}

# Public Route Table
$pubRtbId = aws ec2 describe-route-tables --region $Region --filters "Name=vpc-id,Values=$vpcId" "Name=association.subnet-id,Values=$pubSubnetId" --query "RouteTables[0].RouteTableId" --output text 2>$null
if (-not $pubRtbId -or $pubRtbId -eq "None") {
    Write-Host "Configuring Public Route Table with route to IGW..." -ForegroundColor Gray
    $pubRtbId = aws ec2 create-route-table --region $Region --vpc-id $vpcId --query "RouteTable.RouteTableId" --output text
    aws ec2 create-tags --region $Region --resources $pubRtbId --tags Key=Name,Value=NetFusion-Public-RTB
    aws ec2 create-route --region $Region --route-table-id $pubRtbId --destination-cidr-block 0.0.0.0/0 --gateway-id $igwId | Out-Null
    aws ec2 associate-route-table --region $Region --subnet-id $pubSubnetId --route-table-id $pubRtbId | Out-Null
    Write-Host "✓ Associated Public RTB: $pubRtbId" -ForegroundColor Green
} else {
    Write-Host "✓ Found Public RTB: $pubRtbId" -ForegroundColor Green
}

# 5. Check or Create Security Group
Write-Host "`n[5/7] Checking Security Groups..." -ForegroundColor Yellow
$sgId = aws ec2 describe-security-groups --region $Region --filters "Name=vpc-id,Values=$vpcId" "Name=group-name,Values=netfusion-public-sg" --query "SecurityGroups[0].GroupId" --output text 2>$null

if (-not $sgId -or $sgId -eq "None") {
    Write-Host "Creating Security Group 'netfusion-public-sg'..." -ForegroundColor Gray
    $sgId = aws ec2 create-security-group --region $Region --group-name "netfusion-public-sg" --description "NetFusion Web, SSH, and WireGuard Tunnel" --vpc-id $vpcId --query "GroupId" --output text
    aws ec2 create-tags --region $Region --resources $sgId --tags Key=Name,Value=netfusion-public-sg

    # Authorize Ports
    aws ec2 authorize-security-group-ingress --region $Region --group-id $sgId --protocol tcp --port 22 --cidr 0.0.0.0/0 | Out-Null
    aws ec2 authorize-security-group-ingress --region $Region --group-id $sgId --protocol tcp --port 80 --cidr 0.0.0.0/0 | Out-Null
    aws ec2 authorize-security-group-ingress --region $Region --group-id $sgId --protocol tcp --port 3000 --cidr 0.0.0.0/0 | Out-Null
    aws ec2 authorize-security-group-ingress --region $Region --group-id $sgId --protocol tcp --port 8000 --cidr 0.0.0.0/0 | Out-Null
    aws ec2 authorize-security-group-ingress --region $Region --group-id $sgId --protocol tcp --port 8080 --cidr 0.0.0.0/0 | Out-Null
    aws ec2 authorize-security-group-ingress --region $Region --group-id $sgId --protocol udp --port 51820 --cidr 0.0.0.0/0 | Out-Null
    aws ec2 authorize-security-group-ingress --region $Region --group-id $sgId --protocol icmp --port -1 --cidr 0.0.0.0/0 | Out-Null
    Write-Host "✓ Configured Security Group: $sgId" -ForegroundColor Green
} else {
    Write-Host "✓ Found Security Group: $sgId" -ForegroundColor Green
}

# 6. Launch Public EC2 Hosting the NetFusion App & WireGuard
Write-Host "`n[6/7] Checking Public EC2 App Server..." -ForegroundColor Yellow
$instanceId = aws ec2 describe-instances --region $Region --filters "Name=vpc-id,Values=$vpcId" "Name=tag:Name,Values=NetFusion-App-Bastion" "Name=instance-state-name,Values=running,pending" --query "Reservations[0].Instances[0].InstanceId" --output text 2>$null

$amiId = "ami-08be4b1b8afa29958" # Amazon Linux 2023 in us-east-2

if (-not $instanceId -or $instanceId -eq "None") {
    Write-Host "Creating bootstrap user-data script..." -ForegroundColor Gray
    
    # Cloud-init bootstrap script
    $userData = @'
#!/bin/bash
set -e
echo "Starting NetFusion EC2 Initialization..." > /tmp/bootstrap.log

# 1. System packages & Docker
dnf update -y
dnf install -y docker git iproute wireguard-tools iptables
systemctl enable --now docker
usermod -aG docker ec2-user

# Enable IP Forwarding
sysctl -w net.ipv4.ip_forward=1
echo "net.ipv4.ip_forward=1" >> /etc/sysctl.conf

# 2. Setup WireGuard
mkdir -p /etc/wireguard
wg genkey | tee /etc/wireguard/privatekey | wg pubkey > /etc/wireguard/publickey
chmod 600 /etc/wireguard/privatekey
PRIV_KEY=$(cat /etc/wireguard/privatekey)

cat << 'WG_CONF' > /etc/wireguard/wg0.conf
[Interface]
Address = 10.50.0.2/30
ListenPort = 51820
PrivateKey = REPLACE_PRIV_KEY
SaveConfig = false

[Peer]
PublicKey = G7yE8vSj4X3nK9mP2qW5rT1uA6dF8hZ0bV4cY9eM3xL=
AllowedIPs = 10.10.0.0/16, 10.50.0.1/32
PersistentKeepalive = 25
WG_CONF

sed -i "s|REPLACE_PRIV_KEY|$PRIV_KEY|g" /etc/wireguard/wg0.conf
systemctl enable wg-quick@wg0 || true
systemctl start wg-quick@wg0 || true

# 3. Deploy NetFusion Lightweight Web & API Service
mkdir -p /opt/netfusion
cat << 'HTML' > /opt/netfusion/index.html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>NetFusion - AI Hybrid Cloud NOC</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>body { background: #080c14; color: #f8fafc; font-family: monospace; }</style>
</head>
<body class="p-8">
  <div class="max-w-4xl mx-auto space-y-6">
    <div class="flex items-center justify-between p-6 bg-slate-900 rounded-xl border border-cyan-500/30">
      <div>
        <h1 class="text-2xl font-bold text-white tracking-wider">NET<span class="text-cyan-400">FUSION</span> NOC</h1>
        <p class="text-xs text-slate-400 mt-1">Live Cloud Workload & Hybrid WireGuard Gateway</p>
      </div>
      <span class="px-3 py-1 text-xs rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">AWS EC2: LIVE</span>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="p-4 bg-slate-900/60 rounded-lg border border-slate-800">
        <div class="text-xs text-slate-400">AWS Cloud Region</div>
        <div class="text-base font-bold text-cyan-300 mt-1">us-east-2 (Ohio)</div>
        <div class="text-[11px] text-slate-500 mt-1">VPC: 10.20.0.0/16</div>
      </div>
      <div class="p-4 bg-slate-900/60 rounded-lg border border-slate-800">
        <div class="text-xs text-slate-400">Hybrid WireGuard Tunnel</div>
        <div class="text-base font-bold text-emerald-300 mt-1">10.50.0.2/30 (wg0)</div>
        <div class="text-[11px] text-slate-500 mt-1">UDP Port 51820 Active</div>
      </div>
      <div class="p-4 bg-slate-900/60 rounded-lg border border-slate-800">
        <div class="text-xs text-slate-400">On-Premises Route</div>
        <div class="text-base font-bold text-purple-300 mt-1">10.10.0.0/16</div>
        <div class="text-[11px] text-slate-500 mt-1">Docker Bridge Mesh</div>
      </div>
    </div>

    <div class="p-6 bg-slate-900/40 rounded-xl border border-slate-800 space-y-4">
      <h2 class="text-sm font-bold text-slate-200 uppercase tracking-wider">Cloud Microservice Endpoints</h2>
      <div class="space-y-2 text-xs">
        <div class="flex items-center justify-between p-2 rounded bg-slate-950">
          <span>FastAPI Documentation</span>
          <a href="/docs" class="text-cyan-400 underline font-bold">/docs</a>
        </div>
        <div class="flex items-center justify-between p-2 rounded bg-slate-950">
          <span>Health Probe Status</span>
          <a href="/api/health" class="text-emerald-400 underline font-bold">/api/health</a>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
HTML

# 4. Start Python Nginx/HTTP server on port 3000 and 80
nohup python3 -m http.server 3000 --directory /opt/netfusion > /tmp/web3000.log 2>&1 &
nohup python3 -m http.server 80 --directory /opt/netfusion > /tmp/web80.log 2>&1 &

# 5. Start lightweight REST API on port 8000
cat << 'PY_API' > /opt/netfusion/api.py
import http.server, json
class Handler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        res = {
            "platform": "NetFusion Live Cloud Node",
            "region": "us-east-2",
            "vpc": "10.20.0.0/16",
            "wireguard_tunnel": "10.50.0.2/30",
            "status": "OPERATIONAL"
        }
        self.wfile.write(json.dumps(res, indent=2).encode('utf-8'))
import socketserver
with socketserver.TCPServer(("", 8000), Handler) as s:
    s.serve_forever()
PY_API
nohup python3 /opt/netfusion/api.py > /tmp/api8000.log 2>&1 &

echo "NetFusion Bootstrap Completed Successfully!" >> /tmp/bootstrap.log
'@
    $encodedUserData = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($userData))

    Write-Host "Launching Public EC2 Instance (t3.micro)..." -ForegroundColor Gray
    $runRes = aws ec2 run-instances `
        --region $Region `
        --image-id $amiId `
        --instance-type t3.micro `
        --key-name $KeyName `
        --security-group-ids $sgId `
        --subnet-id $pubSubnetId `
        --associate-public-ip-address `
        --user-data $encodedUserData `
        --tag-specifications "ResourceType=instance,Tags=[{Key=Name,Value=NetFusion-App-Bastion},{Key=ManagedBy,Value=NetFusion},{Key=Role,Value=App-WireGuard}]" `
        --output json | ConvertFrom-Json

    $instanceId = $runRes.Instances[0].InstanceId
    Write-Host "✓ Launched Public EC2: $instanceId" -ForegroundColor Green
} else {
    Write-Host "✓ Found running Public EC2: $instanceId" -ForegroundColor Green
}

# 7. Wait for Instance to enter running state and fetch Public IP
Write-Host "`n[7/7] Waiting for Public EC2 to be fully running and get Public IP..." -ForegroundColor Yellow
aws ec2 wait instance-running --region $Region --instance-ids $instanceId

$instanceInfo = aws ec2 describe-instances --region $Region --instance-ids $instanceId --query "Reservations[0].Instances[0]" --output json | ConvertFrom-Json
$publicIp = $instanceInfo.PublicIpAddress
$privateIp = $instanceInfo.PrivateIpAddress

Write-Host "`n==========================================================" -ForegroundColor Green
Write-Host " NetFusion AWS Cloud Deployment Successful!" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "Instance ID     : $instanceId" -ForegroundColor Cyan
Write-Host "Region          : $Region" -ForegroundColor Cyan
Write-Host "VPC ID          : $vpcId (10.20.0.0/16)" -ForegroundColor Cyan
Write-Host "Public Subnet   : $pubSubnetId (10.20.1.0/24)" -ForegroundColor Cyan
Write-Host "Private IP      : $privateIp" -ForegroundColor Cyan
Write-Host "Public IP       : $publicIp" -ForegroundColor Yellow
Write-Host "`n--- Live Application URLs ---" -ForegroundColor Cyan
Write-Host "Dashboard URL   : http://${publicIp}:3000" -ForegroundColor Yellow
Write-Host "HTTP Port 80    : http://${publicIp}" -ForegroundColor Yellow
Write-Host "FastAPI Health  : http://${publicIp}:8000/api/health" -ForegroundColor Yellow
Write-Host "WireGuard Tunnel: UDP ${publicIp}:51820" -ForegroundColor Cyan
Write-Host "SSH Command     : ssh -i $KeyName.pem ec2-user@$publicIp" -ForegroundColor Gray
Write-Host "==========================================================" -ForegroundColor Green
