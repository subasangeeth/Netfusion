# NetFusion: Hybrid Cloud Network Operations Center (NOC)

**NetFusion** is an enterprise-grade hybrid cloud infrastructure monitoring dashboard built for our MCA final project. It provides deep visibility across On-Premises Enterprise Data Center network nodes, hybrid transit circuits (AWS Direct Connect & IPsec VPN), and AWS Cloud microservices.

---

## Key Design Principles & Architecture

1. **Independent Frontend Layer**: 
   - Deliberately decoupled from heavy, unstable physical or virtual network emulators (zero dependency on VMware Workstation, Oracle VirtualBox, GNS3, or live Cisco IOSvL2 images).
   - Telemetry schemas follow real-world Cisco IOS-XE, PAN-OS, and AWS CloudWatch operational standards.

2. **Clean Swappable API Service Layer (`src/services/api.js`)**:
   - The UI components never touch raw mock data directly.
   - All components call standard asynchronous service methods (`api.getDevices()`, `api.getCloud()`, `api.getAlerts()`, `api.getLogs()`, etc.).
   - Switching between mock demonstration data and your teammate's live AWS backend requires modifying just one flag in `src/services/api.js`:
     ```javascript
     export const API_CONFIG = {
       USE_MOCK: false, // Set to false when your teammate's AWS API is live
       BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
     };
     ```

3. **Dark NOC Operations Center Aesthetic**:
   - High-contrast dark palette (`#080c14` / `#0f172a`), sleek glassmorphic cards, glowing status pulses (`#06b6d4`, `#10b981`, `#f59e0b`, `#f43f5e`), and responsive layouts.

---

## Directory Structure

```
netfusion/
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.js
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── index.css
    ├── components/              # Reusable UI widgets
    │   ├── StatCard.jsx         # KPI metric card with icons & trends
    │   ├── StatusBadge.jsx      # Glowing pulse status indicator
    │   ├── DataTable.jsx        # NOC-styled table with row clicks
    │   ├── SearchFilterBar.jsx  # Search bar with category filter tabs
    │   ├── Modal.jsx            # Dark backdrop modal dialog
    │   └── Drawer.jsx           # Slide-out drawer for node deep-dive
    ├── pages/                   # The 8 dedicated dashboard pages
    │   ├── Overview.jsx         # Executive NOC summary, 24h trends, recent events
    │   ├── Infrastructure.jsx   # Hybrid device inventory with side inspection drawer
    │   ├── Network.jsx          # WAN bandwidth, latency probes, interface table
    │   ├── Cloud.jsx            # Teammate's AWS domain (EC2, RDS, ALB, S3, API contract)
    │   ├── Alerts.jsx           # Triage console (Acknowledge, Resolve, Export CSV)
    │   ├── Logs.jsx             # Searchable syslog & CloudWatch stream with pause
    │   ├── Troubleshooting.jsx  # Diagnostic assistant with root cause & runbooks
    │   └── Topology.jsx         # 3-Zone interactive visual hybrid topology diagram
    ├── layouts/                 # Frame & navigation
    │   ├── DashboardLayout.jsx  # Main container with responsive drawer
    │   ├── Sidebar.jsx          # NOC navigation with live alert badges
    │   ├── Topbar.jsx           # Clocks, auto-refresh, and Mock/Live API toggle
    │   └── SystemStatusStrip.jsx# Bottom status line with latency & health score
    ├── services/                # Decoupled API abstraction
    │   ├── api.js               # Unified API interface (swappable mock vs live)
    │   └── mockService.js       # Asynchronous mock data fetcher with mutations
    ├── data/                    # Pure, realistic JSON datasets
    │   ├── devices.json         # Routers, switches, servers, cloud instances
    │   ├── cloud.json           # AWS EC2, RDS, ALB, S3, CloudWatch telemetry
    │   ├── network.json         # Interface counters, latency probes, throughput
    │   ├── alerts.json          # P1 Critical, P2 Warning, and Informational alerts
    │   ├── logs.json            # RFC 5424 Syslog and CloudWatch log entries
    │   ├── metrics.json         # Time-series telemetry points for Recharts
    │   └── diagnostics.json     # Rule-based troubleshooting database
    ├── charts/                  # Reusable Recharts components
    │   ├── CpuMemoryTrendChart.jsx
    │   ├── BandwidthTrafficChart.jsx
    │   ├── LatencyDistributionChart.jsx
    │   └── ResourceGauge.jsx
    ├── hooks/                   # Custom hooks
    │   ├── usePolling.js        # Periodic auto-refresh interval manager
    │   └── useDebounce.js       # Debounced search input
    └── utils/                   # Formatting & theme utilities
        ├── formatters.js        # Bytes, bitrates, uptime, timestamps
        ├── statusTheme.js       # Status & severity color mappings
        └── exportUtils.js       # CSV export generator
```

---

## Getting Started

### 1. Launch Development Server
In your terminal, navigate to the project directory and start the Vite dev server:
```bash
cd netfusion
npm run dev
```
Open your browser at `http://localhost:3000`.

### 2. Build for Production
To generate the optimized production build:
```bash
npm run build
```

---

## 8 Pages Overview

1. **Overview**: Executive NOC dashboard featuring system health index (98.2%), aggregate 24h CPU/RAM trends, hybrid ingress/egress bandwidth area charts, and live incident stream.
2. **Infrastructure**: Complete hybrid inventory table (Cisco ASR routers, Catalyst 9300 switches, Dell PowerEdge ESXi hypervisors, AWS EC2, RDS, ALB). Click any device row to slide open the technical specifications drawer.
3. **Network**: Deep interface telemetry (e.g. `TenGigabitEthernet0/1/0` AWS Direct Connect link, `Tunnel0` IPsec, and `GigabitEthernet0/0/1` SD-WAN uplink with CRC error tracking), real-time latency probes, and packet loss gauges.
4. **Cloud**: Dedicated AWS operational view reflecting your teammate's cloud resources (EC2 compute fleet, RDS PostgreSQL Multi-AZ cluster, ALB target group status, S3 buckets, and monthly AWS cost estimate).
5. **Alerts**: Triage console with P1 Critical / P2 Warning / Informational filtering. Operators can click **Acknowledge** or **Resolve** which updates in-memory state and creates an audit log entry.
6. **Logs**: Real-time terminal-style Syslog & CloudWatch log viewer with severity level filters (CRIT, WARN, INFO, DEBUG), regex search, log stream pause, and copy/export functionality.
7. **Troubleshooting**: Diagnostic assistant with node selector, root-cause analysis engine, and step-by-step diagnostic runbooks containing safe CLI syntaxes and expected verification criteria.
8. **Topology**: 3-zone visual map illustrating the data flow from On-Premises Hardware across the Hybrid Interconnect (Direct Connect & IPsec) to the AWS Production VPC. Click any node to view real-time telemetry.

---

## Teammate Integration Guide (Connecting Real AWS API)

When your teammate's backend collector is ready:
1. Create a `.env` file in the `netfusion/` root:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
2. In `src/services/api.js`, set `USE_MOCK: false` or toggle it directly via the **API Layer** button in the dashboard top bar.
3. Ensure their backend returns JSON adhering to the structures documented in `src/data/*.json`.
