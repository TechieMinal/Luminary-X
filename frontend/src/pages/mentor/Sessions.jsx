import { useState, useEffect, useCallback } from 'react';
import { Calendar, Check, X, Link as LinkIcon, FileText } from 'lucide-react';
import { getMentorSessionsApi } from '../../api/mentors';
import { updateSessionStatusApi } from '../../api/sessions';
import { SkeletonCard } from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import Avatar from '../../components/common/Avatar';
import Spinner from '../../components/common/Spinner';
import toast from 'react-hot-toast';
import { formatDateTime, getStatusColor } from '../../utils/helpers';

const FILTERS = [
  { value: '',           label: 'All' },
  { value: 'pending',    label: 'Pending' },
  { value: 'confirmed',  label: 'Confirmed' },
  { value: 'completed',  label: 'Completed' },
  { value: 'cancelled',  label: 'Cancelled' },
];

export default function MentorSessions() {
  const [sessions, setSessions]     = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading]       = useState(true);
  const [filter, setFilter]         = useState('');
  const [actionModal, setActionModal] = useState(null);
  const [actionForm, setActionForm] = useState({ meetingLink: '', notes: '' });
  const [processing, setProcessing] = useState(false);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getMentorSessionsApi({ status: filter || undefined, limit: 20 });
      setSessions(res.data.data);
      setPagination(res.data.pagination);
    } finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  const updateStatus = async (id, status, extra = {}) => {
    setProcessing(true);
    try {
      const res = await updateSessionStatusApi(id, { status, ...extra });
      setSessions((prev) => prev.map((s) => s._id === id ? res.data.data : s));
      toast.success(`Session ${status}`);
      setActionModal(null);
      setActionForm({ meetingLink: '', notes: '' });
    } finally { setProcessing(false); }
  };

  const quickDecline = (id) => updateStatus(id, 'cancelled');

  const handleActionSubmit = () => {
    if (!actionModal) return;
    updateStatus(actionModal._id, 'confirmed', {
      meetingLink: actionForm.meetingLink || undefined,
      notes: actionForm.notes || undefined,
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="section-title text-2xl">Sessions</h1>
        <p className="text-slate-500 text-sm mt-1">{pagination.total || 0} total sessions</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {FILTERS.map((f) => (
          <button key={f.value} onClick={() => setFilter(f.value)}
            className={`px-4 py-2 rounded-lg text-sm font-display font-medium transition-all
              ${filter === f.value ? 'bg-electric-500 text-white' : 'btn-secondary'}`}>
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">{[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}</div>
      ) : sessions.length === 0 ? (
        <EmptyState icon={Calendar}
          title="No sessions found"
          description={filter ? `No ${filter} sessions.` : 'No session requests yet.'} />
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => (
            <div key={s._id} className="card hover:border-obsidian-600 transition-all">
              <div className="flex items-start gap-4">
                <Avatar name={s.student?.name} avatar={s.student?.avatar} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <div>
                      <h3 className="text-sm font-display font-bold text-white">{s.title}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">from {s.student?.name}</p>
                    </div>
                    <span className={`badge flex-shrink-0 ${getStatusColor(s.status)}`}>{s.status}</span>
                  </div>

                  {s.description && (
                    <p className="text-xs text-slate-400 mt-2 line-clamp-2">{s.description}</p>
                  )}

                  <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3 h-3" />{formatDateTime(s.scheduledAt)}
                    </span>
                    <span>{s.duration} min</span>
                  </div>

                  {s.notes && (
                    <div className="mt-3 p-3 rounded-lg bg-obsidian-800 border border-obsidian-700">
                      <p className="text-xs text-slate-400 flex items-start gap-2">
                        <FileText className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-slate-600" />
                        {s.notes}
                      </p>
                    </div>
                  )}

                  {s.meetingLink && (
                    <a href={s.meetingLink} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 mt-2 text-xs text-electric-400 hover:text-electric-300 transition-colors">
                      <LinkIcon className="w-3 h-3" />Meeting Link
                    </a>
                  )}

                  {/* Actions */}
                  {s.status === 'pending' && (
                    <div className="flex gap-2 mt-3 pt-3 border-t border-obsidian-700">
                      <button onClick={() => { setActionModal(s); setActionForm({ meetingLink: '', notes: '' }); }}
                        className="btn-primary px-3 py-1.5 text-xs">
                        <Check className="w-3.5 h-3.5" />Confirm
                      </button>
                      <button onClick={() => quickDecline(s._id)}
                        className="btn-danger px-3 py-1.5 text-xs" disabled={processing}>
                        <X className="w-3.5 h-3.5" />Decline
                      </button>
                    </div>
                  )}
                  {s.status === 'confirmed' && (
                    <div className="flex gap-2 mt-3 pt-3 border-t border-obsidian-700">
                      <button onClick={() => { setActionModal(s); setActionForm({ meetingLink: s.meetingLink || '', notes: s.notes || '' }); }}
                        className="btn-secondary px-3 py-1.5 text-xs">
                        <FileText className="w-3.5 h-3.5" />Edit Details
                      </button>
                      <button onClick={() => updateStatus(s._id, 'completed')}
                        className="btn-primary px-3 py-1.5 text-xs" disabled={processing}>
                        <Check className="w-3.5 h-3.5" />Mark Complete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirm Modal */}
      <Modal isOpen={!!actionModal} onClose={() => setActionModal(null)} title="Confirm Session">
        {actionModal && (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-obsidian-800 border border-obsidian-700">
              <p className="text-sm font-display font-bold text-white">{actionModal.title}</p>
              <p className="text-xs text-slate-500 mt-0.5">
                with {actionModal.student?.name} · {formatDateTime(actionModal.scheduledAt)}
              </p>
            </div>
            <div>
              <label className="label">Meeting Link (optional)</label>
              <input type="url" className="input-field" placeholder="https://meet.google.com/…"
                value={actionForm.meetingLink}
                onChange={(e) => setActionForm({ ...actionForm, meetingLink: e.target.value })} />
            </div>
            <div>
              <label className="label">Session Notes (optional)</label>
              <textarea className="input-field resize-none" rows={3}
                placeholder="Agenda, prep materials, or any notes for the student…"
                value={actionForm.notes}
                onChange={(e) => setActionForm({ ...actionForm, notes: e.target.value })} />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setActionModal(null)} className="btn-secondary">Cancel</button>
              <button onClick={handleActionSubmit} className="btn-primary" disabled={processing}>
                {processing && <Spinner size="sm" />}
                <Check className="w-4 h-4" />Confirm Session
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
