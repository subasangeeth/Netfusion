import React, { useState, useEffect } from 'react';
import {
  FileText,
  Filter,
  Download,
  RefreshCw,
  Search,
  CheckCircle,
  XCircle,
  Shield
} from 'lucide-react';
import api from '../services/api';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedResource, setSelectedResource] = useState('all');

  const fetchLogs = async () => {
    try {
      const data = await api.getAuditLogs(selectedResource !== 'all' ? { resource_type: selectedResource } : null);
      setLogs(data);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [selectedResource]);

  const filteredLogs = logs.filter((l) =>
    l.user_email?.toLowerCase().includes(search.toLowerCase()) ||
    l.action?.toLowerCase().includes(search.toLowerCase()) ||
    l.resource_type?.toLowerCase().includes(search.toLowerCase())
  );

  const handleExportCsv = () => {
    const headers = ["Timestamp", "User", "Role", "Action", "Resource Type", "Resource ID", "Status", "IP Address"];
    const rows = filteredLogs.map((l) => [
      l.timestamp,
      l.user_email,
      l.role,
      l.action,
      l.resource_type,
      l.resource_id || "",
      l.status,
      l.ip_address || "127.0.0.1"
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `netfusion_audit_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white font-mono">AUDIT TRAIL & COMPLIANCE LOGS</h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                IMMUTABLE
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Tamper-evident operational log recording route modifications, Terraform executions, AI tool calls, and authentication events.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchLogs}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors border border-slate-700"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search action, user email, or resource..."
            className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg pl-9 pr-3 py-2 font-mono focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={selectedResource}
            onChange={(e) => setSelectedResource(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-2 font-mono focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Resources</option>
            <option value="Route">Route Modifications</option>
            <option value="Terraform">Terraform Runs</option>
            <option value="AI">AI Tool Calls</option>
            <option value="Security">Security & Attack Sim</option>
            <option value="User">Authentication</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-2.5 px-3">Timestamp</th>
              <th className="py-2.5 px-3">User</th>
              <th className="py-2.5 px-3">Role</th>
              <th className="py-2.5 px-3">Action</th>
              <th className="py-2.5 px-3">Resource Type</th>
              <th className="py-2.5 px-3">Resource ID</th>
              <th className="py-2.5 px-3">Result</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80 bg-slate-900/20">
            {filteredLogs.map((l) => (
              <tr key={l.id} className="hover:bg-slate-800/40 transition-colors">
                <td className="py-2 px-3 text-slate-400 whitespace-nowrap">
                  {new Date(l.timestamp).toLocaleString()}
                </td>
                <td className="py-2 px-3 text-cyan-300 font-medium">{l.user_email}</td>
                <td className="py-2 px-3 text-purple-300">{l.role}</td>
                <td className="py-2 px-3 text-white font-bold">{l.action}</td>
                <td className="py-2 px-3 text-slate-300">{l.resource_type}</td>
                <td className="py-2 px-3 text-slate-400">{l.resource_id || "—"}</td>
                <td className="py-2 px-3">
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                    l.status === 'SUCCESS'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  }`}>
                    {l.status}
                  </span>
                </td>
              </tr>
            ))}
            {filteredLogs.length === 0 && (
              <tr>
                <td colSpan={7} className="py-6 text-center text-slate-500">
                  No matching audit logs found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
