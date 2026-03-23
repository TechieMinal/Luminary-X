import { useState, useEffect } from 'react';
import { Save, Plus, X, Linkedin, Globe } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { getMyProfileApi, updateMentorProfileApi } from '../../api/mentors';
import { updateProfileApi } from '../../api/auth';
import { SkeletonCard } from '../../components/common/Spinner';
import Spinner from '../../components/common/Spinner';
import Avatar from '../../components/common/Avatar';
import toast from 'react-hot-toast';

export default function MentorProfile() {
  const { user, updateUser } = useAuthStore();
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [newTag, setNewTag]     = useState('');

  const [userForm, setUserForm] = useState({ name: '', bio: '', avatar: '' });
  const [mentorForm, setMentorForm] = useState({
    currentRole: '', company: '', yearsOfExperience: 0,
    linkedIn: '', website: '', availableSlots: 3, sessionRate: 0, expertise: [],
  });

  useEffect(() => {
    if (!user) return;
    setUserForm({ name: user.name || '', bio: user.bio || '', avatar: user.avatar || '' });
    getMyProfileApi()
      .then((res) => {
        const p = res.data.data;
        setMentorForm({
          currentRole:       p.currentRole       || '',
          company:           p.company           || '',
          yearsOfExperience: p.yearsOfExperience || 0,
          linkedIn:          p.linkedIn          || '',
          website:           p.website           || '',
          availableSlots:    p.availableSlots    ?? 3,
          sessionRate:       p.sessionRate       || 0,
          expertise:         p.expertise         || [],
        });
      })
      .catch(() => toast.error('Could not load mentor profile'))
      .finally(() => setLoading(false));
  }, [user]);

  const addTag = () => {
    const tag = newTag.trim();
    if (!tag || mentorForm.expertise.includes(tag)) return;
    setMentorForm((p) => ({ ...p, expertise: [...p.expertise, tag] }));
    setNewTag('');
  };

  const removeTag = (tag) =>
    setMentorForm((p) => ({ ...p, expertise: p.expertise.filter((e) => e !== tag) }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const [uRes] = await Promise.all([
        updateProfileApi(userForm),
        updateMentorProfileApi(mentorForm),
      ]);
      updateUser(uRes.data.data.user);
      toast.success('Profile saved successfully!');
    } catch { /* shown by interceptor */ }
    finally { setSaving(false); }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="section-title text-2xl">Edit Profile</h1>
        <p className="text-slate-500 text-sm mt-1">Keep your profile updated to attract the right mentees</p>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Basic Info */}
        <div className="card space-y-4">
          <h2 className="font-display font-bold text-white">Basic Information</h2>
          <div className="flex items-center gap-4">
            <Avatar name={userForm.name} avatar={userForm.avatar} size="xl" />
            <div className="flex-1">
              <label className="label">Avatar URL</label>
              <input type="url" className="input-field" placeholder="https://…"
                value={userForm.avatar}
                onChange={(e) => setUserForm({ ...userForm, avatar: e.target.value })} />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Full name</label>
              <input type="text" className="input-field" value={userForm.name}
                onChange={(e) => setUserForm({ ...userForm, name: e.target.value })} required />
            </div>
            <div>
              <label className="label">Current Role</label>
              <input type="text" className="input-field" placeholder="Senior Engineer"
                value={mentorForm.currentRole}
                onChange={(e) => setMentorForm({ ...mentorForm, currentRole: e.target.value })} />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Company</label>
              <input type="text" className="input-field" placeholder="Google, Stripe…"
                value={mentorForm.company}
                onChange={(e) => setMentorForm({ ...mentorForm, company: e.target.value })} />
            </div>
            <div>
              <label className="label">Years of Experience</label>
              <input type="number" min={0} max={60} className="input-field"
                value={mentorForm.yearsOfExperience}
                onChange={(e) => setMentorForm({ ...mentorForm, yearsOfExperience: parseInt(e.target.value) || 0 })} />
            </div>
          </div>
          <div>
            <label className="label">Bio</label>
            <textarea className="input-field resize-none" rows={3}
              placeholder="Tell mentees about your background and what you can help with…"
              value={userForm.bio}
              onChange={(e) => setUserForm({ ...userForm, bio: e.target.value })} />
          </div>
        </div>

        {/* Expertise */}
        <div className="card space-y-4">
          <h2 className="font-display font-bold text-white">Areas of Expertise</h2>
          <div className="flex gap-2">
            <input type="text" className="input-field flex-1"
              placeholder="e.g. System Design, React, Career Growth…"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }} />
            <button type="button" onClick={addTag} className="btn-secondary px-3">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          {mentorForm.expertise.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {mentorForm.expertise.map((tag) => (
                <span key={tag} className="badge badge-electric flex items-center gap-1.5">
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)}
                    className="hover:text-white transition-colors ml-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Availability & Links */}
        <div className="card space-y-4">
          <h2 className="font-display font-bold text-white">Availability & Links</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Available Slots</label>
              <input type="number" min={0} max={20} className="input-field"
                value={mentorForm.availableSlots}
                onChange={(e) => setMentorForm({ ...mentorForm, availableSlots: parseInt(e.target.value) || 0 })} />
              <p className="text-xs text-slate-600 mt-1">How many mentees can you take on?</p>
            </div>
            <div>
              <label className="label">Session Rate (USD/hr)</label>
              <input type="number" min={0} className="input-field" placeholder="0 for free"
                value={mentorForm.sessionRate}
                onChange={(e) => setMentorForm({ ...mentorForm, sessionRate: parseInt(e.target.value) || 0 })} />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label flex items-center gap-1.5">
                <Linkedin className="w-3.5 h-3.5" />LinkedIn
              </label>
              <input type="url" className="input-field" placeholder="https://linkedin.com/in/…"
                value={mentorForm.linkedIn}
                onChange={(e) => setMentorForm({ ...mentorForm, linkedIn: e.target.value })} />
            </div>
            <div>
              <label className="label flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" />Website
              </label>
              <input type="url" className="input-field" placeholder="https://yoursite.com"
                value={mentorForm.website}
                onChange={(e) => setMentorForm({ ...mentorForm, website: e.target.value })} />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? <Spinner size="sm" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving…' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}
