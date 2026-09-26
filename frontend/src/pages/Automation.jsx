import React, { useState, useEffect } from 'react';
import {
  Wrench,
  Play,
  Download,
  Plus,
  Trash2,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Terminal,
  Activity,
  Layers,
  ArrowRight
} from 'lucide-react';
import api from '../services/api';

export default function AutomationPage() {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [testSource, setTestSource] = useState('netfusion-client-01');
  const [testTarget, setTestTarget] = useState('10.10.30.10');
  const [testType, setTestType] = useState('ping');
  const [testPort, setTestPort] = useState(8080);
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);
  const [backupMsg, setBackupMsg] = useState(null);

  // New route form state
  const [newCidr, setNewCidr] = useState('');
  const [newGateway, setNewGateway] = useState('');
  const [newInterface, setNewInterface] = useState('eth4');

  const fetchRoutes = async () => {
    try {
      const data = await api.getRoutes();
      setRoutes(data);
    } catch (err) {
      console.error('Failed to load routes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  const handleRunTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await api.testConnectivity(testSource, testTarget, testType, parseInt(testPort, 10));
      setTestResult(res);
    } catch (err) {
      console.error('Test run failed:', err);
    } finally {
      setTesting(false);
    }
  };

  const handleAddRoute = async (e) => {
    e.preventDefault();
    if (!newCidr || !newGateway) return;
    try {
      await api.addRoute({
        destination_cidr: newCidr,
        next_hop: newGateway,
        interface_name: newInterface,
        metric: 100
      });
      setNewCidr('');
      setNewGateway('');
      await fetchRoutes();
    } catch (err) {
      alert(`Failed to add route: ${err.message}`);
    }
  };

  const handleDeleteRoute = async (id) => {
    if (!confirm(`Are you sure you want to remove route ID ${id}?`)) return;
    try {
      await api.deleteRoute(id);
      await fetchRoutes();
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const handleBackup = async () => {
    try {
      const res = await api.backupNetwork();
      setBackupMsg(res.message || 'Network configuration snapshot saved.');
      setTimeout(() => setBackupMsg(null), 5000);
    } catch (err) {
      alert('Backup failed.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white font-mono">NETWORK AUTOMATION & DIAGNOSTICS</h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                LINUX NETWORKING
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Programmatic route table manipulation, connectivity probing (ping, TCP, HTTP), and state backups.
            </p>
          </div>
        </div>

        <button
          onClick={handleBackup}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs transition-colors border border-slate-700 shadow-sm"
        >
          <Download className="w-3.5 h-3.5 text-cyan-400" />
          Backup Configuration
        </button>
      </div>

      {backupMsg && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          <span>{backupMsg}</span>
        </div>
      )}

      {/* Connectivity Test Runner */}
      <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-200 font-mono flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          Automated Connectivity Probe Runner
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">Source Container</label>
            <select
              value={testSource}
              onChange={(e) => setTestSource(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 font-mono focus:outline-none focus:border-cyan-500"
            >
              <option value="netfusion-client-01">client-01 (10.10.20.10)</option>
              <option value="netfusion-client-02">client-02 (10.10.20.11)</option>
              <option value="netfusion-router">router (10.10.10.1)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">Probe Type</label>
            <select
              value={testType}
              onChange={(e) => setTestType(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 font-mono focus:outline-none focus:border-cyan-500"
            >
              <option value="ping">ICMP Ping</option>
              <option value="http_get">HTTP GET (/health)</option>
              <option value="tcp_probe">TCP Port Probe (nc)</option>
              <option value="traceroute">Traceroute</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">Target IP / Host</label>
            <input
              type="text"
              value={testTarget}
              onChange={(e) => setTestTarget(e.target.value)}
              placeholder="e.g. 10.10.30.10"
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">Target Port</label>
            <input
              type="number"
              value={testPort}
              onChange={(e) => setTestPort(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handleRunTest}
              disabled={testing}
              className="w-full flex items-center justify-center gap-2 px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold transition-all shadow-glow-cyan disabled:opacity-50"
            >
              <Play className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
              {testing ? 'Probing...' : 'Run Probe'}
            </button>
          </div>
        </div>

        {testResult && (
          <div className={`p-4 rounded-lg border text-xs font-mono space-y-1.5 ${
            testResult.success
              ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-950/20 border-rose-500/40 text-rose-300'
          }`}>
            <div className="flex items-center justify-between font-bold">
              <span>Result: {testResult.success ? 'PROBE SUCCEEDED' : 'PROBE REJECTED / FILTERED'}</span>
              {testResult.latency_ms && <span>Latency: {testResult.latency_ms} ms</span>}
            </div>
            <pre className="p-2 rounded bg-black/50 text-slate-200 text-[11px] whitespace-pre-wrap">
              {testResult.output}
            </pre>
          </div>
        )}
      </div>

      {/* Programmatic Routing Table Management */}
      <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-200 font-mono flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          Active Static Routing Tables
        </h2>

        {/* Add Route Form */}
        <form onSubmit={handleAddRoute} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end p-3 rounded-lg bg-slate-950/60 border border-slate-800">
          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1">Destination CIDR</label>
            <input
              type="text"
              value={newCidr}
              onChange={(e) => setNewCidr(e.target.value)}
              placeholder="e.g. 10.20.0.0/16"
              className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded px-2.5 py-1.5 font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1">Next Hop Gateway</label>
            <input
              type="text"
              value={newGateway}
              onChange={(e) => setNewGateway(e.target.value)}
              placeholder="e.g. 10.10.100.10"
              className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded px-2.5 py-1.5 font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1">Interface</label>
            <select
              value={newInterface}
              onChange={(e) => setNewInterface(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded px-2.5 py-1.5 font-mono focus:outline-none focus:border-cyan-500"
            >
              <option value="eth0">eth0 (onprem-management)</option>
              <option value="eth1">eth1 (onprem-users)</option>
              <option value="eth2">eth2 (onprem-servers)</option>
              <option value="eth4">eth4 (onprem-transit)</option>
              <option value="wg0">wg0 (WireGuard Tunnel)</option>
            </select>
          </div>

          <button
            type="submit"
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Route
          </button>
        </form>

        <div className="overflow-x-auto rounded-lg border border-slate-800">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Destination CIDR</th>
                <th className="py-2.5 px-3">Next Hop Gateway</th>
                <th className="py-2.5 px-3">Interface</th>
                <th className="py-2.5 px-3">Metric</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 bg-slate-900/30">
              {routes.map((r) => (
                <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-2 px-3 text-cyan-300 font-bold">{r.destination_cidr}</td>
                  <td className="py-2 px-3 text-slate-200">{r.next_hop}</td>
                  <td className="py-2 px-3 text-purple-300">{r.interface_name}</td>
                  <td className="py-2 px-3 text-slate-400">{r.metric || 10}</td>
                  <td className="py-2 px-3">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      ACTIVE
                    </span>
                  </td>
                  <td className="py-2 px-3 text-right">
                    <button
                      onClick={() => handleDeleteRoute(r.id)}
                      className="text-slate-400 hover:text-rose-400 transition-colors"
                      title="Delete Route"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
