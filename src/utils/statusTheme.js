export function getStatusStyle(status = 'online') {
  const normalized = String(status).toLowerCase();

  switch (normalized) {
    case 'online':
    case 'up':
    case 'available':
    case 'running':
    case 'optimal':
      return {
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-400',
        border: 'border-emerald-500/30',
        dot: 'bg-emerald-400',
        pulse: 'bg-emerald-400/50',
        label: 'Online'
      };
    case 'warning':
    case 'degraded':
      return {
        bg: 'bg-amber-500/10',
        text: 'text-amber-400',
        border: 'border-amber-500/30',
        dot: 'bg-amber-400',
        pulse: 'bg-amber-400/50',
        label: 'Warning'
      };
    case 'critical':
    case 'down':
    case 'error':
      return {
        bg: 'bg-rose-500/10',
        text: 'text-rose-400',
        border: 'border-rose-500/30',
        dot: 'bg-rose-400',
        pulse: 'bg-rose-400/50',
        label: 'Critical'
      };
    case 'acknowledged':
      return {
        bg: 'bg-cyan-500/10',
        text: 'text-cyan-400',
        border: 'border-cyan-500/30',
        dot: 'bg-cyan-400',
        pulse: 'bg-cyan-400/50',
        label: 'Acknowledged'
      };
    case 'resolved':
      return {
        bg: 'bg-slate-500/10',
        text: 'text-slate-400',
        border: 'border-slate-500/30',
        dot: 'bg-slate-400',
        pulse: 'bg-slate-400/30',
        label: 'Resolved'
      };
    case 'stopped':
    case 'disabled':
    case 'offline':
      return {
        bg: 'bg-zinc-700/20',
        text: 'text-zinc-400',
        border: 'border-zinc-700/50',
        dot: 'bg-zinc-400',
        pulse: 'bg-zinc-400/20',
        label: 'Offline'
      };
    default:
      return {
        bg: 'bg-slate-800/40',
        text: 'text-slate-300',
        border: 'border-slate-700/50',
        dot: 'bg-slate-400',
        pulse: 'bg-slate-400/20',
        label: status
      };
  }
}

export function getSeverityStyle(severity = 'info') {
  const norm = String(severity).toLowerCase();
  switch (norm) {
    case 'critical':
    case 'emerg':
    case 'crit':
      return {
        badge: 'bg-rose-950/80 text-rose-300 border-rose-500/40',
        iconColor: 'text-rose-400',
        glow: 'shadow-glow-rose',
        dot: 'bg-rose-500'
      };
    case 'warning':
    case 'warn':
      return {
        badge: 'bg-amber-950/80 text-amber-300 border-amber-500/40',
        iconColor: 'text-amber-400',
        glow: 'shadow-glow-amber',
        dot: 'bg-amber-500'
      };
    case 'info':
      return {
        badge: 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40',
        iconColor: 'text-cyan-400',
        glow: 'shadow-glow-cyan',
        dot: 'bg-cyan-500'
      };
    case 'debug':
      return {
        badge: 'bg-slate-900 text-slate-400 border-slate-700/40',
        iconColor: 'text-slate-400',
        glow: '',
        dot: 'bg-slate-500'
      };
    default:
      return {
        badge: 'bg-slate-900 text-slate-300 border-slate-700',
        iconColor: 'text-slate-400',
        glow: '',
        dot: 'bg-slate-400'
      };
  }
}
