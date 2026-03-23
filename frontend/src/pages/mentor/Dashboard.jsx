import { useState, useEffect } from 'react';
import { Users, Calendar, TrendingUp, ArrowRight, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { getMentorMenteesApi, getMentorSessionsApi } from '../../api/mentors';
import StatsCard from '../../components/common/StatsCard';
import { SkeletonStat, SkeletonCard } from '../../components/common/Spinner';
import Avatar from '../../components/common/Avatar';
import { formatDateTime, getStatusColor } from '../../utils/helpers';

export default function MentorDashboard() {
  const { user } = useAuthStore();
  const [mentees, setMentees]   = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([getMentorMenteesApi(), getMentorSessionsApi({ limit: 5 })])
      .then(([mRes, sRes]) => {
        setMentees(Array.isArray(mRes.data.data) ? mRes.data.data : []);
        setSessions(Array.isArray(sRes.data.data) ? sRes.data.data : []);
      })
      .finally(() => setLoading(false));
  }, []);

  const pending   = sessions.filter((s) => s.status === 'pending').length;
  const confirmed = sessions.filter((s) => s.status === 'confirmed').length;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <p className="text-slate-500 text-sm font-display mb-1">Mentor Dashboard</p>
        <h1 className="font-display font-bold text-2xl text-white">
          Welcome, <span className="gradient-text">{user?.name?.split(' ')[0]}</span>
        </h1>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {loading
          ? [...Array(3)].map((_, i) => <SkeletonStat key={i} />)
          : <>
              <StatsCard label="Total Mentees"     value={mentees.length} icon={Users}       color="electric" />
              <StatsCard label="Pending Requests"  value={pending}        icon={Calendar}    color="amber" />
              <StatsCard label="Active Sessions"   value={confirmed}      icon={TrendingUp}  color="aurora" />
            </>}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Mentees */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">My Mentees</h2>
            <Link to="/mentor/mentees" className="btn-ghost text-sm text-electric-400">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {loading ? <SkeletonCard /> : mentees.length === 0 ? (
            <div className="card text-center py-8">
              <Users className="w-8 h-8 text-obsidian-600 mx-auto mb-2" />
              <p className="text-slate-500 text-sm">No mentees yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {mentees.slice(0, 5).map((m) => (
                <div key={m._id} className="card flex items-center gap-3 py-3 hover:border-obsidian-600 transition-all">
                  <Avatar name={m.name} avatar={m.avatar} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-display font-semibold text-white truncate">{m.name}</p>
                    <p className="text-xs text-slate-500 truncate">{m.email}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sessions */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Recent Sessions</h2>
            <Link to="/mentor/sessions" className="btn-ghost text-sm text-electric-400">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {loading ? <SkeletonCard /> : sessions.length === 0 ? (
            <div className="card text-center py-8">
              <Calendar className="w-8 h-8 text-obsidian-600 mx-auto mb-2" />
              <p className="text-slate-500 text-sm">No sessions yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sessions.map((s) => (
                <div key={s._id} className="card flex items-center gap-3 py-3 hover:border-obsidian-600 transition-all">
                  <Avatar name={s.student?.name} avatar={s.student?.avatar} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-display font-semibold text-white truncate">{s.title}</p>
                    <p className="text-xs text-slate-500">{formatDateTime(s.scheduledAt)}</p>
                  </div>
                  <span className={`badge flex-shrink-0 ${getStatusColor(s.status)}`}>{s.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
