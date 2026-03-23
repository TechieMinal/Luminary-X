import { getInitials } from '../../utils/helpers';

const sizes = {
  xs:  'w-6 h-6 text-[9px]',
  sm:  'w-8 h-8 text-xs',
  md:  'w-10 h-10 text-sm',
  lg:  'w-12 h-12 text-base',
  xl:  'w-16 h-16 text-lg',
  '2xl': 'w-20 h-20 text-xl',
};

const gradients = [
  'from-electric-500 to-violet-600',
  'from-aurora-500 to-electric-500',
  'from-amber-500 to-rose-500',
  'from-rose-500 to-pink-600',
  'from-violet-500 to-electric-500',
  'from-teal-500 to-aurora-500',
];

function pickGradient(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return gradients[Math.abs(hash) % gradients.length];
}

export default function Avatar({ name = '', avatar, size = 'md', className = '' }) {
  const sz = sizes[size] || sizes.md;
  if (avatar) {
    return (
      <img src={avatar} alt={name}
        className={`${sz} rounded-full object-cover ring-2 ring-obsidian-700 flex-shrink-0 ${className}`}
      />
    );
  }
  return (
    <div className={`${sz} rounded-full bg-gradient-to-br ${pickGradient(name)} flex items-center justify-center font-display font-bold text-white ring-2 ring-obsidian-700 flex-shrink-0 ${className}`}>
      {getInitials(name)}
    </div>
  );
}
