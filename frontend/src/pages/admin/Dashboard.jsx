import { useState, useEffect } from 'react';
import {
  Users, BookOpen, Calendar, MessageSquare, UserCheck,
  TrendingUp, Clock, Star, ArrowUp, ArrowDown, Activity
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { getDashboardStatsApi } from '../../api/admin';
import StatsCard from '../../components/common/StatsCard';
import { SkeletonStat } from '../../components/common/Spinner';
import Avatar from '../../components/common/Avatar';
import { timeAgo } from '../../utils/helpers';

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const CHART_COLORS = {
  electric: '#6366f1',
  aurora:   '#10b981',
  amber:    '#f59e0b',
  rose:     '#f43f5e',
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-obsidian-800 border border-obsidian-600 rounded-xl px-4 py-3 shadow-xl">
      <p className="text-slate-400 text-xs font-display mb-2">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
          <span className="text-white text-sm font-display font-semibold">{entry.value}</span>
          <span className="text-slate-500 text-xs capitalize">{entry.name}</span>
        </div>
      ))}
    </div>
  );
};

function buildChartData(monthlyData = []) {
  const map = {};
  monthlyData.forEach(({ _id, count }) => {
    const key = `${MONTH_NAMES[(_id.month || 1) - 1]} ${_id.year}`;
    if (!map[key]) map[key] = { month: key, student: 0, mentor: 0 };
    map[key][_id.role] = (map[key][_id.role] || 0) + count;
  });
  return Object.values(map).slice(-6);
}

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getDashboardStatsApi()
      .then((res) => setData(res.data.data))
      .catch(() => setError('Failed to load dashboard. Check your connection.'))
      .finally(() => setLoading(false));
  }, []);

  const roleBadge = { student: 'badge-electric', mentor: 'badge-aurora', admin: 'badge-amber' };

  if (error) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="card border-rose-500/20 bg-rose-500/5 text-center py-12">
          <Activity className="w-8 h-8 text-rose-400 mx-auto mb-3" />
          <p className="text-rose-400 font-display font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  const chartData = data ? buildChartData(data.monthlyData) : [];
  const pieData = data ? [
    { name: 'Students', value: data.stats.totalStudents, color: CHART_COLORS.electric },
    { name: 'Mentors',  value: data.stats.totalMentors,  color: CHART_COLORS.aurora },
  ] : [];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-white mb-1">
            Admin <span className="gradient-text">Dashboard</span>
          </h1>
          <p className="text-slate-500 text-sm">Platform-wide analytics and controls</p>
        </div>
        <div className="flex items-center gap-2 bg-obsidian-800 border border-obsidian-700 rounded-xl px-4 py-2">
          <span className="glow-dot" />
          <span className="text-aurora-400 text-xs font-display font-semibold">Live</span>
        </div>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <SkeletonStat key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard label="Total Users"        value={data.stats.totalUsers}           icon={Users}       color="electric" />
          <StatsCard label="Mentors"            value={data.stats.totalMentors}         icon={UserCheck}   color="aurora" />
          <StatsCard label="Students"           value={data.stats.totalStudents}        icon={BookOpen}    color="violet" />
          <StatsCard label="Total Sessions"     value={data.stats.totalSessions}        icon={Calendar}    color="amber" />
          <StatsCard label="Completed Sessions" value={data.stats.completedSessions}    icon={Star}        color="aurora" />
          <StatsCard label="Pending Approvals"  value={data.stats.pendingMentors}       icon={Clock}       color="amber"
            subtitle={data.stats.pendingMentors > 0 ? 'Requires attention' : 'All clear'} />
          <StatsCard label="New This Month"     value={data.stats.newUsersThisMonth}    icon={TrendingUp}  color="electric" />
          <StatsCard label="Messages"           value={data.stats.totalMessages}        icon={MessageSquare} color="violet" />
        </div>
      )}

      {/* Charts Row */}
      {!loading && data && (
        <div className="grid lg:grid-cols-3 gap-5">
          {/* Area chart - user growth */}
          <div className="lg:col-span-2 card">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-display font-bold text-white text-base">User Growth</h2>
                <p className="text-slate-500 text-xs mt-0.5">New registrations over last 6 months</p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-3 h-0.5 rounded-full bg-electric-500 inline-block" />Students
                </span>
                <span className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-3 h-0.5 rounded-full bg-aurora-500 inline-block" />Mentors
                </span>
              </div>
            </div>
            {chartData.length === 0 ? (
              <div className="h-52 flex items-center justify-center text-slate-600 text-sm">
                No growth data available yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorStudent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={CHART_COLORS.electric} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={CHART_COLORS.electric} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorMentor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={CHART_COLORS.aurora} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={CHART_COLORS.aurora} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1c2030" />
                  <XAxis dataKey="month" tick={{ fill: '#475569', fontSize: 11, fontFamily: 'Syne' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#475569', fontSize: 11, fontFamily: 'Syne' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="student" stroke={CHART_COLORS.electric} strokeWidth={2} fill="url(#colorStudent)" name="students" />
                  <Area type="monotone" dataKey="mentor"  stroke={CHART_COLORS.aurora}   strokeWidth={2} fill="url(#colorMentor)"  name="mentors" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Pie chart - user distribution */}
          <div className="card flex flex-col">
            <div className="mb-5">
              <h2 className="font-display font-bold text-white text-base">User Mix</h2>
              <p className="text-slate-500 text-xs mt-0.5">Students vs Mentors</p>
            </div>
            {pieData.every((d) => d.value === 0) ? (
              <div className="flex-1 flex items-center justify-center text-slate-600 text-sm">No data yet</div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center">
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={70}
                      paddingAngle={4} dataKey="value" strokeWidth={0}>
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex gap-6 mt-2">
                  {pieData.map((d) => (
                    <div key={d.name} className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
                      <span className="text-slate-400 text-xs">{d.name}</span>
                      <span className="text-white text-xs font-display font-bold">{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bottom row: Recent Users + Sessions this month bar */}
      {!loading && data && (
        <div className="grid lg:grid-cols-3 gap-5">
          {/* Bar chart - monthly sessions */}
          <div className="card">
            <div className="mb-4">
              <h2 className="font-display font-bold text-white text-base">Sessions This Month</h2>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-display font-bold text-white">{data.stats.newSessionsThisMonth}</span>
                <span className="text-aurora-400 text-sm font-display font-semibold">booked</span>
              </div>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Completed', value: data.stats.completedSessions, color: 'bg-aurora-500', max: data.stats.totalSessions },
                { label: 'This Month', value: data.stats.newSessionsThisMonth, color: 'bg-electric-500', max: data.stats.totalSessions },
                { label: 'Total',     value: data.stats.totalSessions, color: 'bg-obsidian-600', max: data.stats.totalSessions },
              ].map(({ label, value, color, max }) => (
                <div key={label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500 font-display">{label}</span>
                    <span className="text-white font-display font-semibold">{value}</span>
                  </div>
                  <div className="h-1.5 bg-obsidian-800 rounded-full overflow-hidden">
                    <div className={`h-full ${color} rounded-full transition-all duration-700`}
                      style={{ width: max > 0 ? `${Math.min((value/max)*100, 100)}%` : '0%' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Users */}
          <div className="lg:col-span-2 card">
            <h2 className="font-display font-bold text-white text-base mb-4">Recent Registrations</h2>
            <div className="space-y-1">
              {data.recentUsers?.length === 0 && (
                <p className="text-slate-600 text-sm text-center py-4">No users yet</p>
              )}
              {data.recentUsers?.map((u) => (
                <div key={u._id}
                  className="flex items-center gap-3 py-2.5 px-1 border-b border-obsidian-800/60 last:border-0 hover:bg-obsidian-800/30 rounded-lg transition-colors">
                  <Avatar name={u.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-display font-semibold text-white truncate">{u.name}</p>
                    <p className="text-xs text-slate-500 truncate">{u.email}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`badge text-[10px] ${roleBadge[u.role] || 'badge-neutral'}`}>{u.role}</span>
                    {u.role === 'mentor' && !u.isApproved && (
                      <span className="badge badge-amber text-[10px]">pending</span>
                    )}
                    <span className="text-[10px] text-slate-600 hidden sm:block">{timeAgo(u.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
