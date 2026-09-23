import React, { useState } from 'react';
import {
  Server,
  Radio,
  Cloud,
  Database,
  Globe,
  Activity,
  Shield,
  Layers,
  ArrowRight,
  Info,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';

export default function TopologyCanvas({ onSelectNode }) {
  const [selectedNodeId, setSelectedNodeId] = useState('hq-core-rtr01');
  const [filterTier, setFilterTier] = useState('all');

  const nodes = [
    // On-Prem
    {
      id: 'br-remote-rtr01',
      name: 'br-remote-rtr01',
      tier: 'onprem',
      zone: 'Branch Office West',
      type: 'Router',
      model: 'Catalyst 8300',
      ip: '10.102.0.1',
      status: 'critical',
      cpu: 96.2,
      x: 10,
      y: 20
    },
    {
      id: 'dc-dist-sw01',
      name: 'dc-dist-sw01',
      tier: 'onprem',
      zone: 'HQ DataCenter',
      type: 'Switch',
      model: 'Catalyst 9300',
      ip: '10.100.1.10',
      status: 'online',
      cpu: 19.3,
      x: 10,
      y: 50
    },
    {
      id: 'esxi-node01.prod',
      name: 'esxi-node01.prod',
      tier: 'onprem',
      zone: 'HQ DataCenter',
      type: 'Server',
      model: 'PowerEdge R740xd',
      ip: '10.100.10.11',
      status: 'online',
      cpu: 62.4,
      x: 10,
      y: 80
    },
    {
      id: 'hq-core-rtr01',
      name: 'hq-core-rtr01',
      tier: 'onprem',
      zone: 'HQ DataCenter',
      type: 'Router',
      model: 'Cisco ASR 1001-X',
      ip: '10.100.0.1',
      status: 'online',
      cpu: 28.4,
      x: 28,
      y: 40
    },
    {
      id: 'hq-edge-rtr02',
      name: 'hq-edge-rtr02',
      tier: 'onprem',
      zone: 'HQ DataCenter',
      type: 'Router',
      model: 'Cisco ISR 4451-X',
      ip: '10.100.0.2',
      status: 'warning',
      cpu: 88.6,
      x: 28,
      y: 70
    },

    // Transit / Interconnect
    {
      id: 'aws-direct-connect',
      name: 'AWS Direct Connect 10G',
      tier: 'transit',
      zone: 'Dedicated Circuit',
      type: 'Dedicated VIF',
      model: 'dxcon-0291ba4 (8.4ms)',
      ip: '172.16.0.1 (BGP)',
      status: 'online',
      cpu: 64.2,
      x: 48,
      y: 35
    },
    {
      id: 'aws-ipsec-vpn',
      name: 'IPsec S2S Backup VPN',
      tier: 'transit',
      zone: 'Encrypted WAN',
      type: 'VPN Gateway',
      model: 'Tunnel0 (412 Mbps)',
      ip: '172.16.0.2',
      status: 'warning',
      cpu: 41.2,
      x: 48,
      y: 65
    },
    {
      id: 'aws-tgw',
      name: 'AWS Transit Gateway',
      tier: 'transit',
      zone: 'AWS us-east-1 Interconnect',
      type: 'Transit Gateway',
      model: 'tgw-04812fceb',
      ip: '172.16.0.254',
      status: 'online',
      cpu: 18.0,
      x: 64,
      y: 50
    },

    // AWS Cloud VPC
    {
      id: 'aws-alb-prod-ext',
      name: 'aws-alb-prod-ext',
      tier: 'cloud',
      zone: 'AWS VPC Public Subnet',
      type: 'Load Balancer',
      model: 'Application ELB',
      ip: '172.16.1.50',
      status: 'online',
      cpu: 22.0,
      x: 78,
      y: 30
    },
    {
      id: 'aws-ec2-api-01',
      name: 'aws-ec2-api-01 / 02',
      tier: 'cloud',
      zone: 'AWS VPC App Tier',
      type: 'EC2 Cluster',
      model: 't3.xlarge Fleet',
      ip: '172.16.10.14-15',
      status: 'online',
      cpu: 50.2,
      x: 88,
      y: 30
    },
    {
      id: 'aws-ec2-worker-01',
      name: 'aws-ec2-worker-01 / 02',
      tier: 'cloud',
      zone: 'AWS VPC Worker Tier',
      type: 'EC2 Batch Worker',
      model: 'c5.2xlarge Fleet',
      ip: '172.16.15.22-23',
      status: 'warning',
      cpu: 75.2,
      x: 78,
      y: 70
    },
    {
      id: 'aws-rds-postgres-primary',
      name: 'aws-rds-postgres-primary',
      tier: 'cloud',
      zone: 'AWS VPC DB Tier (Multi-AZ)',
      type: 'Database',
      model: 'db.r6g.xlarge (pg15)',
      ip: '172.16.20.5',
      status: 'online',
      cpu: 36.2,
      x: 88,
      y: 70
    }
  ];

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || nodes[3];

  const getNodeIcon = (type) => {
    switch (type) {
      case 'Router':
        return Radio;
      case 'Switch':
        return Layers;
      case 'Server':
        return Server;
      case 'Dedicated VIF':
        return Activity;
      case 'VPN Gateway':
        return Shield;
      case 'Transit Gateway':
        return Globe;
      case 'Load Balancer':
        return Globe;
      case 'Database':
        return Database;
      default:
        return Cloud;
    }
  };

  return (
    <div className="space-y-6">
      {/* Filter and Zone Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white font-mono tracking-wide">
            Interactive Hybrid Network Topology
          </h2>
          <p className="text-xs text-slate-400">
            End-to-end visual mapping from On-Prem Enterprise DC through AWS Direct Connect to Cloud VPC
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono self-start sm:self-auto">
          {['all', 'onprem', 'transit', 'cloud'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterTier(t)}
              className={`px-3 py-1 rounded-md capitalize transition-all ${
                filterTier === t
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t === 'all' ? 'Entire Topology' : t === 'onprem' ? 'On-Premises' : t === 'transit' ? 'Hybrid Transit' : 'AWS Cloud'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Diagram Area */}
      <div className="relative rounded-2xl border border-slate-800 bg-[#070b13] p-6 shadow-2xl overflow-x-auto min-h-[560px]">
        {/* Zone Background Overlays */}
        <div className="grid grid-cols-3 gap-4 absolute inset-4 pointer-events-none opacity-40">
          <div className="rounded-xl border border-cyan-500/20 bg-cyan-950/10 p-3">
            <span className="text-[10px] font-bold font-mono tracking-wider text-cyan-400 uppercase">
              ZONE 1: ON-PREMISES DATA CENTER
            </span>
          </div>
          <div className="rounded-xl border border-indigo-500/20 bg-indigo-950/10 p-3">
            <span className="text-[10px] font-bold font-mono tracking-wider text-indigo-400 uppercase">
              ZONE 2: HYBRID TRANSIT (AWS DIRECT CONNECT & IPSEC)
            </span>
          </div>
          <div className="rounded-xl border border-violet-500/20 bg-violet-950/10 p-3">
            <span className="text-[10px] font-bold font-mono tracking-wider text-violet-400 uppercase">
              ZONE 3: AWS PRODUCTION VPC (172.16.0.0/16)
            </span>
          </div>
        </div>

        {/* Interactive Diagram Nodes Grid */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 pb-4">
          {/* Column 1: On-Premises Nodes */}
          <div className={`space-y-4 ${filterTier !== 'all' && filterTier !== 'onprem' ? 'opacity-25' : ''}`}>
            <h3 className="text-xs font-bold font-mono text-cyan-400 uppercase px-1">
              On-Premises Hardware
            </h3>
            {nodes
              .filter((n) => n.tier === 'onprem')
              .map((node) => {
                const Icon = getNodeIcon(node.type);
                const isSelected = selectedNodeId === node.id;
                return (
                  <div
                    key={node.id}
                    onClick={() => {
                      setSelectedNodeId(node.id);
                      if (onSelectNode) onSelectNode(node.id);
                    }}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 border-cyan-400 shadow-glow-cyan'
                        : 'bg-slate-950/90 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-slate-800 text-cyan-400">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-white text-xs font-mono">{node.name}</div>
                          <div className="text-[11px] text-slate-400">{node.ip}</div>
                        </div>
                      </div>
                      <StatusBadge status={node.status} size="xs" />
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Column 2: Transit Layer */}
          <div className={`space-y-4 ${filterTier !== 'all' && filterTier !== 'transit' ? 'opacity-25' : ''}`}>
            <h3 className="text-xs font-bold font-mono text-indigo-400 uppercase px-1">
              Transit & Direct Connect
            </h3>
            {nodes
              .filter((n) => n.tier === 'transit')
              .map((node) => {
                const Icon = getNodeIcon(node.type);
                const isSelected = selectedNodeId === node.id;
                return (
                  <div
                    key={node.id}
                    onClick={() => {
                      setSelectedNodeId(node.id);
                      if (onSelectNode) onSelectNode(node.id);
                    }}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 border-indigo-400 shadow-md'
                        : 'bg-slate-950/90 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-slate-800 text-indigo-400">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-white text-xs font-mono">{node.name}</div>
                          <div className="text-[11px] text-slate-400">{node.model}</div>
                        </div>
                      </div>
                      <StatusBadge status={node.status} size="xs" />
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Column 3: AWS Cloud VPC */}
          <div className={`space-y-4 ${filterTier !== 'all' && filterTier !== 'cloud' ? 'opacity-25' : ''}`}>
            <h3 className="text-xs font-bold font-mono text-violet-400 uppercase px-1">
              AWS Cloud Resources
            </h3>
            {nodes
              .filter((n) => n.tier === 'cloud')
              .map((node) => {
                const Icon = getNodeIcon(node.type);
                const isSelected = selectedNodeId === node.id;
                return (
                  <div
                    key={node.id}
                    onClick={() => {
                      setSelectedNodeId(node.id);
                      if (onSelectNode) onSelectNode(node.id);
                    }}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 border-violet-400 shadow-md'
                        : 'bg-slate-950/90 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-slate-800 text-violet-400">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-white text-xs font-mono">{node.name}</div>
                          <div className="text-[11px] text-slate-400">{node.ip}</div>
                        </div>
                      </div>
                      <StatusBadge status={node.status} size="xs" />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Selected Node Telemetry Drawer / Card */}
      {selectedNode && (
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs font-mono">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-slate-800 text-cyan-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm">{selectedNode.name}</span>
                <StatusBadge status={selectedNode.status} size="xs" />
              </div>
              <p className="text-slate-400 text-xs font-sans">
                {selectedNode.zone} • {selectedNode.model}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-slate-300">
            <div>
              <span className="text-slate-500 block text-[10px]">ADDRESS</span>
              <span className="text-cyan-400">{selectedNode.ip}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">TIER / ZONE</span>
              <span className="capitalize">{selectedNode.tier}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">LOAD METRIC</span>
              <span className={selectedNode.cpu > 80 ? 'text-rose-400 font-bold' : 'text-white'}>
                {selectedNode.cpu}%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
