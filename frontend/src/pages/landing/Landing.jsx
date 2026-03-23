import { Link } from 'react-router-dom';
import {
  Zap, ArrowRight, Star, Users, BookOpen, Calendar,
  MessageSquare, Code2, Shield, ChevronRight, CheckCircle,
  TrendingUp, Award, Globe, Linkedin, Github
} from 'lucide-react';

const STATS = [
  { value: '2,400+', label: 'Active Users' },
  { value: '180+',   label: 'Expert Mentors' },
  { value: '8,900+', label: 'Sessions Completed' },
  { value: '4.9★',   label: 'Average Rating' },
];

const FEATURES = [
  {
    icon: Users,
    color: 'electric',
    title: 'Expert Mentor Network',
    desc: 'Connect with senior engineers, PMs, and founders from top companies ready to guide your growth.',
  },
  {
    icon: Calendar,
    color: 'aurora',
    title: '1:1 Session Booking',
    desc: 'Schedule sessions with conflict detection. Mentors confirm, add meeting links, and share notes.',
  },
  {
    icon: MessageSquare,
    color: 'amber',
    title: 'Real-Time Messaging',
    desc: 'Chat directly with mentors and mentees. See who\'s online. Full conversation history.',
  },
  {
    icon: Code2,
    color: 'rose',
    title: 'Project Portfolio',
    desc: 'Showcase your projects with GitHub links, live URLs, and tech stacks to stand out.',
  },
  {
    icon: BookOpen,
    color: 'electric',
    title: 'Skills Tracking',
    desc: 'Build a verified skill profile with proficiency levels and peer endorsements.',
  },
  {
    icon: Shield,
    color: 'aurora',
    title: 'Curated Community',
    desc: 'Every mentor is manually reviewed and approved by admins. Quality guaranteed.',
  },
];

const STEPS = [
  { step: '01', title: 'Create your profile', desc: 'Sign up as a student or mentor. Add your skills, bio, and what you\'re looking for.' },
  { step: '02', title: 'Find your mentor', desc: 'Browse verified mentors by expertise, company, or experience level.' },
  { step: '03', title: 'Book a session', desc: 'Request a 1:1 session. Mentors confirm with meeting links and agenda.' },
  { step: '04', title: 'Grow your career', desc: 'Get feedback, expand your skills, and build lasting professional relationships.' },
];

const TESTIMONIALS = [
  {
    name: 'Priya Sharma',
    role: 'SDE-2 at Amazon',
    avatar: 'PS',
    text: 'Luminary X connected me with a principal engineer who helped me crack my system design interviews. Landed my dream role in 3 months.',
    rating: 5,
  },
  {
    name: 'James Okoye',
    role: 'Frontend Lead at Vercel',
    avatar: 'JO',
    text: 'As a mentor, the platform is incredibly well-built. Managing sessions, messaging mentees, and tracking progress is seamless.',
    rating: 5,
  },
  {
    name: 'Maria González',
    role: 'PM at Notion',
    avatar: 'MG',
    text: 'The structured mentorship process and skill tracking helped me transition from engineering to product management in 6 months.',
    rating: 5,
  },
];

const ROLES = [
  {
    role: 'Student',
    icon: BookOpen,
    color: 'electric',
    desc: 'Accelerate your career with expert guidance',
    features: ['Find & book 1:1 mentors', 'Build skill portfolio', 'Showcase projects', 'Real-time messaging', 'Session history & notes'],
    cta: 'Start learning free',
    link: '/register',
  },
  {
    role: 'Mentor',
    icon: Award,
    color: 'aurora',
    desc: 'Share your expertise. Shape careers.',
    features: ['Manage your mentee roster', 'Control availability slots', 'Session scheduling tools', 'Review & rating system', 'Build mentor profile'],
    cta: 'Become a mentor',
    link: '/register',
    highlight: true,
  },
  {
    role: 'Admin',
    icon: Shield,
    color: 'amber',
    desc: 'Full platform control & analytics',
    features: ['Platform analytics dashboard', 'User management tools', 'Mentor approval workflow', 'Growth visualizations', 'Seed via CLI only'],
    cta: 'View demo',
    link: '/login',
  },
];

function GlowOrb({ className }) {
  return (
    <div className={`absolute rounded-full blur-[120px] pointer-events-none ${className}`} />
  );
}

function InitialAvatar({ initials, color }) {
  const colors = {
    electric: 'bg-electric-500/20 text-electric-400 border-electric-500/30',
    aurora:   'bg-aurora-500/20  text-aurora-400  border-aurora-500/30',
    amber:    'bg-amber-500/20   text-amber-400   border-amber-500/30',
    rose:     'bg-rose-500/20    text-rose-400    border-rose-500/30',
  };
  return (
    <div className={`w-12 h-12 rounded-full border flex items-center justify-center font-display font-bold text-sm ${colors[color] || colors.electric}`}>
      {initials}
    </div>
  );
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-obsidian-950 text-slate-200 overflow-x-hidden">

      {/* ── Navbar ───────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 glass-strong border-b border-obsidian-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-electric-500 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-white text-lg tracking-tight">Luminary X</span>
          </div>
          <div className="hidden md:flex items-center gap-1">
            {['Features','How it Works','Roles'].map((item) => (
              <a key={item} href={`#${item.toLowerCase().replace(/ /g,'-')}`}
                className="text-sm text-slate-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-obsidian-800 transition-all font-display font-medium">
                {item}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="btn-ghost text-sm">Sign in</Link>
            <Link to="/register" className="btn-primary text-sm py-2 px-4">
              Get started <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────── */}
      <section className="relative pt-32 pb-24 md:pt-44 md:pb-32 overflow-hidden">
      {/* <section className="relative pt-24 pb-16 md:pt-32 md:pb-20 overflow-hidden"> */}
        <GlowOrb className="w-[600px] h-[600px] bg-electric-500/10 -top-40 -right-40" />
        <GlowOrb className="w-[400px] h-[400px] bg-aurora-500/8  bottom-0 -left-20" />

        {/* Grid bg */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(rgba(99,102,241,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.5) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 text-center">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 bg-electric-500/10 border border-electric-500/20 rounded-full px-4 py-1.5 mb-8">
            <span className="glow-dot" />
            <span className="text-electric-400 text-xs font-display font-semibold tracking-wide uppercase">
            Built for real-world mentorship experiences
            </span> 
          </div>
          

          <h1 className="landing-heading mb-6 max-w-4xl mx-auto text-balance">
            Your career,{' '}
            <span className="gradient-text">guided by the best</span>{' '}
            in the industry
          </h1>

          <p className="landing-body max-w-2xl mx-auto mb-10">
            Luminary X connects ambitious professionals with senior engineers, PMs, and founders
            for 1:1 mentorship, skill development, and real career breakthroughs.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <Link to="/register" className="btn-primary-lg">
              Start for free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/login" className="btn-secondary py-3.5 px-7 text-base rounded-xl">
              View live demo
            </Link>
          </div>

          {/* Stats */}
         {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {STATS.map(({ value, label }) => (
              <div key={label} className="bg-obsidian-900/80 border border-obsidian-700 rounded-xl p-4">
                <p className="font-display font-bold text-2xl text-white">{value}</p>
                <p className="text-slate-500 text-xs mt-0.5 font-display font-medium">{label}</p>
              </div>
            ))}
          </div>*/}
        </div>
      </section>

      {/* ── Features ─────────────────────────────── */}
      <section id="features" className="landing-section border-t border-obsidian-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <p className="text-electric-400 font-display font-semibold text-sm uppercase tracking-wider mb-3">Everything you need</p>
            <h2 className="landing-subheading mb-4">Built for serious career growth</h2>
            <p className="landing-body max-w-xl mx-auto">
              Every feature connects to a real backend. No mock data. No fake metrics.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(({ icon: Icon, color, title, desc }) => {
              const iconColors = {
                electric: 'bg-electric-500/15 text-electric-400',
                aurora:   'bg-aurora-500/15  text-aurora-400',
                amber:    'bg-amber-500/15   text-amber-400',
                rose:     'bg-rose-500/15    text-rose-400',
              };
              return (
                <div key={title} className="feature-card group">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${iconColors[color]} transition-transform group-hover:scale-110 duration-300`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-display font-bold text-white text-base mb-2">{title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────── */}
      <section id="how-it-works" className="landing-section border-t border-obsidian-800 bg-obsidian-900/40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <p className="text-aurora-400 font-display font-semibold text-sm uppercase tracking-wider mb-3">Simple process</p>
            <h2 className="landing-subheading mb-4">From signup to breakthrough in 4 steps</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {STEPS.map(({ step, title, desc }, i) => (
              <div key={step} className="flex gap-5 p-6 bg-obsidian-900 border border-obsidian-700 rounded-2xl hover:border-obsidian-600 transition-all duration-300"
                style={{ animationDelay: `${i * 100}ms` }}>
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-electric-500/10 border border-electric-500/20 flex items-center justify-center">
                  <span className="font-display font-bold text-electric-400 text-sm">{step}</span>
                </div>
                <div>
                  <h3 className="font-display font-bold text-white mb-1.5">{title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Role Explanation ──────────────────────── */}
      <section id="roles" className="landing-section border-t border-obsidian-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <p className="text-amber-400 font-display font-semibold text-sm uppercase tracking-wider mb-3">Choose your path</p>
            <h2 className="landing-subheading">Built for every role</h2>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {ROLES.map(({ role, icon: Icon, color, desc, features, cta, link, highlight }) => {
              const accent = { electric:'border-electric-500/40 shadow-electric-500/10', aurora:'border-aurora-500/50 shadow-aurora-500/10', amber:'border-amber-500/40 shadow-amber-500/10' }[color];
              const iconBg  = { electric:'bg-electric-500/15 text-electric-400', aurora:'bg-aurora-500/15 text-aurora-400', amber:'bg-amber-500/15 text-amber-400' }[color];
              const btnClass = highlight ? 'btn-primary w-full py-3 rounded-xl' : 'btn-secondary w-full py-3 rounded-xl';
              return (
                <div key={role}
                  className={`bg-obsidian-900 border rounded-2xl p-6 flex flex-col transition-all duration-300 ${highlight ? `${accent} shadow-lg` : 'border-obsidian-700 hover:border-obsidian-600'}`}>
                  {highlight && (
                    <div className="inline-flex self-start items-center gap-1 bg-aurora-500/15 text-aurora-400 border border-aurora-500/20 rounded-full px-3 py-1 text-xs font-display font-semibold mb-4">
                      ✦ Most Popular
                    </div>
                  )}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${iconBg}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-display font-bold text-white text-xl mb-1">{role}</h3>
                  <p className="text-slate-400 text-sm mb-5">{desc}</p>
                  <ul className="space-y-2.5 flex-1 mb-6">
                    {features.map((f) => (
                      <li key={f} className="flex items-center gap-2.5 text-sm text-slate-300">
                        <CheckCircle className="w-4 h-4 text-aurora-400 flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link to={link} className={btnClass}>
                    {cta} <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────── */}
      <section className="landing-section border-t border-obsidian-800 bg-obsidian-900/40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <p className="text-electric-400 font-display font-semibold text-sm uppercase tracking-wider mb-3">Social proof</p>
            <h2 className="landing-subheading">What our community says</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(({ name, role, avatar, text, rating }) => (
              <div key={name} className="bg-obsidian-900 border border-obsidian-700 rounded-2xl p-6 hover:border-obsidian-600 transition-all duration-300">
                <div className="flex gap-0.5 mb-4">
                  {[...Array(rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed mb-5">"{text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-electric-500/20 border border-electric-500/30 flex items-center justify-center font-display font-bold text-xs text-electric-400">
                    {avatar}
                  </div>
                  <div>
                    <p className="text-white font-display font-semibold text-sm">{name}</p>
                    <p className="text-slate-500 text-xs">{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────── */}
      <section className="landing-section border-t border-obsidian-800 relative overflow-hidden">
        <GlowOrb className="w-[500px] h-[500px] bg-electric-500/8 -top-20 left-1/2 -translate-x-1/2" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-aurora-500/10 border border-aurora-500/20 rounded-full px-4 py-1.5 mb-8">
            <TrendingUp className="w-3.5 h-3.5 text-aurora-400" />
            <span className="text-aurora-400 text-xs font-display font-semibold">Free to get started</span>
          </div>
          <h2 className="font-display font-bold text-4xl md:text-5xl text-white mb-6 leading-tight">
            Ready to accelerate<br />
            <span className="gradient-text">your career?</span>
          </h2>
          <p className="landing-body mb-10">
            Join 2,400+ professionals already growing with Luminary X.
            Connect with expert mentors and start your journey today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="btn-primary-lg">
              Create free account <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/login" className="btn-secondary py-3.5 px-7 text-base rounded-xl">
              Try demo login
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────── */}
      <footer className="border-t border-obsidian-800 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-electric-500 flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-display font-bold text-white">Luminary X</span>
              <span className="text-slate-600 text-sm ml-2">Career Mentorship Platform</span>
            </div>

            <div className="flex items-center gap-6">
              {[
                { to: '/login',    label: 'Login' },
                { to: '/register', label: 'Register' },
              ].map(({ to, label }) => (
                <Link key={to} to={to} className="text-slate-500 hover:text-white text-sm font-display transition-colors">{label}</Link>
              ))}
              <a href="https://github.com" target="_blank" rel="noopener noreferrer"
                className="text-slate-500 hover:text-white transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"
                className="text-slate-500 hover:text-white transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-obsidian-800 flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-slate-600 text-xs">
              © {new Date().getFullYear()} Luminary X. Built with React, Node.js & MongoDB.
            </p>
            <p className="text-slate-700 text-xs">
              Demo: student@demo.com · mentor@demo.com · admin@luminaryx.com / Demo@12345
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
