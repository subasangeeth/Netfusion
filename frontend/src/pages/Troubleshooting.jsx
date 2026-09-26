import React, { useState, useEffect } from 'react';
import {
  Wrench,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Terminal,
  Copy,
  Check,
  ShieldAlert,
  Info,
  Server,
  ChevronRight,
  ExternalLink,
  Cpu,
  HardDrive
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import { api } from '../services/api';

export default function Troubleshooting({ initialDeviceId, onNavigate }) {
  const [devices, setDevices] = useState([]);
  const [selectedDeviceName, setSelectedDeviceName] = useState(initialDeviceId || 'br-remote-rtr01');
  const [diagnosticProfile, setDiagnosticProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiedStep, setCopiedStep] = useState(null);

  useEffect(() => {
    loadDeviceList();
  }, []);

  useEffect(() => {
    if (selectedDeviceName) {
      loadDiagnosticDetails(selectedDeviceName);
    }
  }, [selectedDeviceName]);

  async function loadDeviceList() {
    try {
      const res = await api.getDevices();
      const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
      setDevices(list);
      if (!selectedDeviceName && list.length > 0) {
        setSelectedDeviceName(list[0].name || list[0].hostname || 'hq-core-rtr01');
      }
    } catch (err) {
      console.error('Failed to load device list:', err);
    }
  }

  async function loadDiagnosticDetails(deviceName) {
    try {
      setLoading(true);
      const res = await api.getDiagnostics(deviceName);
      setDiagnosticProfile(res.data);
    } catch (err) {
      console.error('Failed to load diagnostics for device:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleCopyCommand = (command, stepNum) => {
    navigator.clipboard.writeText(command);
    setCopiedStep(stepNum);
    setTimeout(() => setCopiedStep(null), 2000);
  };

  const currentDevice = devices.find((d) => d.name === selectedDeviceName);

  return (
    <div className="space-y-6">
      {/* Header and Device Picker */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white font-mono tracking-wide">
            NOC Diagnostic Runbook & Triage Assistant
          </h2>
          <p className="text-xs text-slate-400">
            Rule-based root cause analysis and step-by-step diagnostic procedures
          </p>
        </div>

        {/* Device Dropdown Selector */}
        <div className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-900 border border-slate-800 self-start sm:self-auto">
          <Server className="w-4 h-4 text-cyan-400 ml-2" />
          <span className="text-xs text-slate-400 font-mono">Resource:</span>
          <select
            value={selectedDeviceName}
            onChange={(e) => setSelectedDeviceName(e.target.value)}
            className="bg-slate-950 text-white font-mono text-xs px-3 py-1 rounded-lg border border-slate-800 focus:outline-none focus:border-cyan-500"
          >
            {devices.map((dev) => (
              <option key={dev.id} value={dev.name}>
                {dev.name} ({dev.type} - {dev.status.toUpperCase()})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Safety Notice Banner */}
      <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-950/20 text-amber-200 text-xs backdrop-blur-md flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-bold font-mono tracking-wide text-amber-300 uppercase">
            Safe Operations Center Guideline
          </h4>
          <p className="text-slate-300 font-sans leading-relaxed">
            All diagnostic steps, anomaly detections, and sample command syntaxes are generated from the NetFusion rule-based diagnostic database. <strong>Live command execution is disabled</strong> in offline/demo mode to prevent unverified control-plane changes until a real SSH/agent bridge is connected.
          </p>
        </div>
      </div>

      {loading || !diagnosticProfile ? (
        <div className="p-20 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-cyan-500 border-t-transparent" />
          <p className="text-xs text-slate-400 font-mono mt-3">Analyzing telemetry signals...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Target Resource Status Strip */}
          {currentDevice && (
            <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-md flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-800 text-cyan-400">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">{currentDevice.name}</h3>
                    <StatusBadge status={currentDevice.status} size="xs" />
                  </div>
                  <p className="text-slate-400 text-[11px] font-sans">
                    {currentDevice.model} • {currentDevice.location}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-6 text-slate-300">
                <div>
                  <span className="text-slate-500 block text-[10px]">MANAGEMENT IP</span>
                  <span className="text-cyan-400">{currentDevice.ip}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">CPU UTILIZATION</span>
                  <span className={currentDevice.cpu > 80 ? 'text-rose-400 font-bold' : 'text-white'}>
                    {currentDevice.cpu}%
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">MEMORY LOAD</span>
                  <span className={currentDevice.memory > 80 ? 'text-rose-400 font-bold' : 'text-white'}>
                    {currentDevice.memory}%
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">ACTIVE UPTIME</span>
                  <span>{currentDevice.uptime}</span>
                </div>
              </div>
            </div>
          )}

          {/* Probable Root Cause Analysis Card */}
          <div className="p-5 rounded-xl bg-slate-900/80 border border-cyan-500/30 backdrop-blur-md space-y-4 shadow-glow-cyan/20">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wide">
                  Probable Root Cause Analysis
                </h3>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                RULE ENGINE CONFIDENCE: 94%
              </span>
            </div>

            <div className="space-y-2">
              <h4 className="text-base font-bold text-white font-mono">
                {diagnosticProfile.issueTitle}
              </h4>
              <p className="text-xs text-slate-300 font-sans leading-relaxed">
                {diagnosticProfile.probableRootCause}
              </p>
            </div>

            {/* Correlated Anomalies */}
            {diagnosticProfile.anomalies && diagnosticProfile.anomalies.length > 0 && (
              <div className="pt-2 border-t border-slate-800/80">
                <span className="text-[11px] font-bold text-slate-400 font-mono uppercase block mb-2">
                  Correlated Telemetry Anomalies Detected:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {diagnosticProfile.anomalies.map((anom, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-xs font-mono text-slate-300 flex items-center gap-2"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{anom}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Step-by-Step Diagnostic Runbook */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wide">
                  Step-by-Step Diagnostic Runbook
                </h3>
                <p className="text-xs text-slate-400">
                  Follow these verified operational triage procedures in sequence
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {diagnosticProfile.diagnosticSteps?.map((step) => (
                <div
                  key={step.step}
                  className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 backdrop-blur-md space-y-3"
                >
                  {/* Step Title */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-bold font-mono">
                        {step.step}
                      </span>
                      <h4 className="text-sm font-bold text-white font-mono">
                        {step.title}
                      </h4>
                    </div>
                  </div>

                  {/* Action Description */}
                  <p className="text-xs text-slate-300 font-sans leading-relaxed">
                    {step.action}
                  </p>

                  {/* Sample Command & Expected Output */}
                  {step.sampleCommand && (
                    <div className="space-y-2">
                      <div className="relative group">
                        <div className="flex items-center justify-between px-3 py-1.5 rounded-t-lg bg-slate-950 border border-slate-800 border-b-0 text-[11px] font-mono text-slate-400">
                          <span className="flex items-center gap-1.5">
                            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                            Diagnostic Command Syntax:
                          </span>
                          <button
                            onClick={() => handleCopyCommand(step.sampleCommand, step.step)}
                            className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
                          >
                            {copiedStep === step.step ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span className="text-emerald-400 text-[10px]">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span className="text-[10px]">Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                        <pre className="p-3 rounded-b-lg bg-[#070b12] border border-slate-800 text-cyan-300 font-mono text-xs overflow-x-auto selection:bg-cyan-500/20">
                          <code>{step.sampleCommand}</code>
                        </pre>
                      </div>

                      {step.expectedResult && (
                        <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 text-[11px] font-mono text-slate-400 flex items-start gap-2">
                          <span className="text-emerald-400 font-bold shrink-0">EXPECTED CRITERIA:</span>
                          <span className="text-slate-300">{step.expectedResult}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
