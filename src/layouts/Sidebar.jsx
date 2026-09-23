import React from 'react';
import {
  LayoutDashboard,
  Server,
  Activity,
  Cloud,
  AlertTriangle,
  FileText,
  Wrench,
  Network,
  Shield,
  Radio,
  ExternalLink
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, badge: null },
  { id: 'infrastructure', label: 'Infrastructure', icon: Server, badge: '14' },
  { id: 'network', label: 'Network', icon: Activity, badge: null },
  { id: 'cloud', label: 'Cloud (AWS)', icon: Cloud, badge: 'AWS' },
  { id: 'alerts', label: 'Alerts', icon: AlertTriangle, badge: '2', badgeAlert: true },
  { id: 'logs', label: 'Event Logs', icon: FileText, badge: null },
  { id: 'troubleshooting', label: 'Troubleshooting', icon: Wrench, badge: 'Diag' },
  { id: 'topology', label: 'Topology Map', icon: Network, badge: 'Map' }
];

export default function Sidebar({
  activePage = 'overview',
  onSelectPage,
  isCollapsed = false,
  onToggleCollapse,
  activeAlertCount = 2
}) {
  return (
    <aside
      className={`relative flex flex-col bg-slate-950 border-r border-slate-800/80 transition-all duration-300 z-30 select-none ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-800/80 h-16">
        <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-tr from-cyan-600 to-indigo-600 shadow-glow-cyan text-white font-bold">
          <Radio className="w-5 h-5 text-white animate-pulse" />
        </div>
        {!isCollapsed && (
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-wider text-white font-mono">
                NET<span className="text-cyan-400">FUSION</span>
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono">
                NOC
              </span>
            </div>
            <span className="text-[11px] text-slate-400 tracking-tight font-sans">
              Hybrid Cloud Monitoring
            </span>
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-1 text-[11px] font-semibold text-slate-400 tracking-wider uppercase font-mono">
          {!isCollapsed ? 'Operations Console' : '•••'}
        </div>

        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          const isAlert = item.id === 'alerts' && activeAlertCount > 0;

          return (
            <button
              key={item.id}
              onClick={() => onSelectPage(item.id)}
              title={isCollapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all group ${
                isActive
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
              }`}
            >
              <Icon
                className={`w-4 h-4 flex-shrink-0 transition-colors ${
                  isActive
                    ? 'text-cyan-400'
                    : isAlert
                    ? 'text-rose-400 animate-bounce'
                    : 'text-slate-500 group-hover:text-slate-300'
                }`}
              />

              {!isCollapsed && (
                <div className="flex-1 flex items-center justify-between">
                  <span className="tracking-wide font-sans">{item.label}</span>
                  {item.id === 'alerts' && activeAlertCount > 0 ? (
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
                      {activeAlertCount}
                    </span>
                  ) : item.badge ? (
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                        isActive
                          ? 'bg-cyan-500/30 text-cyan-200'
                          : 'bg-slate-900 text-slate-500'
                      }`}
                    >
                      {item.badge}
                    </span>
                  ) : null}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Teammate & Project Status Footer */}
      {!isCollapsed && (
        <div className="p-3 mx-3 mb-3 rounded-lg bg-slate-900/90 border border-slate-800 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-400 uppercase font-semibold">
              Teammate Sync
            </span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-tight">
            AWS Cloud API: <span className="text-cyan-400 font-mono">Mock Mode (Active)</span>
          </p>
          <div className="pt-1 border-t border-slate-800 text-[10px] text-slate-400 font-mono flex items-center justify-between">
            <span>MCA Capstone</span>
            <span>v1.0-NOC</span>
          </div>
        </div>
      )}
    </aside>
  );
}
