import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Play,
  CheckCircle,
  RefreshCw,
  Terminal,
  Activity,
  Filter,
  Lock
} from 'lucide-react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';

export default function SecurityPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [simResult, setSimResult] = useState(null);
  const [selectedSeverity, setSelectedSeverity] = useState('all');

  const fetchEvents = async () => {
    try {
      const data = await api.getSecurityEvents(selectedSeverity !== 'all' ? { severity: selectedSeverity } : null);
      setEvents(data);
    } catch (err) {
      console.error('Failed to load security events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    const interval = setInterval(fetchEvents, 8000);
    return () => clearInterval(interval);
  }, [selectedSeverity]);

  const handleSimulate = async (type) => {
    setSimulating(true);
    setSimResult(null);
    try {
      const res = await api.simulateAttack(type, '10.10.30.10');
      setSimResult(res);
      await fetchEvents();
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setSimulating(false);
    }
  };

  const getSeverityBadge = (severity) => {
    switch ((severity || 'low').toLowerCase()) {
      case 'critical':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">CRITICAL</span>;
      case 'high':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">HIGH</span>;
      case 'medium':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">MEDIUM</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-slate-500/20 text-slate-300 border border-slate-500/40">LOW</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white font-mono">SURICATA INTRUSION DETECTION & SECURITY</h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                ACTIVE SENSOR
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Deep packet inspection engine monitoring on-premises segments via EVE JSON collector and stateful firewall logs.
            </p>
          </div>
        </div>

        <button
          onClick={fetchEvents}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {/* Controlled In-Lab Attack Simulation Suite */}
      <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-200 font-mono flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              Controlled In-Lab Attack Simulator
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Safely trigger controlled synthetic security events inside the isolated Docker network to verify Suricata rule triggering.
            </p>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
            Isolated Sandbox
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => handleSimulate('port_scan')}
            disabled={simulating}
            className="flex items-center justify-between p-3 rounded-lg bg-slate-950/80 hover:bg-slate-800/80 border border-slate-700/60 text-left transition-all group disabled:opacity-50"
          >
            <div>
              <div className="text-xs font-bold text-slate-200 group-hover:text-cyan-300 font-mono">TCP Port Scan Probe</div>
              <div className="text-[11px] text-slate-400">client-01 scans ports 80, 8080, 5432</div>
            </div>
            <Play className="w-4 h-4 text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
          </button>

          <button
            onClick={() => handleSimulate('failed_login')}
            disabled={simulating}
            className="flex items-center justify-between p-3 rounded-lg bg-slate-950/80 hover:bg-slate-800/80 border border-slate-700/60 text-left transition-all group disabled:opacity-50"
          >
            <div>
              <div className="text-xs font-bold text-slate-200 group-hover:text-amber-300 font-mono">HTTP Brute Force</div>
              <div className="text-[11px] text-slate-400">Simulate rapid failed authentication</div>
            </div>
            <Play className="w-4 h-4 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
          </button>

          <button
            onClick={() => handleSimulate('icmp_flood')}
            disabled={simulating}
            className="flex items-center justify-between p-3 rounded-lg bg-slate-950/80 hover:bg-slate-800/80 border border-slate-700/60 text-left transition-all group disabled:opacity-50"
          >
            <div>
              <div className="text-xs font-bold text-slate-200 group-hover:text-rose-300 font-mono">ICMP Echo Rate Burst</div>
              <div className="text-[11px] text-slate-400">Trigger ping rate limiter threshold</div>
            </div>
            <Play className="w-4 h-4 text-rose-400 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {simResult && (
          <div className="p-3.5 rounded-lg bg-cyan-950/30 border border-cyan-500/40 text-xs font-mono space-y-1 text-cyan-200">
            <div className="font-bold flex items-center gap-1.5 text-cyan-300">
              <CheckCircle className="w-4 h-4" />
              <span>Simulation Triggered: {simResult.simulation_type.toUpperCase()}</span>
            </div>
            <div>Target: {simResult.target} • Status: {simResult.status}</div>
            <div className="text-slate-300">{simResult.details}</div>
            <div className="text-emerald-400">Sensor Verification: {simResult.detected_by}</div>
          </div>
        )}
      </div>

      {/* Suricata Events Feed */}
      <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-200 font-mono flex items-center gap-2">
            <Activity className="w-4 h-4 text-rose-400" />
            Live Intrusion Detection Event Log
          </h2>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-slate-300 text-xs rounded-lg px-2.5 py-1 font-mono focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-800">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Severity</th>
                <th className="py-2.5 px-3">Rule / Signature</th>
                <th className="py-2.5 px-3">Source IP</th>
                <th className="py-2.5 px-3">Dest IP</th>
                <th className="py-2.5 px-3">Proto</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 bg-slate-900/30">
              {events.map((ev) => (
                <tr key={ev.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-2 px-3 text-slate-400 whitespace-nowrap">
                    {new Date(ev.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="py-2 px-3">{getSeverityBadge(ev.severity)}</td>
                  <td className="py-2 px-3 text-white font-medium max-w-xs truncate" title={ev.rule_name}>
                    {ev.rule_name}
                  </td>
                  <td className="py-2 px-3 text-cyan-300">{ev.source_ip}{ev.src_port ? `:${ev.src_port}` : ''}</td>
                  <td className="py-2 px-3 text-indigo-300">{ev.dest_ip}{ev.dest_port ? `:${ev.dest_port}` : ''}</td>
                  <td className="py-2 px-3 text-slate-300">{ev.protocol}</td>
                  <td className="py-2 px-3">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      {ev.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
              {events.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-500">
                    No intrusion detection alerts found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
