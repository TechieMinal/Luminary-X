import { Link } from 'react-router-dom';
import { Zap, ArrowLeft } from 'lucide-react';
import useAuthStore from '../store/authStore';

export default function NotFound() {
  const { user } = useAuthStore();
  const home = user ? `/${user.role}/dashboard` : '/';
  return (
    <div className="min-h-screen bg-obsidian-950 flex items-center justify-center p-4">
      <div className="text-center animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-electric-500 flex items-center justify-center mx-auto mb-6">
          <Zap className="w-8 h-8 text-white" />
        </div>
        <p className="font-mono text-electric-400 text-sm mb-2">404</p>
        <h1 className="font-display font-bold text-4xl text-white mb-3">Page not found</h1>
        <p className="text-slate-500 text-sm mb-8 max-w-xs mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to={home} className="btn-primary">
          <ArrowLeft className="w-4 h-4" /> Back to {user ? 'Dashboard' : 'Home'}
        </Link>
      </div>
    </div>
  );
}
