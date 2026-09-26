# Docker-Based On-Premises Simulation Architecture

## 1. Why Docker Instead of GNS3 or Cisco Packet Tracer?

Traditional enterprise network education and testing environments frequently rely on GNS3, EVE-NG, or Cisco Packet Tracer. However, these tools present severe drawbacks for modern DevOps and cloud automation:
1. **Proprietary Images & Heavy Footprint**: GNS3 and EVE-NG require multi-gigabyte proprietary Cisco IOS/IOS-XE, PAN-OS, or Arista vEOS binary images that require nested virtualization (KVM) and gigabytes of RAM.
2. **CI/CD Incompatibility**: Packet Tracer is a closed desktop GUI that cannot be automated in GitHub Actions or headless Linux environments.
3. **Slow Boot Times**: Starting 5 routers in GNS3 can take 5 to 10 minutes.
4. **Fragile Integration**: Automating GNS3 via external APIs requires complex hypervisor bridges.

### The NetFusion Solution
NetFusion leverages **native Docker containers and Linux kernel networking (`iproute2`, `iptables`, Linux bridges, and network namespaces)**.
- **Instant Spin-Up**: Entire multi-tier enterprise network starts in **< 15 seconds**.
- **Deterministic**: 100% reproducible with `docker compose up -d`.
- **Authentic Linux Kernel Semantics**: Uses the same IP routing engine, firewall packet matching (`conntrack`), and packet filtering algorithms powering modern Linux routers, Kubernetes CNIs, and AWS VPC underlying hypervisors.

---

## 2. Limitations Compared to Physical Enterprise Switches

To maintain technical integrity, we explicitly document the differences between Docker network simulations and physical enterprise switching:

| Feature | Physical Enterprise Switch (e.g. Cisco Catalyst 9300) | Docker & Linux Simulation | NetFusion Implementation |
|---|---|---|---|
| **Switching Plane** | Hardware ASICs with wire-speed TCAM lookups | Software bridge (`brctl` / `ip link add type bridge`) in kernel memory | Linux software bridge per logical segment |
| **802.1Q VLAN Tagging** | Hardware VLAN tags inserted into Ethernet frame headers (802.1Q) | Emulated via 802.1Q Linux sub-interfaces (`eth0.10`, `eth0.20`) or distinct Docker bridge networks | Dedicated Docker bridge networks mapped logically to VLAN IDs (e.g. VLAN 10, 20, 30, 40) |
| **Spanning Tree (STP)** | Rapid-PVST+ or MSTP hardware negotiation | Disabled by default in container veth pairs | Loop-free tree topology enforced by Docker network definitions |
| **Layer 2 Discovery** | CDP (Cisco Discovery Protocol) / LLDP | LLDP / ARP table examination | Docker container metadata discovery + real Linux ARP caching |
| **MAC Address Learning**| Hardware CAM table with fast aging timer | Kernel FDB (Forwarding Database) on software bridges | Standard Linux kernel FDB |

> [!NOTE]
> NetFusion does **NOT** falsely claim that Docker containers are physical managed switch hardware. When 802.1Q sub-interfaces or software bridges are used, they are accurately labeled as **Linux Software Bridge Segmentation**.

---

## 3. Logical Network Segmentation & Addressing Scheme

The simulated on-premises network is partitioned into 5 isolated logical broadcast domains:

| Network Name | Subnet CIDR | Gateway IP | Simulated VLAN | Purpose | Connected Containers |
|---|---|---|---|---|---|
| `onprem-management` | `10.10.10.0/24` | `10.10.10.1` | VLAN 10 | Administrative control & monitoring | `router` |
| `onprem-users` | `10.10.20.0/24` | `10.10.20.1` | VLAN 20 | User workstations & laptops | `client-01`, `client-02`, `router` |
| `onprem-servers` | `10.10.30.0/24` | `10.10.30.1` | VLAN 30 | Production application and database tier | `app-server`, `db-server`, `router`, `firewall` |
| `onprem-security` | `10.10.40.0/24` | `10.10.40.1` | VLAN 40 | IDS sensors and telemetry collectors | `suricata`, `security-collector`, `router` |
| `onprem-transit` | `10.10.100.0/24`| `10.10.100.1`| VLAN 100| Edge transit and hybrid VPN termination | `vpn-gateway`, `router` |

---

## 4. Container Roles and Specifications

### 4.1 `router` (Core Enterprise Gateway)
- **Base**: Alpine Linux 3.19.
- **Responsibilities**:
  - Connects to all logical on-prem subnets.
  - Multi-homed interface routing (`eth0`, `eth1`, `eth2`, `eth3`, `eth4`).
  - Kernel IP forwarding enabled (`sysctl net.ipv4.ip_forward=1`).
  - Maintains the on-premises routing table.

### 4.2 `firewall` (Stateful Perimeter Filter)
- **Base**: Alpine Linux 3.19.
- **Responsibilities**:
  - Stateful packet inspection with `conntrack`.
  - Enforces least-privilege forwarding rules.
  - Permits HTTP (8080) from Users (`10.10.20.0/24`) to Application Server (`10.10.30.10`).
  - Blocks direct TCP 5432 (PostgreSQL) access from User workstations to the Database Server.

### 4.3 `app-server` (Internal Production Application)
- **Base**: Python 3.10 Alpine.
- **IP**: `10.10.30.10:8080`.
- **Responsibilities**:
  - Serves internal HTTP REST endpoints (`/health`, `/api/data`).
  - Acts as the application tier communicating with `db-server`.

### 4.4 `db-server` (Internal Production Database)
- **Base**: PostgreSQL 16 Alpine.
- **IP**: `10.10.30.20:5432`.
- **Responsibilities**:
  - Stores simulated ERP and business transactions.
  - Accessible only by `app-server` and Management tier.

### 4.5 `client-01` & `client-02` (User Workstations)
- **Base**: Alpine Linux 3.19 with `curl`, `iputils-ping`, `netcat`, `traceroute`, `nmap`.
- **IPs**: `10.10.20.10` and `10.10.20.11`.
- **Responsibilities**:
  - Diagnostic test generation (ping, traceroute, curl).
  - Source for safe in-lab security simulation probes.

### 4.6 `vpn-gateway` (Hybrid Cloud Edge)
- **Base**: Alpine Linux with `wireguard-tools`.
- **IP**: `10.10.100.10` (Transit) + `10.50.0.1` (WireGuard Tunnel).
- **Responsibilities**:
  - Encapsulates traffic destined for AWS (`10.20.0.0/16`) across WireGuard UDP 51820.
