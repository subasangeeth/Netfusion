import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

export default function CpuMemoryTrendChart({ data = [], height = 280 }) {
  const [metricType, setMetricType] = useState('cpu'); // 'cpu' or 'memory'

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-700/80 p-3 rounded-lg shadow-xl text-xs font-mono">
          <p className="text-slate-400 mb-1.5 font-bold">Timeline: {label}</p>
          {payload.map((item, index) => (
            <div key={index} className="flex items-center justify-between gap-4 py-0.5">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-slate-300">{item.name}:</span>
              </span>
              <span className="font-bold text-white">{item.value}%</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 backdrop-blur-md">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-white tracking-wide uppercase font-mono">
            Hybrid Compute Telemetry Trend
          </h3>
          <p className="text-xs text-slate-400">On-Prem DataCenter vs AWS Cloud Compute Load</p>
        </div>
        <div className="flex items-center p-0.5 rounded-lg bg-slate-950 border border-slate-800 text-xs">
          <button
            onClick={() => setMetricType('cpu')}
            className={`px-3 py-1 rounded-md font-medium transition-colors ${
              metricType === 'cpu'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            CPU Load (%)
          </button>
          <button
            onClick={() => setMetricType('memory')}
            className={`px-3 py-1 rounded-md font-medium transition-colors ${
              metricType === 'memory'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            RAM Allocation (%)
          </button>
        </div>
      </div>

      <div style={{ width: '100%', height }}>
        <ResponsiveContainer>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorOnPrem" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorCloud" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis
              dataKey="time"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#1e293b' }}
            />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              domain={[0, 100]}
              tickLine={false}
              axisLine={{ stroke: '#1e293b' }}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
              formatter={(value) => <span className="text-slate-300">{value}</span>}
            />
            <Area
              type="monotone"
              dataKey={metricType === 'cpu' ? 'onPremCpu' : 'onPremMem'}
              name="On-Prem DC"
              stroke="#06b6d4"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorOnPrem)"
            />
            <Area
              type="monotone"
              dataKey={metricType === 'cpu' ? 'cloudCpu' : 'cloudMem'}
              name="AWS Cloud"
              stroke="#8b5cf6"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorCloud)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
