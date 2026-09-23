import React, { useState, useEffect } from 'react';
import {
  Cloud,
  Server,
  Database,
  Globe,
  HardDrive,
  Layers,
  Cpu,
  Activity,
  Code,
  CheckCircle,
  ExternalLink,
  DollarSign
} from 'lucide-react';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import DataTable from '../components/DataTable';
import { api } from '../services/api';

export default function CloudPage() {
  const [cloudData, setCloudData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCloud();
  }, []);

  async function loadCloud() {
    try {
      setLoading(true);
      const res = await api.getCloud();
      setCloudData(res.data);
    } catch (err) {
      console.error('Failed to load cloud resources:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading || !cloudData) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-cyan-500 border-t-transparent" />
      </div>
    );
  }

  const { region, account, vpc, summary, instances, rds, alb, storage } = cloudData;

  const instanceColumns = [
    {
      header: 'Instance Name / ID',
      key: 'name',
      render: (name, row) => (
        <div>
          <span className="font-bold text-white font-mono">{name}</span>
          <div className="text-[11px] text-slate-500 font-mono">{row.id}</div>
        </div>
      )
    },
    {
      header: 'Instance Type',
      key: 'type',
      render: (type, row) => (
        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-xs border border-slate-700">
          {type} ({row.vCpu} vCPU, {row.memory})
        </span>
      )
    },
    {
      header: 'Availability Zone',
      key: 'az',
      render: (az) => <span className="text-slate-400 font-mono">{az}</span>
    },
    {
      header: 'Private IP',
      key: 'privateIp',
      render: (ip) => <span className="text-cyan-300 font-mono">{ip}</span>
    },
    {
      header: 'State',
      key: 'state',
      render: (state) => (
        <StatusBadge
          status={state === 'running' ? 'online' : 'stopped'}
          label={state.toUpperCase()}
          size="xs"
        />
      )
    },
    {
      header: 'CPU Load',
      key: 'cpu',
      render: (cpu) => (
        <div className="w-20 space-y-1">
          <div className="flex justify-between text-[11px]">
            <span className={cpu > 75 ? 'text-amber-400 font-bold' : 'text-slate-300'}>
              {cpu}%
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full ${cpu > 75 ? 'bg-amber-400' : 'bg-cyan-500'}`}
              style={{ width: `${cpu}%` }}
            />
          </div>
        </div>
      )
    },
    {
      header: 'Memory %',
      key: 'memoryUsage',
      render: (mem) => (
        <span className="text-slate-300 font-mono text-xs">{mem}%</span>
      )
    },
    {
      header: 'Network I/O',
      key: 'networkIn',
      render: (netIn, row) => (
        <span className="text-slate-400 text-xs font-mono">
          ↓ {netIn} / ↑ {row.networkOut}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header with Teammate Cloud Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              TEAMMATE AWS DOMAIN
            </span>
            <span className="text-xs text-slate-400 font-mono">
              AWS Region: {region} • {account}
            </span>
          </div>
          <h2 className="text-xl font-bold text-white font-mono tracking-wide">
            AWS Cloud Infrastructure Telemetry
          </h2>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono self-start sm:self-auto px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
          <span className="text-slate-400">VPC:</span>
          <span className="text-cyan-300 font-bold">{vpc.cidr}</span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400">TGW:</span>
          <span className="text-slate-300">{vpc.transitGatewayId}</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="EC2 Compute Fleet"
          value={`${summary.runningInstances} / ${summary.totalInstances} Active`}
          subtitle="Auto Scaling Group: Healthy"
          icon={Server}
          accentColor="indigo"
          badge="EC2"
        />

        <StatCard
          title="Avg CPU Load"
          value={`${summary.avgCpuUtilization}%`}
          subtitle="Memory Average: 63.6%"
          icon={Cpu}
          accentColor="cyan"
          badge="CloudWatch"
        />

        <StatCard
          title="Direct Connect Virtual VIF"
          value={vpc.directConnectLatency}
          subtitle={vpc.directConnectStatus}
          icon={Activity}
          accentColor="emerald"
          badge="10G Trunk"
        />

        <StatCard
          title="Projected AWS Spend"
          value={summary.estimatedMonthlyCost}
          subtitle="NOC Cost Awareness Meter"
          icon={DollarSign}
          accentColor="amber"
          badge="Monthly"
        />
      </div>

      {/* Compute Fleet (EC2) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wide uppercase font-mono">
              EC2 Compute Instances Fleet
            </h3>
            <p className="text-xs text-slate-400">
              Web API microservices and asynchronous Celery worker nodes
            </p>
          </div>
        </div>
        <DataTable
          columns={instanceColumns}
          data={instances}
          keyField="id"
        />
      </div>

      {/* Managed Services: RDS & ALB */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* RDS PostgreSQL Card */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white font-mono">{rds.identifier}</h4>
                <p className="text-xs text-slate-400">{rds.engine} • {rds.instanceClass}</p>
              </div>
            </div>
            <StatusBadge status="online" label="Multi-AZ Active" size="xs" />
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-3 rounded bg-slate-950/70 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">PRIMARY NODE (us-east-1a)</span>
              <span className="text-white font-bold">{rds.primary.cpu}% CPU</span>
              <div className="text-slate-400 text-[11px] mt-1">
                Connections: {rds.primary.activeConnections}/{rds.primary.maxConnections}
              </div>
              <div className="text-slate-400 text-[11px]">IOPS: {rds.primary.iops.toLocaleString()}</div>
            </div>

            <div className="p-3 rounded bg-slate-950/70 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">READ REPLICA (us-east-1b)</span>
              <span className="text-white font-bold">{rds.replica.cpu}% CPU</span>
              <div className="text-emerald-400 text-[11px] mt-1">
                Replication Lag: {rds.replica.replicationLag}
              </div>
              <div className="text-slate-400 text-[11px]">Connections: {rds.replica.activeConnections}</div>
            </div>
          </div>

          <div className="text-xs text-slate-400 font-mono flex items-center justify-between pt-1">
            <span>Allocated Storage: {rds.allocatedStorage}</span>
            <span className="text-cyan-400">Freeable RAM: {rds.primary.freeableMemory}</span>
          </div>
        </div>

        {/* Application Load Balancer Card */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white font-mono">{alb.name}</h4>
                <p className="text-xs text-slate-400">{alb.scheme} • Dual AZ Ingress</p>
              </div>
            </div>
            <StatusBadge status="online" label="4/4 Targets Healthy" size="xs" />
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-3 rounded bg-slate-950/70 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">THROUGHPUT RATE</span>
              <span className="text-cyan-400 font-bold text-base">{alb.requestRate}</span>
              <div className="text-slate-400 text-[11px] mt-1">
                Avg Latency: {alb.avgTargetResponseTime}
              </div>
            </div>

            <div className="p-3 rounded bg-slate-950/70 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">HTTP STATUS CODES</span>
              <div className="flex items-center justify-between text-emerald-400 font-bold">
                <span>2xx Success:</span>
                <span>{alb.http2xxRate}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>4xx Client:</span>
                <span>{alb.http4xxRate}</span>
              </div>
              <div className="flex items-center justify-between text-rose-400">
                <span>5xx Server:</span>
                <span>{alb.http5xxRate}</span>
              </div>
            </div>
          </div>

          <div className="p-2 rounded bg-slate-950/50 border border-slate-800/80 text-[11px] font-mono text-slate-400 truncate">
            DNS: {alb.dnsName}
          </div>
        </div>
      </div>

      {/* S3 Storage Tiers */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 backdrop-blur-md space-y-3">
        <h3 className="text-sm font-semibold text-white tracking-wide uppercase font-mono">
          AWS S3 Telemetry & Storage Tiers
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {storage.map((bucket, idx) => (
            <div
              key={idx}
              className="p-4 rounded-lg bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs font-mono"
            >
              <div className="space-y-1">
                <span className="font-bold text-white block">{bucket.bucket}</span>
                <span className="text-slate-400">{bucket.tier} • {bucket.encryption}</span>
              </div>
              <div className="text-right">
                <span className="text-base font-bold text-cyan-400 block">{bucket.size}</span>
                <span className="text-[11px] text-slate-500">{bucket.objects} objects</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Teammate Integration Handover Spec */}
      <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/20 p-5 text-xs backdrop-blur-md space-y-2">
        <div className="flex items-center gap-2">
          <Code className="w-4 h-4 text-indigo-400" />
          <h4 className="font-bold text-indigo-300 font-mono uppercase tracking-wide">
            Teammate API Handover Contract (AWS Cloud Infrastructure)
          </h4>
        </div>
        <p className="text-slate-300 leading-relaxed font-sans">
          This frontend consumes AWS status via <code className="text-cyan-300 font-mono">api.getCloud()</code> which maps to <code className="text-cyan-300 font-mono">/api/cloud</code>. When your teammate deploys the cloud collector agent (e.g., Python Boto3 script polling CloudWatch + EC2 describe instances), ensure their backend returns this JSON schema. Toggling <code className="text-cyan-300 font-mono">USE_MOCK: false</code> in <code className="text-cyan-300 font-mono">src/services/api.js</code> immediately streams their live AWS data without touching any React components.
        </p>
      </div>
    </div>
  );
}
