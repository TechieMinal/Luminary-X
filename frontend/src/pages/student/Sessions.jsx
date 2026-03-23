import { useState, useEffect, useCallback } from 'react';
import { Calendar, Star, ExternalLink, Link as LinkIcon } from 'lucide-react';
import { getStudentSessionsApi, rateSessionApi } from '../../api/sessions';
import { SkeletonCard } from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import Avatar from '../../components/common/Avatar';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { formatDateTime, getStatusColor } from '../../utils/helpers';

const FILTERS = [
  { value: '',           label: 'All' },
  { value: 'pending',    label: 'Pending' },
  { value: 'confirmed',  label: 'Confirmed' },
  { value: 'completed',  label: 'Completed' },
  { value: 'cancelled',  label: 'Cancelled' },
];

export default function Sessions() {
  const [sessions, setSessions]     = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading]       = useState(true);
  const [filter, setFilter]         = useState('');
  const [rateTarget, setRateTarget] = useState(null);
  const [rating, setRating]         = useState({ score: 5, review: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getStudentSessionsApi({ status: filter || undefined, limit: 20 });
      setSessions(res.data.data);
      setPagination(res.data.pagination);
    } finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  const handleRate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await rateSessionApi(rateTarget._id, rating);
      setSessions((prev) => prev.map((s) => s._id === rateTarget._id ? res.data.data : s));
      toast.success('Session rated — thank you!');
      setRateTarget(null);
    } finally { setSubmitting(false); }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="section-title text-2xl">My Sessions</h1>
        <p className="text-slate-500 text-sm mt-1">{pagination.total || 0} total sessions</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map((f) => (
          <button key={f.value} onClick={() => setFilter(f.value)}
            className={`px-4 py-2 rounded-lg text-sm font-display font-medium transition-all
              ${filter === f.value ? 'bg-electric-500 text-white' : 'btn-secondary'}`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Sessions list */}
      {loading ? (
        <div className="space-y-4">{[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}</div>
      ) : sessions.length === 0 ? (
        <EmptyState icon={Calendar}
          title="No sessions found"
          description={filter ? `No ${filter} sessions yet.` : 'Book your first session with a mentor.'}
          action={!filter && (
            <Link to="/student/mentors" className="btn-primary text-sm">Browse Mentors</Link>
          )} />
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => (
            <div key={s._id} className="card hover:border-obsidian-600 transition-all">
              <div className="flex items-start gap-4">
                <Avatar name={s.mentor?.name} avatar={s.mentor?.avatar} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <div>
                      <h3 className="text-sm font-display font-bold text-white">{s.title}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">with {s.mentor?.name}</p>
                    </div>
                    <span className={`badge flex-shrink-0 ${getStatusColor(s.status)}`}>{s.status}</span>
                  </div>

                  {s.description && (
                    <p className="text-xs text-slate-400 mt-2 line-clamp-2">{s.description}</p>
                  )}

                  <div className="flex items-center gap-4 mt-3 flex-wrap">
                    <span className="text-xs text-slate-500 flex items-center gap-1.5">
                      <Calendar className="w-3 h-3" />{formatDateTime(s.scheduledAt)}
                    </span>
                    <span className="text-xs text-slate-600">{s.duration} min</span>
                    {s.meetingLink && (
                      <a href={s.meetingLink} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-electric-400 hover:text-electric-300 flex items-center gap-1 transition-colors">
                        <ExternalLink className="w-3 h-3" />Join Meeting
                      </a>
                    )}
                  </div>

                  {s.notes && (
                    <div className="mt-3 p-3 rounded-lg bg-obsidian-800 border border-obsidian-700">
                      <p className="text-xs text-slate-400 flex items-start gap-2">
                        <LinkIcon className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-slate-600" />
                        {s.notes}
                      </p>
                    </div>
                  )}

                  <div className="mt-3 flex items-center justify-between">
                    {s.rating?.score ? (
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3.5 h-3.5 ${i < s.rating.score ? 'text-amber-400 fill-amber-400' : 'text-slate-700'}`} />
                        ))}
                        <span className="text-xs text-slate-600 ml-1">You rated this</span>
                      </div>
                    ) : s.status === 'completed' ? (
                      <button onClick={() => setRateTarget(s)}
                        className="btn-primary px-3 py-1.5 text-xs">
                        <Star className="w-3.5 h-3.5" />Rate Session
                      </button>
                    ) : <div />}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rate Modal */}
      <Modal isOpen={!!rateTarget} onClose={() => setRateTarget(null)} title="Rate Your Session" size="sm">
        {rateTarget && (
          <form onSubmit={handleRate} className="space-y-5">
            <div className="text-center">
              <p className="text-sm text-slate-400 mb-4">How was your session with <strong className="text-white">{rateTarget.mentor?.name}</strong>?</p>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} type="button" onClick={() => setRating({ ...rating, score: n })}
                    className="transition-transform hover:scale-110">
                    <Star className={`w-9 h-9 transition-colors ${n <= rating.score ? 'text-amber-400 fill-amber-400' : 'text-obsidian-600 hover:text-amber-400/50'}`} />
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-2">
                {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][rating.score]}
              </p>
            </div>
            <div>
              <label className="label">Leave a review (optional)</label>
              <textarea className="input-field resize-none" rows={3}
                placeholder="Share what made this session valuable…"
                value={rating.review}
                onChange={(e) => setRating({ ...rating, review: e.target.value })} />
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setRateTarget(null)} className="btn-secondary">Skip</button>
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? 'Saving…' : 'Submit Rating'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
