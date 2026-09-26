import React, { useState, useEffect } from 'react';
import {
  Activity,
  HardDrive,
  Cpu,
  RefreshCw,
  ExternalLink,
  Shield,
  Layers,
  Radio,
  CheckCircle2
} from 'lucide-react';
import api from '../services/api';
import StatCard from '../components/StatCard';
import BandwidthTrafficChart from '../charts/BandwidthTrafficChart';
import CpuMemoryTrendChart from '../charts/CpuMemoryTrendChart';

export default function MonitoringPage() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    try {
      const data = await api.getMetrics();
      setMetrics(data);
    } catch (err) {
      console.error('Failed to load metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white font-mono">PROMETHEUS & GRAFANA MONITORING</h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                PROMETHEUS: 9090
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              End-to-end telemetry across Docker containers, WireGuard overlay, FastAPI backend, and AWS EC2 workloads.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="http://localhost:9090"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors border border-slate-700"
          >
            <span>Prometheus</span>
            <ExternalLink className="w-3 h-3 text-cyan-400" />
          </a>
          <a
            href="http://localhost:3001"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-600/20 hover:bg-orange-600/30 text-orange-300 text-xs font-mono transition-colors border border-orange-500/30"
          >
            <span>Grafana (3001)</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Hybrid Health Score"
          value="98.4%"
          change="All zones nominal"
          trend="up"
          icon={Activity}
        />
        <StatCard
          label="Active Scrape Targets"
          value="7 / 7"
          change="Docker + AWS + WG"
          trend="up"
          icon={Layers}
        />
        <StatCard
          label="Backend /metrics Rate"
          value="15s Scrape"
          change="Prometheus HTTP Exporter"
          trend="up"
          icon={Radio}
        />
        <StatCard
          label="Total Network Throughput"
          value="343.8 Mbps"
          change="Hybrid WireGuard Pipe"
          trend="up"
          icon={HardDrive}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-200 font-mono">
            Hybrid WAN Throughput (Mbps)
          </h2>
          <BandwidthTrafficChart />
        </div>

        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-200 font-mono">
            Router & Firewall CPU Trends
          </h2>
          <CpuMemoryTrendChart />
        </div>
      </div>
    </div>
  );
}
