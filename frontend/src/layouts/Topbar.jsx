import React, { useState, useEffect } from 'react';
import {
  RefreshCw,
  Clock,
  Radio,
  Sliders,
  ChevronRight,
  Menu,
  AlertCircle,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { api } from '../services/api';

export default function Topbar({
  activePage = 'overview',
  onRefresh,
  refreshing = false,
  autoRefreshInterval = 30000,
  onChangeInterval,
  onToggleSidebar,
  mockMode = true,
  onToggleMockMode
}) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const pageTitles = {
    overview: 'NOC Executive Overview',
    infrastructure: 'Hybrid Infrastructure Inventory',
    network: 'Network Telemetry & Interface Monitor',
    cloud: 'AWS Cloud Services & Telemetry',
    alerts: 'SOC / NOC Incident Triage Console',
    logs: 'Centralized System & CloudWatch Logs',
    troubleshooting: 'Diagnostic Runbook Assistant',
    topology: 'Hybrid Cloud Network Topology Map'
  };

  return (
    <header className="h-16 bg-slate-950/90 border-b border-slate-800/80 px-4 sm:px-6 flex items-center justify-between backdrop-blur-md z-20">
      {/* Left: Hamburger & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 md:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-400 hidden sm:inline">NetFusion</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600 hidden sm:inline" />
          <h1 className="text-sm font-bold text-white tracking-wide">
            {pageTitles[activePage] || 'Console'}
          </h1>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Mock / Live Mode Switcher */}
        <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-800 text-xs font-mono">
          <span className="text-slate-400 text-[11px]">API Layer:</span>
          <button
            onClick={() => onToggleMockMode(!mockMode)}
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
              mockMode
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                mockMode ? 'bg-cyan-400' : 'bg-emerald-400'
              } animate-pulse`}
            />
            {mockMode ? 'Mock Data' : 'Live AWS API'}
          </button>
        </div>

        {/* Polling Interval Selector */}
        <div className="flex items-center gap-1.5 text-xs font-mono">
          <span className="text-slate-400 hidden xl:inline text-[11px]">Poll:</span>
          <select
            value={autoRefreshInterval}
            onChange={(e) => onChangeInterval(Number(e.target.value))}
            className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-300 text-xs focus:outline-none focus:border-cyan-500"
          >
            <option value={10000}>10s</option>
            <option value={30000}>30s</option>
            <option value={60000}>60s</option>
            <option value={0}>Manual</option>
          </select>
        </div>

        {/* Manual Refresh Button */}
        <button
          onClick={onRefresh}
          disabled={refreshing}
          title="Manual Telemetry Sync"
          className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/40 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-cyan-400' : ''}`} />
        </button>

        {/* Live Clock (UTC & Local) */}
        <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-800 font-mono text-xs">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <div className="flex flex-col text-right leading-none">
            <span className="text-white font-bold text-[11px]">
              {time.toLocaleTimeString([], { hour12: false })}
            </span>
            <span className="text-[10px] text-slate-400">
              {time.toISOString().slice(11, 19)} UTC
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
