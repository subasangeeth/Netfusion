import React, { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  Filter,
  Download,
  Pause,
  Play,
  RotateCcw,
  Terminal,
  Copy,
  Check,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { api } from '../services/api';
import { getSeverityStyle } from '../utils/statusTheme';

export default function Logs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('ALL');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [isPaused, setIsPaused] = useState(false);
  const [expandedLogId, setExpandedLogId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    if (!isPaused) {
      loadLogs();
    }
  }, [search, levelFilter, sourceFilter, isPaused]);

  async function loadLogs() {
    try {
      setLoading(true);
      const res = await api.getLogs({
        search,
        level: levelFilter,
        source: sourceFilter
      });
      setLogs(res.data);
    } catch (err) {
      console.error('Failed to load logs:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleCopy = (log) => {
    navigator.clipboard.writeText(log.raw || log.message);
    setCopiedId(log.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExport = () => {
    const textContent = logs.map((l) => l.raw || `[${l.timestamp}] [${l.level}] [${l.source}] ${l.message}`).join('\n');
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `netfusion-syslog-${new Date().toISOString().slice(0, 10)}.log`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const levels = ['ALL', 'CRIT', 'WARN', 'INFO', 'DEBUG'];

  return (
    <div className="space-y-4">
      {/* Title and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white font-mono tracking-wide">
            Centralized Event & Syslog Stream
          </h2>
          <p className="text-xs text-slate-400">
            Unified RFC 5424 Syslog and AWS CloudWatch log events aggregator
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono transition-all ${
              isPaused
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:text-white'
            }`}
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            <span>{isPaused ? 'Resume Stream' : 'Pause Stream'}</span>
          </button>

          <button
            onClick={loadLogs}
            title="Refresh stream"
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-mono transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Log</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search log messages, services, keywords..."
            className="w-full pl-9 pr-4 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Level Filters */}
        <div className="flex items-center gap-1 overflow-x-auto">
          {levels.map((lvl) => {
            const isSelected = levelFilter === lvl;
            return (
              <button
                key={lvl}
                onClick={() => setLevelFilter(lvl)}
                className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition-all ${
                  isSelected
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {lvl}
              </button>
            );
          })}
        </div>
      </div>

      {/* Terminal-style Log Viewer Container */}
      <div className="rounded-xl border border-slate-800 bg-[#070b12] shadow-2xl overflow-hidden font-mono text-xs">
        {/* Terminal Header */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800/80 bg-slate-950/80">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
            <span className="text-[11px] text-slate-400 ml-2">syslogd & cloudwatch-agent</span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span>{logs.length} matching events</span>
            {isPaused && (
              <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                STREAM PAUSED
              </span>
            )}
          </div>
        </div>

        {/* Logs Scroll Area */}
        <div className="divide-y divide-slate-800/40 max-h-[600px] overflow-y-auto">
          {loading ? (
            <div className="p-16 text-center text-slate-500">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-cyan-500 border-t-transparent mb-2" />
              <p>Reading log buffers...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              No log messages matching filter criteria.
            </div>
          ) : (
            logs.map((log) => {
              const isExpanded = expandedLogId === log.id;
              const sev = getSeverityStyle(log.level);

              return (
                <div
                  key={log.id}
                  className="p-3 hover:bg-slate-900/60 transition-colors group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div
                      onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                      className="flex-1 flex items-start gap-2.5 cursor-pointer"
                    >
                      <button className="text-slate-600 group-hover:text-slate-400 pt-0.5">
                        {isExpanded ? (
                          <ChevronDown className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {/* Timestamp */}
                      <span className="text-slate-400 whitespace-nowrap text-[11px]">
                        {log.timestamp}
                      </span>

                      {/* Level Badge */}
                      <span
                        className={`px-1.5 py-0.2 rounded text-[10px] font-bold border ${sev.badge}`}
                      >
                        {log.level}
                      </span>

                      {/* Source & Service */}
                      <span className="text-cyan-400 font-semibold whitespace-nowrap">
                        {log.source}
                      </span>

                      <span className="text-indigo-300 text-[11px] whitespace-nowrap">
                        [{log.service}]
                      </span>

                      {/* Message */}
                      <p className="text-slate-300 break-all leading-tight">
                        {log.message}
                      </p>
                    </div>

                    {/* Copy Button */}
                    <button
                      onClick={() => handleCopy(log)}
                      title="Copy raw log line"
                      className="p-1 text-slate-600 hover:text-slate-300 transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                    >
                      {copiedId === log.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  {/* Expanded Detail View */}
                  {isExpanded && (
                    <div className="mt-3 ml-6 p-3 rounded bg-slate-950 border border-slate-800 text-[11px] space-y-2">
                      <div className="text-slate-400">
                        <span className="text-slate-500">RAW SYSLOG PAYLOAD:</span>
                        <pre className="mt-1 p-2 rounded bg-black/60 text-slate-200 overflow-x-auto whitespace-pre-wrap font-mono">
                          {log.raw || log.message}
                        </pre>
                      </div>
                      <div className="flex items-center gap-4 text-slate-500 pt-1 border-t border-slate-900">
                        <span>Facility: {log.facility || 'daemon'}</span>
                        <span>Log ID: {log.id}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
