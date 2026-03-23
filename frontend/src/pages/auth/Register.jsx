import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Zap, GraduationCap, Briefcase, ArrowRight, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import Spinner from '../../components/common/Spinner';

export default function Register() {
  const [form, setForm]     = useState({ name: '', email: '', password: '', role: 'student' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const { register } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await register(form);
      if (result?.requiresApproval) {
        toast.success('Account created! Awaiting admin approval before you can log in.', { duration: 6000 });
        navigate('/login');
        return;
      }
      toast.success(`Welcome to Luminary X, ${result.name.split(' ')[0]}!`);
      navigate('/student/dashboard');
    } catch { /* shown by interceptor */ }
    finally { setLoading(false); }
  };

  const roles = [
    { value: 'student', label: 'Student', desc: 'Learn & grow',       icon: GraduationCap },
    { value: 'mentor',  label: 'Mentor',  desc: 'Share expertise',     icon: Briefcase },
  ];

  const checks = [
    { label: '8+ characters',    ok: form.password.length >= 8 },
    { label: 'Uppercase letter', ok: /[A-Z]/.test(form.password) },
    { label: 'Lowercase letter', ok: /[a-z]/.test(form.password) },
    { label: 'Number',           ok: /\d/.test(form.password) },
  ];

  return (
    <div className="min-h-screen bg-obsidian-950 flex items-center justify-center p-4">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-electric-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md animate-slide-up">
        <Link to="/" className="flex items-center gap-2.5 mb-8">
          <div className="w-8 h-8 rounded-lg bg-electric-500 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-white text-lg">Luminary X</span>
        </Link>

        <div className="card-glow">
          <h1 className="font-display font-bold text-2xl text-white mb-1">Create your account</h1>
          <p className="text-slate-400 text-sm mb-6">Join thousands accelerating their careers</p>

          <div className="grid grid-cols-2 gap-3 mb-6">
            {roles.map(({ value, label, desc, icon: Icon }) => (
              <button key={value} type="button" onClick={() => setForm({ ...form, role: value })}
                className={`flex flex-col items-start p-3.5 rounded-xl border text-left transition-all duration-150
                  ${form.role === value
                    ? 'border-electric-500/60 bg-electric-500/8'
                    : 'border-obsidian-600 hover:border-obsidian-500 bg-obsidian-800/30'}`}>
                <Icon className={`w-5 h-5 mb-2 ${form.role === value ? 'text-electric-400' : 'text-slate-500'}`} />
                <p className={`text-sm font-display font-semibold ${form.role === value ? 'text-white' : 'text-slate-400'}`}>{label}</p>
                <p className="text-xs text-slate-600 mt-0.5">{desc}</p>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full name</label>
              <input type="text" className="input-field" placeholder="Alex Johnson"
                value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label className="label">Email address</label>
              <input type="email" className="input-field" placeholder="you@example.com"
                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} className="input-field pr-11"
                  placeholder="Create a strong password"
                  value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {form.password && (
                <div className="mt-2 grid grid-cols-2 gap-1">
                  {checks.map(({ label, ok }) => (
                    <div key={label} className={`flex items-center gap-1.5 text-xs transition-colors ${ok ? 'text-aurora-400' : 'text-slate-600'}`}>
                      <Check className="w-3 h-3 flex-shrink-0" />{label}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {form.role === 'mentor' && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <p className="text-xs text-amber-400">Mentor accounts require admin approval before you can log in.</p>
              </div>
            )}

            <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
              {loading ? <Spinner size="sm" /> : <><span>Create account</span><ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-electric-400 hover:text-electric-300 font-display font-semibold transition-colors">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
