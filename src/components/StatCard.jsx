import React from 'react';

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendPositive = true,
  badge,
  badgeColor = 'cyan',
  accentColor = 'cyan',
  onClick
}) {
  const accentBorder = {
    cyan: 'border-cyan-500/20 hover:border-cyan-500/40',
    emerald: 'border-emerald-500/20 hover:border-emerald-500/40',
    amber: 'border-amber-500/20 hover:border-amber-500/40',
    rose: 'border-rose-500/20 hover:border-rose-500/40',
    indigo: 'border-indigo-500/20 hover:border-indigo-500/40'
  }[accentColor] || 'border-slate-800 hover:border-slate-700';

  const iconBg = {
    cyan: 'bg-cyan-500/10 text-cyan-400',
    emerald: 'bg-emerald-500/10 text-emerald-400',
    amber: 'bg-amber-500/10 text-amber-400',
    rose: 'bg-rose-500/10 text-rose-400',
    indigo: 'bg-indigo-500/10 text-indigo-400'
  }[accentColor] || 'bg-slate-800 text-slate-300';

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-xl bg-slate-900/80 border ${accentBorder} p-5 backdrop-blur-md shadow-sm transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:translate-y-[-2px] hover:shadow-md' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold tracking-tight text-white font-mono">
              {value}
            </h3>
            {badge && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                {badge}
              </span>
            )}
          </div>
        </div>
        {Icon && (
          <div className={`p-2.5 rounded-lg ${iconBg} border border-white/5`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="mt-3 flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/60">
          <span>{subtitle}</span>
          {trend && (
            <span
              className={`font-medium ${
                trendPositive ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {trend}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
