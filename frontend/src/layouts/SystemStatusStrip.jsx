import React from 'react';
import { Activity, ShieldCheck, Database, HardDrive, Cpu } from 'lucide-react';

export default function SystemStatusStrip({
  nodeCount = 14,
  healthScore = 98.2,
  mockMode = true,
  latency = 14.2
}) {
  return (
    <footer className="h-8 bg-slate-950 border-t border-slate-800/80 px-4 text-[11px] font-mono text-slate-400 flex items-center justify-between z-20 select-none overflow-x-auto">
      {/* Left indicators */}
      <div className="flex items-center gap-4 sm:gap-6 whitespace-nowrap">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-300">SYSTEM HEALTH:</span>
          <span className="text-emerald-400 font-bold">{healthScore}% OPTIMAL</span>
        </div>

        <div className="hidden sm:flex items-center gap-1.5">
          <Activity className="w-3 h-3 text-cyan-400" />
          <span>DIRECT CONNECT LATENCY:</span>
          <span className="text-cyan-400 font-bold">8.4ms</span>
        </div>

        <div className="hidden md:flex items-center gap-1.5">
          <HardDrive className="w-3 h-3 text-slate-500" />
          <span>TOTAL NODES:</span>
          <span className="text-white font-bold">{nodeCount}</span>
        </div>
      </div>

      {/* Right indicators */}
      <div className="flex items-center gap-4 sm:gap-6 whitespace-nowrap">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          <span className="hidden sm:inline">ADAPTER:</span>
          <span className="text-slate-300 font-semibold">GNS3/VMware Bypass Active</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-slate-500">API LAYER:</span>
          <span className={mockMode ? 'text-cyan-400 font-bold' : 'text-emerald-400 font-bold'}>
            {mockMode ? 'MOCK SERVICE' : 'LIVE REST ENDPOINT'}
          </span>
        </div>
      </div>
    </footer>
  );
}
