import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, Code2, Users, MessageSquare,
  Calendar, LogOut, Menu, X, Bell, ChevronDown, Settings,
  Shield, UserCheck, BarChart3, Zap, Home
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import useMessageStore from '../store/messageStore';
import { useSocket } from '../hooks/useSocket';
import Avatar from '../components/common/Avatar';

const navConfig = {
  student: [
    { to: '/student/dashboard', label: 'Dashboard',    icon: LayoutDashboard },
    { to: '/student/skills',    label: 'My Skills',    icon: BookOpen },
    { to: '/student/projects',  label: 'Projects',     icon: Code2 },
    { to: '/student/mentors',   label: 'Find Mentors', icon: Users },
    { to: '/student/sessions',  label: 'Sessions',     icon: Calendar },
    { to: '/student/messages',  label: 'Messages',     icon: MessageSquare, badge: true },
  ],
  mentor: [
    { to: '/mentor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/mentor/mentees',   label: 'My Mentees', icon: UserCheck },
    { to: '/mentor/sessions',  label: 'Sessions',   icon: Calendar },
    { to: '/mentor/messages',  label: 'Messages',   icon: MessageSquare, badge: true },
    { to: '/mentor/profile',   label: 'Profile',    icon: Settings },
  ],
  admin: [
    { to: '/admin/dashboard',  label: 'Dashboard', icon: BarChart3 },
    { to: '/admin/users',      label: 'Users',     icon: Users },
    { to: '/admin/approvals',  label: 'Approvals', icon: UserCheck },
  ],
};

const roleColor = { student: 'badge-electric', mentor: 'badge-aurora', admin: 'badge-amber' };
const roleLabel = { student: 'Student', mentor: 'Mentor', admin: 'Administrator' };

export default function AppLayout() {
  const { user, logout } = useAuthStore();
  const { unreadCount, fetchUnreadCount } = useMessageStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // Initialize socket connection for this session
  useSocket();

  const nav = navConfig[user?.role] || [];

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-obsidian-950 overflow-hidden">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-60 bg-obsidian-900 border-r border-obsidian-700 flex flex-col transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:z-auto`}>

        {/* Logo */}
        <div className="h-14 flex items-center px-5 border-b border-obsidian-700 flex-shrink-0 gap-3">
          <div className="w-7 h-7 rounded-lg bg-electric-500 flex items-center justify-center flex-shrink-0">
            <Zap className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-display font-bold text-white text-base tracking-tight">Luminary X</span>
          <button onClick={() => setSidebarOpen(false)} className="ml-auto btn-ghost p-1 lg:hidden">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Role badge */}
        <div className="px-4 pt-3 pb-1">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-obsidian-800/60 border border-obsidian-700/50">
            <Shield className="w-3 h-3 text-slate-500" />
            <span className={`badge text-[10px] py-0.5 ${roleColor[user?.role]}`}>
              {roleLabel[user?.role]}
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto no-scrollbar">
          {nav.map(({ to, label, icon: Icon, badge }) => (
            <NavLink key={to} to={to} onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-display font-medium transition-all duration-150
                ${isActive
                  ? 'bg-electric-500/15 text-electric-400 border border-electric-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-obsidian-800'}`
              }>
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{label}</span>
              {badge && unreadCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-electric-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom: back to home + user */}
        <div className="p-3 border-t border-obsidian-700 space-y-1">
          <Link to="/" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-obsidian-800 transition-colors text-sm font-display">
            <Home className="w-4 h-4" /> Home
          </Link>

          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-obsidian-800 transition-colors cursor-pointer"
            onClick={() => setProfileOpen(!profileOpen)}>
            <Avatar name={user?.name} avatar={user?.avatar} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-display font-semibold text-white truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
          </div>
          {profileOpen && (
            <button onClick={handleLogout}
              className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-rose-400 hover:bg-rose-500/10 transition-colors font-display">
              <LogOut className="w-4 h-4" />Logout
            </button>
          )}
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-14 bg-obsidian-900/90 backdrop-blur border-b border-obsidian-700 flex items-center px-4 gap-4 flex-shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="btn-ghost p-2 lg:hidden">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <div className="relative">
              <button className="btn-ghost p-2 relative">
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-electric-500" />
                )}
              </button>
            </div>
            <Avatar name={user?.name} avatar={user?.avatar} size="sm" />
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-6 animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
