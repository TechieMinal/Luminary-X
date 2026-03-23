import { useState, useEffect } from 'react';
import { Users, MessageSquare } from 'lucide-react';
import { getMentorMenteesApi } from '../../api/mentors';
import { SkeletonCard } from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import Avatar from '../../components/common/Avatar';
import { useNavigate } from 'react-router-dom';
import { timeAgo } from '../../utils/helpers';

export default function Mentees() {
  const [mentees, setMentees] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getMentorMenteesApi()
      .then((res) => setMentees(Array.isArray(res.data.data) ? res.data.data : []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="section-title text-2xl">My Mentees</h1>
        <p className="text-slate-500 text-sm mt-1">
          {mentees.length} student{mentees.length !== 1 ? 's' : ''} under your guidance
        </p>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 gap-4">{[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}</div>
      ) : mentees.length === 0 ? (
        <EmptyState icon={Users} title="No mentees yet"
          description="Students will appear here after they book a session with you." />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {mentees.map((m) => (
            <div key={m._id} className="card hover:border-obsidian-600 transition-all duration-200">
              <div className="flex items-start gap-3">
                <Avatar name={m.name} avatar={m.avatar} size="lg" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-bold text-white text-sm">{m.name}</h3>
                  <p className="text-xs text-slate-500 truncate">{m.email}</p>
                  {m.bio && <p className="text-xs text-slate-400 mt-2 line-clamp-2">{m.bio}</p>}
                  <p className="text-[10px] text-slate-600 mt-2">Joined {timeAgo(m.createdAt)}</p>
                </div>
              </div>
              <div className="flex gap-2 mt-4 pt-3 border-t border-obsidian-700">
                <button
                  onClick={() => navigate(`/mentor/messages?user=${m._id}`)}
                  className="btn-secondary flex-1 justify-center text-sm py-2">
                  <MessageSquare className="w-4 h-4" />Message
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
