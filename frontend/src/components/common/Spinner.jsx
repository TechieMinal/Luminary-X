export default function Spinner({ size = 'md', className = '' }) {
  const sz = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8', xl: 'w-12 h-12' }[size] || 'w-6 h-6';
  return (
    <div className={`${sz} border-2 border-obsidian-600 border-t-electric-500 rounded-full animate-spin flex-shrink-0 ${className}`} />
  );
}

export function PageLoader() {
  return (
    <div className="fixed inset-0 bg-obsidian-950 flex flex-col items-center justify-center z-50 gap-4">
      <div className="w-10 h-10 border-2 border-obsidian-700 border-t-electric-500 rounded-full animate-spin" />
      <p className="text-slate-500 text-sm font-display">Loading…</p>
    </div>
  );
}

export function SkeletonCard({ className = '' }) {
  return (
    <div className={`card ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className="skeleton w-10 h-10 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-3 w-3/4" />
          <div className="skeleton h-2.5 w-1/2" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="skeleton h-2.5 w-full" />
        <div className="skeleton h-2.5 w-5/6" />
        <div className="skeleton h-2.5 w-4/6" />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5 }) {
  return (
    <div className="space-y-3">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 bg-obsidian-900 border border-obsidian-700 rounded-xl">
          <div className="skeleton w-9 h-9 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-3 w-48" />
            <div className="skeleton h-2.5 w-32" />
          </div>
          <div className="skeleton h-6 w-16 rounded-full" />
          <div className="skeleton h-6 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonStat() {
  return (
    <div className="card">
      <div className="skeleton w-10 h-10 rounded-xl mb-3" />
      <div className="skeleton h-7 w-16 mb-2" />
      <div className="skeleton h-3 w-24" />
    </div>
  );
}
