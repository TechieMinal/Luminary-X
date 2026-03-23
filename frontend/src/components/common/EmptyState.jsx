export default function EmptyState({ icon: Icon, title, description, action, className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 text-center px-4 ${className}`}>
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-obsidian-800 border border-obsidian-700 flex items-center justify-center mb-4">
          <Icon className="w-6 h-6 text-slate-500" />
        </div>
      )}
      <h3 className="font-display font-bold text-white text-base mb-2">{title}</h3>
      {description && <p className="text-slate-500 text-sm max-w-xs leading-relaxed mb-6">{description}</p>}
      {action}
    </div>
  );
}
