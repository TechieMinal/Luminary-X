import { useState, useEffect, useCallback } from 'react';
import { Search, Users, Star, Briefcase, MessageSquare, Calendar, SlidersHorizontal } from 'lucide-react';
import { getMentorsApi } from '../../api/mentors';
import { requestSessionApi } from '../../api/sessions';
import { SkeletonCard } from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import Avatar from '../../components/common/Avatar';
import Spinner from '../../components/common/Spinner';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function Mentors() {
  const [mentors, setMentors]       = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [page, setPage]             = useState(1);
  const [sessionModal, setSessionModal]     = useState(null);
  const [sessionForm, setSessionForm] = useState({ title: '', description: '', scheduledAt: '', duration: 60 });
  const [booking, setBooking]       = useState(false);
  const navigate = useNavigate();

  const fetchMentors = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getMentorsApi({ page, limit: 12, search: search || undefined });
      setMentors(res.data.data);
      setPagination(res.data.pagination);
    } finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => {
    const t = setTimeout(fetchMentors, 350);
    return () => clearTimeout(t);
  }, [fetchMentors]);

  const handleBook = async (e) => {
    e.preventDefault();
    if (!sessionModal) return;
    setBooking(true);
    try {
      await requestSessionApi({ mentorId: sessionModal.user._id, ...sessionForm, duration: Number(sessionForm.duration) });
      toast.success('Session requested! The mentor will confirm soon.');
      setSessionModal(null);
      setSessionForm({ title: '', description: '', scheduledAt: '', duration: 60 });
    } finally { setBooking(false); }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="section-title text-2xl">Find a Mentor</h1>
        <p className="text-slate-500 text-sm mt-1">Connect with experienced professionals who can guide your career</p>
      </div>

      {/* Search */}
      <div className="relative max-w-lg">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input type="text" className="input-field pl-11"
          placeholder="Search by name or expertise…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : mentors.length === 0 ? (
        <EmptyState icon={Users} title="No mentors found"
          description={search ? 'Try a different search term.' : 'No approved mentors available yet.'} />
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {mentors.map((profile) => (
              <div key={profile._id}
                className="card flex flex-col hover:border-electric-500/30 hover:bg-obsidian-800/60 transition-all duration-200">
                {/* Header */}
                <div className="flex items-start gap-3 mb-3">
                  <Avatar name={profile.user?.name} avatar={profile.user?.avatar} size="lg" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-bold text-white text-sm truncate">{profile.user?.name}</h3>
                    <p className="text-xs text-slate-500 truncate">
                      {profile.currentRole || 'Mentor'}{profile.company ? ` @ ${profile.company}` : ''}
                    </p>
                    {profile.rating?.count > 0 && (
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span className="text-xs text-amber-400 font-display font-semibold">{profile.rating.average}</span>
                        <span className="text-xs text-slate-600">({profile.rating.count})</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bio */}
                {profile.user?.bio && (
                  <p className="text-xs text-slate-400 line-clamp-2 mb-3 leading-relaxed">{profile.user.bio}</p>
                )}

                {/* Expertise tags */}
                {profile.expertise?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {profile.expertise.slice(0, 3).map((e) => (
                      <span key={e} className="badge badge-electric text-[10px]">{e}</span>
                    ))}
                    {profile.expertise.length > 3 && (
                      <span className="badge badge-neutral text-[10px]">+{profile.expertise.length - 3}</span>
                    )}
                  </div>
                )}

                {/* Footer */}
                <div className="mt-auto flex items-center gap-2 pt-3 border-t border-obsidian-700">
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Briefcase className="w-3 h-3" />
                    {profile.yearsOfExperience}y
                  </div>
                  {profile.sessionRate === 0
                    ? <span className="text-xs text-aurora-400 font-display font-semibold">Free</span>
                    : <span className="text-xs text-slate-400">${profile.sessionRate}/hr</span>}
                  <div className="ml-auto flex gap-1.5">
                    <button
                      onClick={() => navigate(`/${window.location.pathname.split('/')[1]}/messages?user=${profile.user?._id}`)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-obsidian-700 transition-colors"
                      title="Message">
                      <MessageSquare className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setSessionModal(profile)}
                      className="btn-primary px-3 py-1.5 text-xs">
                      <Calendar className="w-3.5 h-3.5" />Book
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center gap-2">
              {[...Array(pagination.pages)].map((_, i) => (
                <button key={i} onClick={() => setPage(i + 1)}
                  className={`w-8 h-8 rounded-lg text-sm font-display font-medium transition-all
                    ${page === i + 1 ? 'bg-electric-500 text-white' : 'btn-secondary'}`}>
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {/* Book Session Modal */}
      <Modal isOpen={!!sessionModal} onClose={() => setSessionModal(null)} title="Request a Session">
        {sessionModal && (
          <form onSubmit={handleBook} className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-obsidian-800 border border-obsidian-700">
              <Avatar name={sessionModal.user?.name} avatar={sessionModal.user?.avatar} size="md" />
              <div>
                <p className="text-sm font-display font-bold text-white">{sessionModal.user?.name}</p>
                <p className="text-xs text-slate-500">{sessionModal.currentRole}{sessionModal.company ? ` @ ${sessionModal.company}` : ''}</p>
              </div>
            </div>

            <div>
              <label className="label">Session title</label>
              <input type="text" className="input-field" placeholder="e.g. Career roadmap review"
                value={sessionForm.title}
                onChange={(e) => setSessionForm({ ...sessionForm, title: e.target.value })} required />
            </div>
            <div>
              <label className="label">What would you like to discuss?</label>
              <textarea className="input-field resize-none" rows={3}
                placeholder="Describe your goals for this session…"
                value={sessionForm.description}
                onChange={(e) => setSessionForm({ ...sessionForm, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Preferred date & time</label>
                <input type="datetime-local" className="input-field"
                  value={sessionForm.scheduledAt}
                  onChange={(e) => setSessionForm({ ...sessionForm, scheduledAt: e.target.value })} required />
              </div>
              <div>
                <label className="label">Duration</label>
                <select className="input-field" value={sessionForm.duration}
                  onChange={(e) => setSessionForm({ ...sessionForm, duration: parseInt(e.target.value) })}>
                  {[30, 60, 90, 120].map((m) => (
                    <option key={m} value={m} className="bg-obsidian-800">{m} min</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-1">
              <button type="button" onClick={() => setSessionModal(null)} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary" disabled={booking}>
                {booking && <Spinner size="sm" />}
                Request Session
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
