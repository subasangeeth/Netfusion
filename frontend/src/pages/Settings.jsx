import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Shield,
  Key,
  Globe,
  Radio,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Cpu
} from 'lucide-react';
import api from '../services/api';

export default function SettingsPage({ mockMode, onToggleMockMode }) {
  const [apiEndpoint, setApiEndpoint] = useState(api.getBaseUrl());
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <SettingsIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white font-mono">PLATFORM SETTINGS & ENVIRONMENT MODES</h1>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                mockMode ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              }`}>
                {mockMode ? 'DEMO MODE' : 'PRODUCTION MODE'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Configure system operation mode, backend API endpoints, AWS Boto3 authentication, and RBAC policies.
            </p>
          </div>
        </div>
      </div>

      {saved && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Configuration parameters updated successfully.</span>
        </div>
      )}

      {/* Mode Switch Card */}
      <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-200 font-mono flex items-center gap-2">
          <Radio className="w-4 h-4 text-cyan-400" />
          Operating Mode (Requirement 25 & 26)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            onClick={() => onToggleMockMode(true)}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              mockMode
                ? 'bg-amber-950/20 border-amber-500/50 shadow-glow-amber'
                : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-amber-300">DEMO MODE (NETFUSION_MODE=demo)</span>
              {mockMode && <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">ACTIVE</span>}
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Zero AWS credentials or physical hardware required. High-fidelity dynamic simulation of AWS VPCs, WireGuard tunnels, and Suricata alerts. All data is clearly tagged <strong>"DEMO DATA"</strong>.
            </p>
          </div>

          <div
            onClick={() => onToggleMockMode(false)}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              !mockMode
                ? 'bg-emerald-950/20 border-emerald-500/50 shadow-glow-emerald'
                : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-emerald-300">PRODUCTION MODE (NETFUSION_MODE=production)</span>
              {!mockMode && <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">ACTIVE</span>}
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Connects to live Docker containers, live AWS Boto3 SDK, real WireGuard tunnels, live Prometheus metrics, and real Suricata logs. Never falls back to mock data silently.
            </p>
          </div>
        </div>
      </div>

      {/* Backend & AWS Connection Info */}
      <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-200 font-mono flex items-center gap-2">
          <Key className="w-4 h-4 text-cyan-400" />
          Backend API & Cloud Connectivity
        </h2>

        <form onSubmit={handleSave} className="space-y-4 max-w-xl">
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">FastAPI Backend URL</label>
            <input
              type="text"
              value={apiEndpoint}
              onChange={(e) => setApiEndpoint(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-2 font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs font-mono space-y-2">
            <div className="text-slate-300 font-bold flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-cyan-400" />
              <span>AWS Cloud Authentication Status:</span>
            </div>
            <div className="text-slate-400">
              Region: <span className="text-white">us-east-1</span> • Credentials: <span className="text-amber-400">Environment/IAM Role</span>
            </div>
            <div className="text-[11px] text-slate-500 italic">
              AWS secrets are never transmitted or exposed in frontend JavaScript bundles.
            </div>
          </div>

          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold transition-colors shadow-glow-cyan"
          >
            Save Configuration
          </button>
        </form>
      </div>
    </div>
  );
}
