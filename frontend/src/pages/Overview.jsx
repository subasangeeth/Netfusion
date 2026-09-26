import React, { useState, useEffect } from 'react';
import {
  Server,
  Activity,
  AlertTriangle,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownRight,
  Cpu,
  Wifi,
  Radio,
  ExternalLink
} from 'lucide-react';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import CpuMemoryTrendChart from '../charts/CpuMemoryTrendChart';
import BandwidthTrafficChart from '../charts/BandwidthTrafficChart';
import ResourceGauge from '../charts/ResourceGauge';
import { api } from '../services/api';
import { timeAgo } from '../utils/formatters';

export default function Overview({ onNavigate }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOverview();
  }, []);

  async function loadOverview() {
    try {
      setLoading(true);
      const res = await api.getOverview();
      setData(res?.data || res || {});
    } catch (err) {
      console.error('Failed to load overview data:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-cyan-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner Notice for MCA Project Panel */}
      <div className="rounded-xl border border-cyan-500/20 bg-gradient-to-r from-cyan-950/40 via-slate-900 to-indigo-950/40 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 backdrop-blur-md">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              HYBRID NOC DASHBOARD
            </span>
            <span className="text-xs text-slate-400 font-mono">
              On-Prem DataCenter ↔ AWS Cloud Interconnect
            </span>
          </div>
          <h2 className="text-lg font-bold text-white tracking-wide">
            NetFusion Operational Status Center
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl">
            Real-time telemetry stream for hybrid enterprise network nodes, Direct Connect transit circuits, and AWS cloud microservices. Physical network dependencies are decoupled via the clean API service layer.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('troubleshooting')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/40 text-xs font-mono font-semibold transition-all shadow-sm"
          >
            <span>Runbook Diagnostics</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* KPI Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Monitored Devices"
          value={data.totalDevices}
          subtitle={`${data.online} Online • ${data.warning} Degraded • ${data.critical} Critical`}
          icon={Server}
          accentColor="cyan"
          badge="Hybrid"
          onClick={() => onNavigate('infrastructure')}
        />

        <StatCard
          title="Network Health Score"
          value={`${data.networkHealthScore}%`}
          subtitle={`Latency: ${data.globalLatency}ms • Packet Loss: ${data.packetLoss}%`}
          icon={Activity}
          trend="+0.4% 24h"
          trendPositive={true}
          accentColor="emerald"
          badge="Optimal"
          onClick={() => onNavigate('network')}
        />

        <StatCard
          title="Active Alarms"
          value={data.activeAlerts}
          subtitle={`${data.criticalAlerts} Critical P1 • Triage Required`}
          icon={AlertTriangle}
          trend={data.criticalAlerts > 0 ? "Requires Attention" : "All Clear"}
          trendPositive={data.criticalAlerts === 0}
          accentColor={data.criticalAlerts > 0 ? "rose" : "amber"}
          badge={data.criticalAlerts > 0 ? "P1 Active" : "Normal"}
          onClick={() => onNavigate('alerts')}
        />

        <StatCard
          title="AWS Cloud Fleet"
          value={`${data.cloudInstancesRunning} / ${data.cloudInstancesTotal}`}
          subtitle="Direct Connect: 10G Established"
          icon={Wifi}
          trend="100% Target Healthy"
          trendPositive={true}
          accentColor="indigo"
          badge="us-east-1"
          onClick={() => onNavigate('cloud')}
        />
      </div>

      {/* Charts Section: 24h Trends & Bandwidth */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CpuMemoryTrendChart data={data.metrics.cpuMemoryHistory} />
        <BandwidthTrafficChart data={data.metrics.trafficHistory} />
      </div>

      {/* Lower Row: Health Gauges & Recent Alerts Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Network Quality Gauge Card */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 backdrop-blur-md flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wide uppercase font-mono mb-1">
              Backbone Link Quality
            </h3>
            <p className="text-xs text-slate-400">AWS Direct Connect & WAN SLA</p>
          </div>

          <div className="grid grid-cols-2 gap-2 my-4">
            <ResourceGauge
              value={99.9}
              label="Availability SLA"
              unit="%"
              color="emerald"
              size={110}
            />
            <ResourceGauge
              value={94}
              label="Bandwidth Headroom"
              unit="%"
              color="cyan"
              size={110}
            />
          </div>

          <div className="border-t border-slate-800/80 pt-3 space-y-1.5 text-xs font-mono">
            <div className="flex justify-between text-slate-400">
              <span>BGP Peering State:</span>
              <span className="text-emerald-400 font-bold">ESTABLISHED</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Mean Jitter:</span>
              <span className="text-cyan-400">1.8 ms</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Aggregate Pipe:</span>
              <span className="text-slate-200">10.0 Gbps Committed</span>
            </div>
          </div>
        </div>

        {/* Live Recent Events Stream */}
        <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-slate-900/70 p-5 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white tracking-wide uppercase font-mono">
                Recent Incident Stream
              </h3>
              <p className="text-xs text-slate-400">High-priority events awaiting operator triage</p>
            </div>
            <button
              onClick={() => onNavigate('alerts')}
              className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              <span>View All Alerts</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {data.recentEvents.map((evt) => (
              <div
                key={evt.id}
                onClick={() => onNavigate('alerts')}
                className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/70 hover:border-slate-700 transition-colors flex items-center justify-between gap-3 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <StatusBadge
                    status={evt.severity === 'critical' ? 'critical' : evt.severity === 'warning' ? 'warning' : 'info'}
                    label={evt.severity.toUpperCase()}
                    size="xs"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white font-mono">{evt.resourceName}</span>
                      <span className="text-[10px] text-slate-500 font-mono">({evt.resourceIp})</span>
                    </div>
                    <p className="text-xs text-slate-300 line-clamp-1">{evt.title}</p>
                  </div>
                </div>

                <div className="text-right whitespace-nowrap text-[11px] font-mono text-slate-500">
                  <span>{timeAgo(evt.timestamp)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
