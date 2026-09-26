# WireGuard Hybrid VPN Specification

## 1. Network Topology & Addressing

```text
+-----------------------------------+               +-----------------------------------+
|      Docker On-Premises           |               |             AWS Cloud             |
|   Subnet: 10.10.0.0/16            |               |        Subnet: 10.20.0.0/16       |
|                                   |               |                                   |
|   VPN Gateway: 10.10.100.10       |               |        Bastion EC2: 10.20.1.15    |
|   Tunnel IP: 10.50.0.1/30 (wg0)   |               |   Tunnel IP: 10.50.0.2/30 (wg0)   |
|   UDP Port: 51820                 |               |   UDP Port: 51820                 |
+-----------------+-----------------+               +-----------------+-----------------+
                  |                                                   |
                  +======== WireGuard Encrypted Tunnel ===============+
                             Point-to-Point Overlay: 10.50.0.0/30
```

---

## 2. Configuration Profiles

### 2.1 On-Premises WireGuard Config (`/etc/wireguard/wg0.conf`)
```ini
[Interface]
Address = 10.50.0.1/30
ListenPort = 51820
PrivateKey = <ONPREM_PRIVATE_KEY>
PostUp = iptables -A FORWARD -i wg0 -j ACCEPT; iptables -A FORWARD -o wg0 -j ACCEPT; iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
PostDown = iptables -D FORWARD -i wg0 -j ACCEPT; iptables -D FORWARD -o wg0 -j ACCEPT; iptables -t nat -D POSTROUTING -o eth0 -j MASQUERADE

[Peer]
PublicKey = <AWS_PUBLIC_KEY>
Endpoint = 54.210.88.19:51820
AllowedIPs = 10.20.0.0/16, 10.50.0.2/32
PersistentKeepalive = 25
```

### 2.2 AWS WireGuard Config (`/etc/wireguard/wg0.conf`)
```ini
[Interface]
Address = 10.50.0.2/30
ListenPort = 51820
PrivateKey = <AWS_PRIVATE_KEY>
PostUp = iptables -A FORWARD -i wg0 -j ACCEPT; iptables -A FORWARD -o wg0 -j ACCEPT; iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE

[Peer]
PublicKey = <ONPREM_PUBLIC_KEY>
Endpoint = 198.51.100.1:51820
AllowedIPs = 10.10.0.0/16, 10.50.0.1/32
PersistentKeepalive = 25
```

---

## 3. Tunnel Verification

```bash
# Verify WireGuard interface status on the gateway container
docker exec -it netfusion-vpn-gateway wg show

# Ping across the tunnel to the AWS endpoint
docker exec -it netfusion-vpn-gateway ping -c 3 10.50.0.2

# Ping AWS Application EC2 from on-prem client
docker exec -it netfusion-client-01 ping -c 3 10.20.2.45
```
