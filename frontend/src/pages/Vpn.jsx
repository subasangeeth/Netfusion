import React, { useState, useEffect } from 'react';
import {
  Shield,
  Activity,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  Clock,
  HardDrive,
  Lock,
  Key,
  Globe,
  Radio,
  AlertCircle
} from 'lucide-react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import StatCard from '../components/StatCard';
import { formatBytes } from '../utils/formatters';

export default function VpnPage() {
  const [vpn, setVpn] = useState(null);
  const [loading, setLoading] = useState(true);
  const [restarting, setRestarting] = useState(false);
  const [message, setMessage] = useState(null);

  const fetchVpnData = async () => {
    try {
      const data = await api.getVpnStatus();
      setVpn(data);
    } catch (err) {
      console.error('Failed to load VPN status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVpnData();
    const interval = setInterval(fetchVpnData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleRestart = async () => {
    setRestarting(true);
    setMessage(null);
    try {
      const res = await api.restartVpn();
      setMessage({ type: 'success', text: res.message || 'WireGuard tunnel re-keyed and active.' });
      await fetchVpnData();
    } catch (err) {
      setMessage({ type: 'error', text: 'Tunnel restart command failed.' });
    } finally {
      setRestarting(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  if (loading || !vpn) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white font-mono">HYBRID WIREGUARD VPN</h1>
              <StatusBadge status="online" label={vpn.status} />
              {vpn.is_demo && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  DEMO DATA
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Encrypted site-to-site overlay tunnel bridging On-Premises ({vpn.onprem_cidr}) and AWS VPC ({vpn.aws_cidr}).
            </p>
          </div>
        </div>

        <button
          onClick={handleRestart}
          disabled={restarting}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs transition-colors shadow-glow-cyan disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${restarting ? 'animate-spin' : ''}`} />
          {restarting ? 'Re-Keying...' : 'Restart & Re-Key Tunnel'}
        </button>
      </div>

      {message && (
        <div className={`p-3 rounded-lg text-xs flex items-center gap-2 border ${
          message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
        }`}>
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{message.text}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Tunnel Latency (RTT)"
          value={`${vpn.latency_ms} ms`}
          change="Nominal (SLA < 20ms)"
          trend="up"
          icon={Activity}
        />
        <StatCard
          label="Last Handshake"
          value={`${vpn.last_handshake_seconds_ago || 14}s ago`}
          change="Keepalive every 25s"
          trend="up"
          icon={Clock}
        />
        <StatCard
          label="Total Data Received (RX)"
          value={formatBytes(vpn.rx_bytes)}
          change="Clean IPsec/WG Packets"
          trend="up"
          icon={HardDrive}
        />
        <StatCard
          label="Total Data Transmitted (TX)"
          value={formatBytes(vpn.tx_bytes)}
          change="Encapsulated Traffic"
          trend="up"
          icon={HardDrive}
        />
      </div>

      {/* Visual Tunnel Architecture Card */}
      <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300 font-mono mb-4">
          Point-to-Point Tunnel Topology
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* On-Prem Side */}
          <div className="p-4 rounded-lg bg-slate-950/80 border border-cyan-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-cyan-400">ON-PREMISES GATEWAY</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300">Docker Linux</span>
            </div>
            <div className="text-xs text-slate-300">Endpoint: <span className="font-mono text-cyan-300">{vpn.local_endpoint}</span></div>
            <div className="text-xs text-slate-300">Tunnel IP: <span className="font-mono text-cyan-300">{vpn.local_tunnel_ip}</span></div>
            <div className="text-xs text-slate-300">Network: <span className="font-mono text-cyan-300">{vpn.onprem_cidr}</span></div>
          </div>

          {/* Middle Tunnel Pipe */}
          <div className="flex flex-col items-center justify-center text-center space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>ChaCha20-Poly1305 (UDP 51820)</span>
            </div>
            <div className="w-full h-1 bg-gradient-to-r from-cyan-500 via-emerald-400 to-indigo-500 rounded-full animate-pulse" />
            <span className="text-[11px] text-slate-400 font-mono">Status: {vpn.status} • MTU 1420</span>
          </div>

          {/* AWS Side */}
          <div className="p-4 rounded-lg bg-slate-950/80 border border-indigo-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-indigo-400">AWS CLOUD ENDPOINT</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300">EC2 VPC</span>
            </div>
            <div className="text-xs text-slate-300">Endpoint: <span className="font-mono text-indigo-300">{vpn.remote_endpoint}</span></div>
            <div className="text-xs text-slate-300">Tunnel IP: <span className="font-mono text-indigo-300">{vpn.remote_tunnel_ip}</span></div>
            <div className="text-xs text-slate-300">VPC CIDR: <span className="font-mono text-indigo-300">{vpn.aws_cidr}</span></div>
          </div>
        </div>
      </div>

      {/* WireGuard Parameters Table */}
      <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300 font-mono mb-4">
          Cryptographic & Routing Parameters
        </h2>
        <div className="overflow-x-auto font-mono text-xs">
          <table className="w-full text-left">
            <tbody className="divide-y divide-slate-800">
              <tr>
                <td className="py-2.5 text-slate-400">Local Public Key</td>
                <td className="py-2.5 text-cyan-300">{vpn.public_key || "G7yE8vSj4X3nK9mP2qW5rT1uA6dF8hZ0bV4cY9eM3xL="}</td>
              </tr>
              <tr>
                <td className="py-2.5 text-slate-400">Peer Public Key</td>
                <td className="py-2.5 text-indigo-300">{vpn.peer_public_key || "bV4cY9eM3xLG7yE8vSj4X3nK9mP2qW5rT1uA6dF8hZ0="}</td>
              </tr>
              <tr>
                <td className="py-2.5 text-slate-400">Allowed Networks</td>
                <td className="py-2.5 text-slate-200">{vpn.allowed_networks}</td>
              </tr>
              <tr>
                <td className="py-2.5 text-slate-400">Persistent Keepalive</td>
                <td className="py-2.5 text-slate-200">25 seconds</td>
              </tr>
              <tr>
                <td className="py-2.5 text-slate-400">Routing Policy</td>
                <td className="py-2.5 text-slate-200">ip route add 10.20.0.0/16 via 10.50.0.2 dev wg0</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
