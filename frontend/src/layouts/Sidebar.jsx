import React from 'react';
import {
  LayoutDashboard,
  Server,
  Activity,
  Cloud,
  Network,
  Lock,
  ShieldAlert,
  BarChart3,
  Layers,
  Wrench,
  Bot,
  FileText,
  Settings as SettingsIcon,
  Radio
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'cloud', label: 'AWS Cloud', icon: Cloud, badge: 'AWS' },
  { id: 'infrastructure', label: 'On-Premises', icon: Server, badge: '7 Nodes' },
  { id: 'network', label: 'Network', icon: Activity },
  { id: 'topology', label: 'Topology', icon: Network, badge: 'Map' },
  { id: 'vpn', label: 'Hybrid VPN', icon: Lock, badge: 'WG' },
  { id: 'security', label: 'Security & IDS', icon: ShieldAlert, badge: 'Suricata' },
  { id: 'monitoring', label: 'Monitoring', icon: BarChart3, badge: 'Prom' },
  { id: 'terraform', label: 'Terraform', icon: Layers, badge: 'IaC' },
  { id: 'automation', label: 'Automation', icon: Wrench },
  { id: 'ai_assistant', label: 'AI Assistant', icon: Bot, badge: 'AI' },
  { id: 'audit_logs', label: 'Audit Logs', icon: FileText },
  { id: 'settings', label: 'Settings', icon: SettingsIcon }
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
              AI Hybrid Cloud Platform
            </span>
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-1 text-[10px] font-semibold text-slate-500 tracking-wider uppercase font-mono">
          {!isCollapsed ? 'Operations Console' : '•••'}
        </div>

        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectPage(item.id)}
              title={isCollapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all group ${
                isActive
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
              }`}
            >
              <Icon
                className={`w-4 h-4 flex-shrink-0 transition-colors ${
                  isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'
                }`}
              />

              {!isCollapsed && (
                <div className="flex-1 flex items-center justify-between text-left">
                  <span className="tracking-wide font-sans">{item.label}</span>
                  {item.badge && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/60">
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
