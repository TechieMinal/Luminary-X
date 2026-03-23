import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Zap, ArrowRight, User, Briefcase, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import Spinner from '../../components/common/Spinner';

const DEMO_ACCOUNTS = [
  { role: 'student', email: 'student@demo.com', password: 'Demo@12345', icon: User,     label: 'Student',  color: 'electric' },
  { role: 'mentor',  email: 'mentor@demo.com',  password: 'Demo@12345', icon: Briefcase,label: 'Mentor',   color: 'aurora' },
  { role: 'admin',   email: 'admin@luminaryx.com', password: 'Admin@123456', icon: Shield, label: 'Admin', color: 'amber' },
];

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(null);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      navigate(`/${user.role}/dashboard`);
    } catch { /* shown by interceptor */ }
    finally { setLoading(false); }
  };

  const handleDemo = async (account) => {
    setDemoLoading(account.role);
    setForm({ email: account.email, password: account.password });
    try {
      const user = await login({ email: account.email, password: account.password });
      toast.success(`Demo: logged in as ${account.label}`);
      navigate(`/${user.role}/dashboard`);
    } catch {
      toast.error('Demo account not found. Run: npm run seed in backend.');
    } finally { setDemoLoading(null); }
  };

  const colorMap = {
    electric: 'border-electric-500/30 hover:border-electric-500/60 bg-electric-500/5 hover:bg-electric-500/10 text-electric-400',
    aurora:   'border-aurora-500/30  hover:border-aurora-500/60  bg-aurora-500/5  hover:bg-aurora-500/10  text-aurora-400',
    amber:    'border-amber-500/30   hover:border-amber-500/60   bg-amber-500/5   hover:bg-amber-500/10   text-amber-400',
  };

  return (
    <div className="min-h-screen bg-obsidian-950 flex items-center justify-center">
      {/* Left panel - decorative */}
      {/* <div className="hidden lg:flex lg:w-1/2 relative bg-obsidian-900 border-r border-obsidian-700 flex-col items-center justify-center p-12">
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'linear-gradient(rgba(99,102,241,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.5) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-electric-500/10 rounded-full blur-[80px]" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-aurora-500/8 rounded-full blur-[60px]" />

        <div className="relative text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-electric-500 flex items-center justify-center mx-auto mb-6">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-display font-bold text-3xl text-white mb-4">Luminary X</h1>
          <p className="text-slate-400 leading-relaxed">
            Your career, guided by the best in the industry. Connect with expert mentors and unlock your potential.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-3">
            {[
              { v: '2,400+', l: 'Active Users' },
              { v: '180+',   l: 'Expert Mentors' },
              { v: '8,900+', l: 'Sessions Done' },
              { v: '4.9★',   l: 'Rating' },
            ].map(({ v, l }) => (
              <div key={l} className="bg-obsidian-800 border border-obsidian-700 rounded-xl p-3 text-center">
                <p className="font-display font-bold text-white text-lg">{v}</p>
                <p className="text-slate-500 text-xs mt-0.5">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </div> */}

      {/* Right panel - form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-md animate-slide-up">
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-electric-500 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-white text-lg">Luminary X</span>
          </div>

          <h2 className="font-display font-bold text-2xl text-white mb-1">Welcome back</h2>
          <p className="text-slate-400 text-sm mb-8">Sign in to continue your journey</p>

          {/* Demo Login Buttons */}
          <div className="mb-6">
            <p className="text-xs font-display font-semibold text-slate-500 uppercase tracking-wider mb-3">
              ⚡ Quick demo access
            </p>
            <div className="grid grid-cols-3 gap-2">
              {DEMO_ACCOUNTS.map((acc) => {
                const Icon = acc.icon;
                return (
                  <button key={acc.role} onClick={() => handleDemo(acc)} disabled={!!demoLoading}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all duration-200 ${colorMap[acc.color]}`}>
                    {demoLoading === acc.role
                      ? <Spinner size="sm" />
                      : <Icon className="w-4 h-4" />}
                    <span className="text-xs font-display font-semibold">{acc.label}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-600 text-center mt-2">
              One click — no friction. Logs in as that role instantly.
            </p>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-obsidian-700" />
            <span className="text-slate-600 text-xs font-display">or sign in with email</span>
            <div className="flex-1 h-px bg-obsidian-700" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email address</label>
              <input type="email" className="input-field" placeholder="you@example.com"
                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} className="input-field pr-11"
                  placeholder="Your password"
                  value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
              {loading ? <Spinner size="sm" /> : <><span>Sign in</span><ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-electric-400 hover:text-electric-300 font-display font-semibold transition-colors">
              Create one free
            </Link>
          </p>

          <Link to="/" className="flex items-center justify-center gap-1.5 mt-6 text-slate-600 hover:text-slate-400 text-xs transition-colors">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
