import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Download,
  Filter,
  Check,
  Wrench,
  Search,
  CheckCheck
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import SearchFilterBar from '../components/SearchFilterBar';
import { api } from '../services/api';
import { exportToCsv } from '../utils/exportUtils';
import { timeAgo, formatFullDateTime } from '../utils/formatters';

export default function Alerts({ onNavigate, onSelectDeviceForTroubleshooting }) {
  const [alerts, setAlerts] = useState([]);
  const [counts, setCounts] = useState({ critical: 0, warning: 0, info: 0, resolved: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionMessage, setActionMessage] = useState('');

  useEffect(() => {
    loadAlerts();
  }, [search, severityFilter, statusFilter]);

  async function loadAlerts() {
    try {
      setLoading(true);
      const res = await api.getAlerts({
        search,
        severity: severityFilter,
        status: statusFilter
      });
      setAlerts(res.data);
      if (res.counts) setCounts(res.counts);
    } catch (err) {
      console.error('Failed to load alerts:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAcknowledge(alertId) {
    try {
      await api.acknowledgeAlert(alertId, 'NOC_Operator_Lead');
      setActionMessage(`Alert ${alertId} acknowledged.`);
      setTimeout(() => setActionMessage(''), 3000);
      loadAlerts();
    } catch (err) {
      console.error('Failed to acknowledge alert:', err);
    }
  }

  async function handleResolve(alertId) {
    try {
      await api.resolveAlert(alertId);
      setActionMessage(`Alert ${alertId} resolved and archived.`);
      setTimeout(() => setActionMessage(''), 3000);
      loadAlerts();
    } catch (err) {
      console.error('Failed to resolve alert:', err);
    }
  }

  const handleExport = () => {
    exportToCsv('netfusion-incidents', alerts);
  };

  const severityTabs = [
    { id: 'all', label: 'All Incidents', count: alerts.length },
    { id: 'critical', label: 'Critical P1', count: counts.critical },
    { id: 'warning', label: 'Warning P2', count: counts.warning },
    { id: 'info', label: 'Informational', count: counts.info }
  ];

  return (
    <div className="space-y-6">
      {/* Page Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white font-mono tracking-wide">
            SOC / NOC Incident Triage Console
          </h2>
          <p className="text-xs text-slate-400">
            Real-time threshold triggers, hardware alarms, and BGP/WAN incident management
          </p>
        </div>

        <button
          onClick={handleExport}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 text-xs font-mono transition-all self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Incident CSV</span>
        </button>
      </div>

      {/* Action Notification Toast */}
      {actionMessage && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono flex items-center gap-2 animate-fadeIn">
          <CheckCheck className="w-4 h-4" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Alert KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-rose-500/30 shadow-glow-rose backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-rose-400 uppercase">Critical (P1)</span>
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono mt-2">{counts.critical}</div>
          <p className="text-[11px] text-slate-400 mt-1">SLA response: &lt;15 mins</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-amber-500/30 shadow-glow-amber backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-amber-400 uppercase">Warning (P2)</span>
            <span className="w-2 h-2 rounded-full bg-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono mt-2">{counts.warning}</div>
          <p className="text-[11px] text-slate-400 mt-1">Resource capacity limits</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-cyan-500/30 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase">Informational</span>
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono mt-2">{counts.info}</div>
          <p className="text-[11px] text-slate-400 mt-1">Automated backup & sync</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase">Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-slate-300 font-mono mt-2">{counts.resolved}</div>
          <p className="text-[11px] text-slate-400 mt-1">Cleared in current shift</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <SearchFilterBar
        searchPlaceholder="Search alerts by title, device, IP..."
        searchValue={search}
        onSearchChange={setSearch}
        filterTabs={severityTabs}
        activeTab={severityFilter}
        onTabChange={setSeverityFilter}
        extraActions={
          <div className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono">
            <span className="text-slate-500 pl-2">State:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-slate-300 pr-2 py-0.5 focus:outline-none"
            >
              <option value="all">All States</option>
              <option value="active">Active Only</option>
              <option value="acknowledged">Acknowledged</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        }
      />

      {/* Incidents Feed */}
      {loading ? (
        <div className="p-16 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-cyan-500 border-t-transparent" />
          <p className="text-xs text-slate-400 font-mono mt-2">Loading incident queue...</p>
        </div>
      ) : alerts.length === 0 ? (
        <div className="p-12 text-center rounded-xl border border-slate-800 bg-slate-900/40 text-slate-500 font-mono text-xs">
          No active alerts matching the selected filter criteria.
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => {
            const isCritical = alert.severity === 'critical';
            const isWarning = alert.severity === 'warning';
            const isResolved = alert.status === 'resolved';
            const isAck = alert.status === 'acknowledged';

            return (
              <div
                key={alert.id}
                className={`p-4 sm:p-5 rounded-xl border transition-all ${
                  isCritical && !isResolved
                    ? 'border-rose-500/40 bg-gradient-to-r from-rose-950/20 via-slate-900 to-slate-900/80 shadow-glow-rose/30'
                    : isWarning && !isResolved
                    ? 'border-amber-500/30 bg-slate-900/90'
                    : 'border-slate-800 bg-slate-900/60 opacity-85'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Severity & Details */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                      <StatusBadge
                        status={isCritical ? 'critical' : isWarning ? 'warning' : 'info'}
                        label={alert.severity.toUpperCase()}
                        size="xs"
                      />
                      <StatusBadge
                        status={alert.status}
                        label={alert.status.toUpperCase()}
                        size="xs"
                        pulse={false}
                      />
                      <span className="text-slate-500">|</span>
                      <span className="font-bold text-white">{alert.resourceName}</span>
                      <span className="text-cyan-400">({alert.resourceIp})</span>
                      <span className="text-slate-500">•</span>
                      <span className="text-slate-400">{alert.category}</span>
                      <span className="text-slate-500">•</span>
                      <span className="text-slate-400">{timeAgo(alert.timestamp)}</span>
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-white tracking-wide">
                      {alert.title}
                    </h3>

                    <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
                      {alert.description}
                    </p>

                    {/* Telemetry trigger badge */}
                    <div className="flex flex-wrap items-center gap-3 pt-1 text-xs font-mono">
                      <span className="text-slate-400">
                        Rule: <span className="text-slate-200">{alert.metric}</span>
                      </span>
                      <span className="text-slate-500">|</span>
                      <span className="text-slate-400">
                        Observed: <span className="text-rose-400 font-bold">{alert.currentValue}</span>
                      </span>
                    </div>

                    {alert.acknowledgedBy && (
                      <p className="text-[11px] text-cyan-400 font-mono">
                        Acknowledged by <span className="font-bold">{alert.acknowledgedBy}</span> at {formatFullDateTime(alert.acknowledgedAt)}
                      </p>
                    )}
                  </div>

                  {/* Right Actions */}
                  <div className="flex flex-wrap lg:flex-col items-stretch justify-end gap-2 text-xs font-mono shrink-0">
                    {alert.status === 'active' && (
                      <button
                        onClick={() => handleAcknowledge(alert.id)}
                        className="px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/40 font-semibold transition-all flex items-center justify-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Acknowledge</span>
                      </button>
                    )}

                    {alert.status !== 'resolved' && (
                      <button
                        onClick={() => handleResolve(alert.id)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/40 font-semibold transition-all flex items-center justify-center gap-1.5"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        <span>Resolve</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        if (onSelectDeviceForTroubleshooting) {
                          onSelectDeviceForTroubleshooting(alert.resourceName);
                        }
                        onNavigate('troubleshooting');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700 font-semibold transition-all flex items-center justify-center gap-1.5"
                    >
                      <Wrench className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Troubleshoot</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
