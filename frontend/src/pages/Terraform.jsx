import React, { useState, useEffect } from 'react';
import {
  Layers,
  Play,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Terminal,
  ShieldAlert,
  FileCode,
  FolderGit2
} from 'lucide-react';
import api from '../services/api';

export default function TerraformPage() {
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [env, setEnv] = useState('dev');
  const [action, setAction] = useState('plan');
  const [confirmDestructive, setConfirmDestructive] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [activeOutput, setActiveOutput] = useState(null);

  const fetchRuns = async () => {
    try {
      const data = await api.getTerraformRuns();
      setRuns(data);
      if (data.length > 0 && !activeOutput) {
        setActiveOutput(data[0]);
      }
    } catch (err) {
      console.error('Failed to load Terraform runs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRuns();
  }, []);

  const handleExecute = async () => {
    if ((action === 'apply' || action === 'destroy') && !confirmDestructive) {
      alert(`SAFETY GATE: Explicit confirmation is required before running 'terraform ${action}'. Check the confirmation box below.`);
      return;
    }

    setExecuting(true);
    try {
      const res = await api.runTerraform(action, env, confirmDestructive);
      setActiveOutput(res);
      await fetchRuns();
    } catch (err) {
      console.error('Terraform execution failed:', err);
    } finally {
      setExecuting(false);
      setConfirmDestructive(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white font-mono">TERRAFORM INFRASTRUCTURE AS CODE</h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40">
                AWS MODULES
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Automate AWS VPC, Subnets, Security Groups, Bastion/App EC2, and WireGuard VPN tunnel endpoints with safety verification.
            </p>
          </div>
        </div>

        <button
          onClick={fetchRuns}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {/* Control Console */}
      <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-200 font-mono flex items-center gap-2">
          <Terminal className="w-4 h-4 text-purple-400" />
          Terraform Runner & Safety Gate
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">Environment</label>
            <select
              value={env}
              onChange={(e) => setEnv(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-2 font-mono focus:outline-none focus:border-purple-500"
            >
              <option value="dev">environments/dev (VPC 10.20.0.0/16)</option>
              <option value="prod">environments/prod (Multi-AZ HA)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">Action</label>
            <select
              value={action}
              onChange={(e) => setAction(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-2 font-mono focus:outline-none focus:border-purple-500"
            >
              <option value="plan">terraform plan (Dry Run)</option>
              <option value="validate">terraform validate (Syntax Check)</option>
              <option value="apply">terraform apply (Provision)</option>
              <option value="destroy">terraform destroy (Teardown)</option>
            </select>
          </div>

          <div className="md:col-span-2 flex flex-col justify-end">
            {(action === 'apply' || action === 'destroy') && (
              <label className="flex items-center gap-2 text-xs text-rose-300 font-mono mb-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={confirmDestructive}
                  onChange={(e) => setConfirmDestructive(e.target.checked)}
                  className="rounded bg-slate-950 border-rose-500 text-rose-500 focus:ring-0"
                />
                <span>Confirm destructive modification on {env.toUpperCase()}</span>
              </label>
            )}

            <button
              onClick={handleExecute}
              disabled={executing}
              className={`flex items-center justify-center gap-2 px-5 py-2 rounded-lg font-mono text-xs font-bold transition-all shadow-md ${
                action === 'destroy'
                  ? 'bg-rose-600 hover:bg-rose-500 text-white'
                  : 'bg-purple-600 hover:bg-purple-500 text-white'
              } disabled:opacity-50`}
            >
              <Play className={`w-3.5 h-3.5 ${executing ? 'animate-spin' : ''}`} />
              {executing ? 'Executing Terraform...' : `Execute terraform ${action}`}
            </button>
          </div>
        </div>
      </div>

      {/* Execution Output Console */}
      <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2 text-xs font-mono text-purple-300">
            <FileCode className="w-4 h-4" />
            <span>Console Output: {activeOutput?.action?.toUpperCase() || 'PLAN'} ({activeOutput?.environment || 'dev'})</span>
          </div>
          {activeOutput && (
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
              activeOutput.status === 'succeeded'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : activeOutput.status === 'requires_confirmation'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
            }`}>
              {activeOutput.status.toUpperCase()}
            </span>
          )}
        </div>

        <pre className="p-4 rounded-lg bg-black text-slate-300 font-mono text-xs overflow-x-auto max-h-96 leading-relaxed">
          {activeOutput?.stdout || activeOutput?.plan_summary || 'No execution output yet. Click "Execute" to run Terraform.'}
        </pre>
      </div>
    </div>
  );
}
