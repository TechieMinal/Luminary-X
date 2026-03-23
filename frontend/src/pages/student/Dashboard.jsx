import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Code2, Users, Calendar, ArrowRight, Star, Zap } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { getMySkillsApi } from '../../api/skills';
import { getMyProjectsApi } from '../../api/projects';
import { getStudentSessionsApi } from '../../api/sessions';
import StatsCard from '../../components/common/StatsCard';
import { SkeletonStat, SkeletonCard } from '../../components/common/Spinner';
import { formatDateTime, getStatusColor } from '../../utils/helpers';
import Avatar from '../../components/common/Avatar';

const QUICK_LINKS = [
  { to: '/student/skills',   label: 'Add Skill',      icon: BookOpen, color: 'electric' },
  { to: '/student/projects', label: 'New Project',     icon: Code2,    color: 'aurora' },
  { to: '/student/mentors',  label: 'Find Mentor',     icon: Users,    color: 'amber' },
  { to: '/student/sessions', label: 'My Sessions',     icon: Calendar, color: 'rose' },
];

const iconColors = {
  electric: 'bg-electric-500/15 text-electric-400',
  aurora:   'bg-aurora-500/15   text-aurora-400',
  amber:    'bg-amber-500/15    text-amber-400',
  rose:     'bg-rose-500/15     text-rose-400',
};

export default function StudentDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({ skills: 0, projects: 0, sessions: 0 });
  const [recentSessions, setRecentSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [skillsRes, projectsRes, sessionsRes] = await Promise.all([
          getMySkillsApi(),
          getMyProjectsApi({ limit: 1 }),
          getStudentSessionsApi({ limit: 4 }),
        ]);
        setStats({
          skills:   skillsRes.data.data.length,
          projects: projectsRes.data.pagination?.total ?? 0,
          sessions: sessionsRes.data.pagination?.total ?? 0,
        });
        setRecentSessions(sessionsRes.data.data.slice(0, 4));
      } finally { setLoading(false); }
    })();
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <p className="text-slate-500 text-sm font-display mb-1">{greeting} 👋</p>
          <h1 className="font-display font-bold text-2xl text-white">
            Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0]}</span>
          </h1>
        </div>
        <Link to="/student/mentors" className="btn-primary text-sm">
          <Users className="w-4 h-4" /> Find a Mentor
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {loading
          ? [...Array(3)].map((_, i) => <SkeletonStat key={i} />)
          : <>
              <StatsCard label="Skills Added"   value={stats.skills}   icon={BookOpen} color="electric" />
              <StatsCard label="Projects"       value={stats.projects} icon={Code2}    color="aurora" />
              <StatsCard label="Total Sessions" value={stats.sessions} icon={Calendar} color="amber" />
            </>}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="section-title mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {QUICK_LINKS.map(({ to, label, icon: Icon, color }) => (
            <Link key={to} to={to}
              className="card hover:border-obsidian-600 flex flex-col items-center gap-3 py-5 text-center transition-all duration-200 hover:bg-obsidian-800/80">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconColors[color]}`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-sm font-display font-semibold text-white">{label}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Sessions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title">Recent Sessions</h2>
          <Link to="/student/sessions" className="btn-ghost text-sm text-electric-400 hover:text-electric-300">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">{[...Array(2)].map((_, i) => <SkeletonCard key={i} />)}</div>
        ) : recentSessions.length === 0 ? (
          <div className="card text-center py-10">
            <Calendar className="w-9 h-9 text-obsidian-600 mx-auto mb-3" />
            <p className="text-slate-500 text-sm mb-4">No sessions yet. Book your first one!</p>
            <Link to="/student/mentors" className="btn-primary text-sm">
              Browse Mentors <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentSessions.map((s) => (
              <div key={s._id} className="card flex items-center gap-4 hover:border-obsidian-600 transition-all">
                <Avatar name={s.mentor?.name} avatar={s.mentor?.avatar} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-display font-semibold text-white truncate">{s.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    with {s.mentor?.name} · {formatDateTime(s.scheduledAt)}
                  </p>
                </div>
                <span className={`badge flex-shrink-0 ${getStatusColor(s.status)}`}>{s.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
