import React, { useState, useEffect } from 'react';
import {
  Activity,
  Wifi,
  Radio,
  ArrowUpDown,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Zap,
  Globe
} from 'lucide-react';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import DataTable from '../components/DataTable';
import BandwidthTrafficChart from '../charts/BandwidthTrafficChart';
import LatencyDistributionChart from '../charts/LatencyDistributionChart';
import { api } from '../services/api';

export default function Network({ onNavigate }) {
  const [networkData, setNetworkData] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNetwork();
  }, []);

  async function loadNetwork() {
    try {
      setLoading(true);
      const [netRes, metRes] = await Promise.all([
        api.getNetwork(),
        api.getMetrics()
      ]);
      setNetworkData(netRes.data);
      setMetrics(metRes.data);
    } catch (err) {
      console.error('Failed to load network telemetry:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading || !networkData) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-cyan-500 border-t-transparent" />
      </div>
    );
  }

  const { summary, probes, interfaces } = networkData;

  const probeColumns = [
    {
      header: 'Probe Target',
      key: 'target',
      render: (target) => (
        <span className="font-bold text-white font-mono">{target}</span>
      )
    },
    {
      header: 'Endpoint IP / DNS',
      key: 'endpoint',
      render: (ip) => <span className="text-cyan-400 font-mono">{ip}</span>
    },
    {
      header: 'Round-Trip Latency',
      key: 'latency',
      render: (latency) => (
        <span
          className={`font-mono font-bold ${
            latency > 40 ? 'text-amber-400' : 'text-emerald-400'
          }`}
        >
          {latency} ms
        </span>
      )
    },
    {
      header: 'Packet Loss',
      key: 'loss',
      render: (loss) => (
        <span
          className={`font-mono ${
            loss > 0 ? 'text-rose-400 font-bold' : 'text-slate-400'
          }`}
        >
          {loss}%
        </span>
      )
    },
    {
      header: 'Health State',
      key: 'status',
      render: (status) => (
        <StatusBadge
          status={status === 'optimal' ? 'online' : 'warning'}
          label={status.toUpperCase()}
          size="xs"
        />
      )
    }
  ];

  const interfaceColumns = [
    {
      header: 'Port / Interface',
      key: 'name',
      render: (name, row) => (
        <div>
          <span className="font-bold text-white font-mono">{name}</span>
          <div className="text-[11px] text-slate-500 font-sans">{row.description}</div>
        </div>
      )
    },
    {
      header: 'Host Device',
      key: 'device',
      render: (device) => (
        <span className="text-cyan-300 font-mono">{device}</span>
      )
    },
    {
      header: 'Speed / Duplex',
      key: 'speed',
      render: (speed, row) => (
        <span className="text-slate-300 font-mono">
          {speed} ({row.duplex})
        </span>
      )
    },
    {
      header: 'Oper Status',
      key: 'operStatus',
      render: (status) => (
        <StatusBadge
          status={status === 'UP' ? 'online' : 'critical'}
          label={status}
          size="xs"
        />
      )
    },
    {
      header: 'MTU',
      key: 'mtu',
      render: (mtu) => <span className="text-slate-400 font-mono">{mtu}</span>
    },
    {
      header: 'Utilization In/Out',
      key: 'utilizationIn',
      render: (inVal, row) => (
        <div className="w-28 space-y-1">
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>In: {row.throughputIn}</span>
            <span>{row.utilizationIn}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1 overflow-hidden">
            <div
              className={`h-full ${row.utilizationIn > 85 ? 'bg-rose-500' : 'bg-emerald-400'}`}
              style={{ width: `${row.utilizationIn}%` }}
            />
          </div>
        </div>
      )
    },
    {
      header: 'CRC Errors',
      key: 'rxErrors',
      render: (rxErrors, row) => {
        const hasErrors = rxErrors > 0 || row.txErrors > 0;
        return (
          <span
            className={`font-mono ${
              hasErrors ? 'text-rose-400 font-bold bg-rose-950/50 px-2 py-0.5 rounded border border-rose-500/30' : 'text-slate-500'
            }`}
          >
            {rxErrors} RX / {row.txErrors} TX
          </span>
        );
      }
    },
    {
      header: 'Discards',
      key: 'discards',
      render: (discards) => (
        <span className={discards > 100 ? 'text-amber-400 font-bold' : 'text-slate-400'}>
          {discards}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-white font-mono tracking-wide">
          Network Telemetry & Interface Health
        </h2>
        <p className="text-xs text-slate-400">
          Core distribution uplinks, AWS Direct Connect Virtual Interfaces, and IPsec tunnels
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Direct Connect Transit"
          value="10 Gbps"
          subtitle="BGP State: ESTABLISHED (4/4)"
          icon={Radio}
          accentColor="emerald"
          badge="AWS VIF"
        />

        <StatCard
          title="Global Avg Latency"
          value={`${summary.globalAvgLatency} ms`}
          subtitle="Direct Connect: 8.4ms • Branch: 48ms"
          icon={Clock}
          accentColor="cyan"
          badge="Nominal"
        />

        <StatCard
          title="Packet Loss"
          value={`${summary.globalPacketLoss}%`}
          subtitle="Branch West link degradation detected"
          icon={AlertTriangle}
          trend={summary.globalPacketLoss > 0.05 ? "Loss elevated" : "Within SLA"}
          trendPositive={summary.globalPacketLoss <= 0.05}
          accentColor={summary.globalPacketLoss > 0.05 ? "rose" : "emerald"}
          badge="SLA: <0.1%"
        />

        <StatCard
          title="Active Interfaces"
          value={`${summary.activeInterfaces} / ${summary.totalInterfaces}`}
          subtitle={`${summary.degradedInterfaces} Degraded • ${summary.downInterfaces} Down`}
          icon={Activity}
          accentColor="indigo"
          badge="Ports"
        />
      </div>

      {/* Visual Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BandwidthTrafficChart data={metrics?.trafficHistory || []} />
        <LatencyDistributionChart data={metrics?.latencyHistory || []} />
      </div>

      {/* Latency Probes */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wide uppercase font-mono">
              Live WAN & Cloud Health Probes
            </h3>
            <p className="text-xs text-slate-400">Continuous ICMP SLA synthetic monitoring</p>
          </div>
        </div>
        <DataTable
          columns={probeColumns}
          data={probes}
          keyField="target"
        />
      </div>

      {/* Interfaces Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wide uppercase font-mono">
              Monitored Interface Status Table
            </h3>
            <p className="text-xs text-slate-400">Line protocol, link speed, utilization counters and CRC metrics</p>
          </div>
        </div>
        <DataTable
          columns={interfaceColumns}
          data={interfaces}
          keyField="id"
        />
      </div>
    </div>
  );
}
