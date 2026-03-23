export default function StatsCard({ label, value, icon: Icon, color = 'electric', trend, subtitle }) {
  const palette = {
    electric: { bg: 'bg-electric-500/10', text: 'text-electric-400', border: 'border-electric-500/20' },
    aurora:   { bg: 'bg-aurora-500/10',   text: 'text-aurora-400',   border: 'border-aurora-500/20' },
    amber:    { bg: 'bg-amber-500/10',    text: 'text-amber-400',    border: 'border-amber-500/20' },
    rose:     { bg: 'bg-rose-500/10',     text: 'text-rose-400',     border: 'border-rose-500/20' },
    violet:   { bg: 'bg-violet-500/10',   text: 'text-violet-400',   border: 'border-violet-500/20' },
    // legacy aliases
    brand:    { bg: 'bg-electric-500/10', text: 'text-electric-400', border: 'border-electric-500/20' },
    emerald:  { bg: 'bg-aurora-500/10',   text: 'text-aurora-400',   border: 'border-aurora-500/20' },
  };
  const p = palette[color] || palette.electric;

  return (
    <div className="card hover:border-obsidian-600 transition-all duration-200">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 ${p.bg} ${p.border}`}>
          <Icon className={`w-5 h-5 ${p.text}`} />
        </div>
        {trend !== undefined && (
          <span className={`text-xs font-display font-semibold ${trend >= 0 ? 'text-aurora-400' : 'text-rose-400'}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="text-2xl font-display font-bold text-white mb-0.5">{value ?? '—'}</p>
      <p className="text-xs text-slate-500 font-display font-medium uppercase tracking-wider">{label}</p>
      {subtitle && <p className="text-xs text-slate-600 mt-1">{subtitle}</p>}
    </div>
  );
}
