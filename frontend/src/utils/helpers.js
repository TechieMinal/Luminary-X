import { formatDistanceToNow, format, isValid } from 'date-fns';

export const timeAgo = (date) => {
  if (!date) return '—';
  try {
    const d = new Date(date);
    return isValid(d) ? formatDistanceToNow(d, { addSuffix: true }) : '—';
  } catch { return '—'; }
};

export const formatDate = (date, fmt = 'MMM d, yyyy') => {
  if (!date) return '—';
  try {
    const d = new Date(date);
    return isValid(d) ? format(d, fmt) : '—';
  } catch { return '—'; }
};

export const formatDateTime = (date) => {
  if (!date) return '—';
  try {
    const d = new Date(date);
    return isValid(d) ? format(d, 'MMM d, yyyy · h:mm a') : '—';
  } catch { return '—'; }
};

export const getInitials = (name = '') => {
  if (!name?.trim()) return '?';
  return name.split(' ').filter(Boolean).slice(0, 2).map((n) => n[0]).join('').toUpperCase();
};

export const getProficiencyColor = (level) => ({
  beginner:     'badge-neutral',
  intermediate: 'badge-amber',
  advanced:     'badge-electric',
  expert:       'badge-aurora',
}[level] || 'badge-neutral');

export const getStatusColor = (status) => ({
  pending:       'badge-amber',
  confirmed:     'badge-electric',
  completed:     'badge-aurora',
  cancelled:     'badge-rose',
  'in-progress': 'badge-electric',
  paused:        'badge-amber',
  public:        'badge-aurora',
  private:       'badge-neutral',
}[status] || 'badge-neutral');

export const capitalize = (str = '') =>
  str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : '';

export const truncate = (str = '', n = 100) =>
  str && str.length > n ? str.slice(0, n) + '…' : str;
