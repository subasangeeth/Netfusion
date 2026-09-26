# NetFusion Networking & Routing Specification

## 1. Network Topology & Addressing Architecture

```text
               +------------------------------------------------+
               |                 AWS CLOUD VPC                  |
               |                 10.20.0.0/16                   |
               +-----------------------+------------------------+
                                       |
                   WireGuard Tunnel    |
                    10.50.0.0/30       | (UDP 51820)
                                       v
               +------------------------------------------------+
               |               vpn-gateway (onprem)             |
               |           10.50.0.1  /  10.10.100.10           |
               +-----------------------+------------------------+
                                       |
                           onprem-transit: 10.10.100.0/24
                                       |
               +-----------------------v------------------------+
               |               firewall (onprem)                |
               |                Stateful Filter                 |
               +-----------------------+------------------------+
                                       |
               +-----------------------v------------------------+
               |                 router (onprem)                |
               |               Multi-Homed Gateway              |
               +---+-------------------+--------------------+---+
                   |                   |                    |
        onprem-users (VLAN 20)  onprem-servers (VLAN 30)  onprem-security (VLAN 40)
             10.10.20.0/24           10.10.30.0/24            10.10.40.0/24
             +----------+            +-----------+            +-----------+
             | client-01|            | app-server|            | suricata  |
             | client-02|            | db-server |            | collector |
             +----------+            +-----------+            +-----------+
```

---

## 2. IP Routing Tables

### 2.1 On-Premises Router Table
| Destination Prefix | Next Hop / Gateway | Interface / Device | Scope |
|---|---|---|---|
| `10.10.10.0/24` | Direct Link | `eth0` (`router`) | onprem-management |
| `10.10.20.0/24` | Direct Link | `eth1` (`router`) | onprem-users |
| `10.10.30.0/24` | Direct Link | `eth2` (`router`) | onprem-servers |
| `10.10.40.0/24` | Direct Link | `eth3` (`router`) | onprem-security |
| `10.10.100.0/24`| Direct Link | `eth4` (`router`) | onprem-transit |
| `10.20.0.0/16`  | `10.10.100.10` | `eth4` (`router`) | AWS VPC via VPN Gateway |

### 2.2 WireGuard VPN Gateway Table
| Destination Prefix | Next Hop / Gateway | Interface |
|---|---|---|
| `10.50.0.0/30` | Direct Link | `wg0` |
| `10.20.0.0/16` | `10.50.0.2` | `wg0` (AWS WireGuard Endpoint) |
| `10.10.0.0/16` | `10.10.100.1` | `eth0` (On-Prem Transit Router) |

### 2.3 AWS Route Tables (Terraform managed)
| Destination Prefix | Target | Route Table Scope |
|---|---|---|
| `10.20.0.0/16` | `local` | VPC Local |
| `0.0.0.0/0` | `igw-xxxx` | Public Subnet default route |
| `0.0.0.0/0` | `nat-xxxx` | Private Subnet default route |
| `10.10.0.0/16` | WireGuard ENI / Gateway | Route to On-Premises via Hybrid VPN |

---

## 3. Linux VLAN Sub-Interface Implementation (802.1Q)

Where Linux sub-interfaces are provisioned, NetFusion uses native 802.1Q tagging:

```bash
# Example Linux command creating an 802.1Q trunked sub-interface
ip link add link eth0 name eth0.20 type vlan id 20
ip addr add 10.10.20.1/24 dev eth0.20
ip link set dev eth0.20 up
```

In the Docker Compose environment, segmentation is implemented using distinct Docker bridge networks with dedicated IP subnets, replicating the broadcast domain isolation of VLANs without requiring root switch hardware.

---

## 4. Network Verification Commands

Use these commands to verify network reachability:

```bash
# 1. Verify Client-01 can ping Application Server through Router & Firewall
docker exec -it netfusion-client-01 ping -c 3 10.10.30.10

# 2. Verify Client-01 can access HTTP Application Server API
docker exec -it netfusion-client-01 curl -s http://10.10.30.10:8080/health

# 3. Verify Firewall drops direct user access to Database Server (TCP 5432)
docker exec -it netfusion-client-01 nc -z -w 2 10.10.30.20 5432
# (Expected: Timeout / Filtered)

# 4. Inspect Router Routing Table
docker exec -it netfusion-router ip route show

# 5. Inspect WireGuard Status on VPN Gateway
docker exec -it netfusion-vpn-gateway wg show
```
