import { useState, useEffect } from 'react';
import { UserCheck, Briefcase, Clock, CheckCircle } from 'lucide-react';
import { getPendingMentorsApi, approveUserApi } from '../../api/admin';
import { SkeletonCard } from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import Avatar from '../../components/common/Avatar';
import Spinner from '../../components/common/Spinner';
import toast from 'react-hot-toast';
import { timeAgo } from '../../utils/helpers';

export default function Approvals() {
  const [pending, setPending]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [approving, setApproving] = useState(null);

  useEffect(() => {
    getPendingMentorsApi()
      .then((res) => setPending(res.data.data))
      .catch(() => setPending([]))
      .finally(() => setLoading(false));
  }, []);

  const handleApprove = async (userId) => {
    setApproving(userId);
    try {
      await approveUserApi(userId);
      setPending((prev) => prev.filter((m) => m._id !== userId));
      toast.success('Mentor approved! They can now log in.');
    } finally { setApproving(null); }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="section-title text-2xl">Mentor Approvals</h1>
        <p className="text-slate-500 text-sm mt-1">
          {pending.length} mentor{pending.length !== 1 ? 's' : ''} awaiting approval
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">{[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}</div>
      ) : pending.length === 0 ? (
        <EmptyState icon={CheckCircle} title="All caught up!"
          description="No mentor accounts are pending approval right now." />
      ) : (
        <div className="space-y-4">
          {pending.map((mentor) => (
            <div key={mentor._id} className="card hover:border-obsidian-600 transition-all">
              <div className="flex items-start gap-4">
                <Avatar name={mentor.name} avatar={mentor.avatar} size="lg" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <h3 className="font-display font-bold text-white">{mentor.name}</h3>
                      <p className="text-xs text-slate-500">{mentor.email}</p>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-amber-400">
                      <Clock className="w-3.5 h-3.5" />{timeAgo(mentor.createdAt)}
                    </div>
                  </div>

                  {mentor.bio && <p className="text-sm text-slate-400 mt-2 line-clamp-2">{mentor.bio}</p>}

                  {mentor.mentorProfile && (
                    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1">
                      {mentor.mentorProfile.currentRole && (
                        <span className="flex items-center gap-1.5 text-xs text-slate-400">
                          <Briefcase className="w-3.5 h-3.5 text-slate-600" />
                          {mentor.mentorProfile.currentRole}{mentor.mentorProfile.company ? ` @ ${mentor.mentorProfile.company}` : ''}
                        </span>
                      )}
                      {mentor.mentorProfile.yearsOfExperience > 0 && (
                        <span className="text-xs text-slate-500">{mentor.mentorProfile.yearsOfExperience}+ yrs exp</span>
                      )}
                    </div>
                  )}

                  {mentor.mentorProfile?.expertise?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {mentor.mentorProfile.expertise.map((e) => (
                        <span key={e} className="badge badge-electric text-[10px]">{e}</span>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-3 mt-4 pt-3 border-t border-obsidian-700">
                    <button onClick={() => handleApprove(mentor._id)}
                      className="btn-primary text-sm" disabled={approving === mentor._id}>
                      {approving === mentor._id ? <Spinner size="sm" /> : <UserCheck className="w-4 h-4" />}
                      Approve Mentor
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
