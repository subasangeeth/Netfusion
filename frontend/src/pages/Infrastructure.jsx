import React, { useState, useEffect } from 'react';
import {
  Server,
  Filter,
  Download,
  ExternalLink,
  Cpu,
  HardDrive,
  Activity,
  Layers,
  Wrench,
  Network
} from 'lucide-react';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import SearchFilterBar from '../components/SearchFilterBar';
import Drawer from '../components/Drawer';
import { api } from '../services/api';
import { exportToCsv } from '../utils/exportUtils';
import { timeAgo } from '../utils/formatters';

export default function Infrastructure({ onNavigate, onSelectDeviceForTroubleshooting }) {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedDevice, setSelectedDevice] = useState(null);

  useEffect(() => {
    loadDevices();
  }, [search, activeTab]);

  async function loadDevices() {
    try {
      setLoading(true);
      const res = await api.getDevices({ query: search, environment: activeTab });
      setDevices(Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []));
    } catch (err) {
      console.error('Failed to load devices:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleExport = () => {
    exportToCsv('netfusion-infrastructure-inventory', devices);
  };

  const filterTabs = [
    { id: 'all', label: 'All Resources', count: 14 },
    { id: 'onprem', label: 'On-Premises DC', count: 8 },
    { id: 'cloud', label: 'AWS Cloud', count: 6 },
    { id: 'warning', label: 'Attention Needed', count: 2 }
  ];

  // Filter local state if 'warning' tab is clicked
  const displayedDevices = activeTab === 'warning'
    ? devices.filter((d) => d.status === 'warning' || d.status === 'critical')
    : devices;

  const columns = [
    {
      header: 'Device / Hostname',
      key: 'name',
      render: (name, row) => (
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60">
            <Server className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div>
            <span className="font-bold text-white hover:text-cyan-400 transition-colors">
              {name}
            </span>
            <div className="text-[11px] text-slate-500 font-sans">{row.model}</div>
          </div>
        </div>
      )
    },
    {
      header: 'Address / Endpoint',
      key: 'ip',
      render: (ip) => (
        <span className="text-cyan-300 font-mono text-xs">{ip}</span>
      )
    },
    {
      header: 'Type & Role',
      key: 'type',
      render: (type, row) => (
        <div>
          <span className="text-slate-200 font-semibold">{type}</span>
          <div className="text-[11px] text-slate-500">{row.role}</div>
        </div>
      )
    },
    {
      header: 'Environment',
      key: 'environment',
      render: (env) => (
        <span
          className={`text-[11px] px-2 py-0.5 rounded font-mono ${
            (env || '').includes('AWS')
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
              : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
          }`}
        >
          {env || 'On-Prem DC'}
        </span>
      )
    },
    {
      header: 'Status',
      key: 'status',
      render: (status) => <StatusBadge status={status} size="xs" />
    },
    {
      header: 'CPU Load',
      key: 'cpu',
      render: (cpu) => {
        const isHigh = cpu > 80;
        return (
          <div className="w-24 space-y-1">
            <div className="flex justify-between text-[11px]">
              <span className={isHigh ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                {cpu}%
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  isHigh ? 'bg-rose-500' : cpu > 60 ? 'bg-amber-400' : 'bg-cyan-500'
                }`}
                style={{ width: `${Math.min(cpu, 100)}%` }}
              />
            </div>
          </div>
        );
      }
    },
    {
      header: 'Memory',
      key: 'memory',
      render: (memory) => {
        const isHigh = memory > 80;
        return (
          <div className="w-24 space-y-1">
            <div className="flex justify-between text-[11px]">
              <span className={isHigh ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                {memory}%
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  isHigh ? 'bg-rose-500' : memory > 65 ? 'bg-amber-400' : 'bg-indigo-400'
                }`}
                style={{ width: `${Math.min(memory, 100)}%` }}
              />
            </div>
          </div>
        );
      }
    },
    {
      header: 'Throughput',
      key: 'throughputIn',
      render: (val, row) => (
        <span className="text-slate-300 text-xs">
          ↓ {row.throughputIn} / ↑ {row.throughputOut}
        </span>
      )
    },
    {
      header: 'Uptime',
      key: 'uptime',
      render: (uptime) => <span className="text-slate-400 text-xs">{uptime}</span>
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white font-mono tracking-wide">
            Hybrid Infrastructure Inventory
          </h2>
          <p className="text-xs text-slate-400">
            Unified catalog across On-Prem Enterprise DC and AWS Cloud VPC
          </p>
        </div>

        <button
          onClick={handleExport}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 text-xs font-mono transition-all self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <SearchFilterBar
        searchPlaceholder="Filter by name, IP, model, role..."
        searchValue={search}
        onSearchChange={setSearch}
        filterTabs={filterTabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Inventory Table */}
      <DataTable
        columns={columns}
        data={displayedDevices}
        loading={loading}
        onRowClick={(row) => setSelectedDevice(row)}
      />

      {/* Side Drawer for Device Deep-Dive */}
      <Drawer
        isOpen={!!selectedDevice}
        onClose={() => setSelectedDevice(null)}
        title={selectedDevice?.name || 'Device Details'}
        subtitle={`${selectedDevice?.type} • ${selectedDevice?.model}`}
      >
        {selectedDevice && (
          <div className="space-y-6 text-xs font-mono">
            {/* Status and Action Header */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-slate-400 block text-[11px]">OPERATIONAL STATE</span>
                <StatusBadge status={selectedDevice.status} size="md" />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const devName = selectedDevice.name;
                    setSelectedDevice(null);
                    if (onSelectDeviceForTroubleshooting) {
                      onSelectDeviceForTroubleshooting(devName);
                    }
                    onNavigate('troubleshooting');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/40 text-xs font-semibold flex items-center gap-1.5"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Troubleshoot</span>
                </button>
              </div>
            </div>

            {/* Technical Specifications */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Telemetry & Spec Details
              </h4>
              <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-slate-950/70 border border-slate-800/80">
                <div>
                  <span className="text-slate-500 block text-[10px]">PRIMARY IP</span>
                  <span className="text-cyan-400">{selectedDevice.ip}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">MANAGEMENT IP / ENDPOINT</span>
                  <span className="text-slate-300">{selectedDevice.managementIp}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">LOCATION / AZ</span>
                  <span className="text-slate-300">{selectedDevice.location}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">FIRMWARE / OS VERSION</span>
                  <span className="text-slate-300">{selectedDevice.firmware}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">TEMPERATURE</span>
                  <span className="text-slate-300">{selectedDevice.temperature}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">UPTIME</span>
                  <span className="text-slate-300">{selectedDevice.uptime}</span>
                </div>
              </div>
            </div>

            {/* Compute Metrics */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Real-Time Load Counters
              </h4>
              <div className="p-4 rounded-lg bg-slate-950/70 border border-slate-800/80 space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-400">Processor (CPU):</span>
                    <span className="text-white font-bold">{selectedDevice.cpu}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        selectedDevice.cpu > 80 ? 'bg-rose-500' : 'bg-cyan-500'
                      }`}
                      style={{ width: `${selectedDevice.cpu}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-400">Memory Allocation (RAM):</span>
                    <span className="text-white font-bold">{selectedDevice.memory}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        selectedDevice.memory > 80 ? 'bg-rose-500' : 'bg-indigo-400'
                      }`}
                      style={{ width: `${selectedDevice.memory}%` }}
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex justify-between">
                  <span className="text-slate-400">Network Interface Rate:</span>
                  <span className="text-slate-200">
                    ↓ {selectedDevice.throughputIn} / ↑ {selectedDevice.throughputOut}
                  </span>
                </div>
              </div>
            </div>

            {/* Note */}
            <div className="p-3 rounded bg-slate-950 border border-slate-800/80 text-[11px] text-slate-400 font-sans">
              ℹ️ Telemetry polled via <span className="font-mono text-cyan-400">services/api.js</span> abstraction layer. Ready to connect to live AWS CloudWatch / SSH agent.
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
