import { useState, useEffect } from 'react';
import { Plus, Trash2, BookOpen, Star, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { getMySkillsApi, addSkillApi, deleteSkillApi } from '../../api/skills';
import Modal from '../../components/common/Modal';
import EmptyState from '../../components/common/EmptyState';
import { SkeletonCard } from '../../components/common/Spinner';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { getProficiencyColor, capitalize } from '../../utils/helpers';

const CATEGORIES   = ['technical', 'soft', 'language', 'tool', 'other'];
const PROFICIENCIES = ['beginner', 'intermediate', 'advanced', 'expert'];

export default function Skills() {
  const [skills, setSkills]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [modalOpen, setModalOpen]   = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting]     = useState(false);
  const [saving, setSaving]         = useState(false);
  const [form, setForm]             = useState({ name: '', category: 'technical', proficiency: 'beginner' });

  const load = () => getMySkillsApi().then((r) => setSkills(r.data.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await addSkillApi(form);
      setSkills((prev) => [res.data.data, ...prev]);
      toast.success('Skill added!');
      setModalOpen(false);
      setForm({ name: '', category: 'technical', proficiency: 'beginner' });
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteSkillApi(deleteTarget._id);
      setSkills((prev) => prev.filter((s) => s._id !== deleteTarget._id));
      toast.success('Skill removed');
      setDeleteTarget(null);
    } finally { setDeleting(false); }
  };

  const grouped = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = skills.filter((s) => s.category === cat);
    return acc;
  }, {});

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title text-2xl">My Skills</h1>
          <p className="text-slate-500 text-sm mt-1">{skills.length} skill{skills.length !== 1 ? 's' : ''} · Build your professional profile</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary text-sm">
          <Plus className="w-4 h-4" /> Add Skill
        </button>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 gap-4">{[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}</div>
      ) : skills.length === 0 ? (
        <EmptyState icon={BookOpen} title="No skills yet"
          description="Add your first skill to start building your professional profile."
          action={<button onClick={() => setModalOpen(true)} className="btn-primary text-sm"><Plus className="w-4 h-4" />Add Skill</button>} />
      ) : (
        <div className="space-y-6">
          {CATEGORIES.filter((c) => grouped[c].length > 0).map((cat) => (
            <div key={cat}>
              <p className="text-xs font-display font-semibold text-slate-500 uppercase tracking-wider mb-3 px-1">{capitalize(cat)}</p>
              <div className="grid sm:grid-cols-2 gap-3">
                {grouped[cat].map((skill) => (
                  <div key={skill._id} className="card flex items-center gap-3 group hover:border-obsidian-600 transition-all">
                    <div className="w-9 h-9 rounded-xl bg-electric-500/10 border border-electric-500/20 flex items-center justify-center flex-shrink-0">
                      <Star className="w-4 h-4 text-electric-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-display font-semibold text-white truncate">{skill.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`badge text-[10px] ${getProficiencyColor(skill.proficiency)}`}>
                          {skill.proficiency}
                        </span>
                        {skill.endorsements?.length > 0 && (
                          <span className="text-xs text-slate-500">{skill.endorsements.length} endorsement{skill.endorsements.length !== 1 ? 's' : ''}</span>
                        )}
                      </div>
                    </div>
                    <button onClick={() => setDeleteTarget(skill)}
                      className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg flex items-center justify-center text-rose-400 hover:bg-rose-500/10 transition-all">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add New Skill">
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="label">Skill name</label>
            <input type="text" className="input-field" placeholder="e.g. React, Python, Leadership…"
              value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Category</label>
              <select className="input-field" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map((c) => <option key={c} value={c} className="bg-obsidian-800">{capitalize(c)}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Proficiency</label>
              <select className="input-field" value={form.proficiency} onChange={(e) => setForm({ ...form, proficiency: e.target.value })}>
                {PROFICIENCIES.map((p) => <option key={p} value={p} className="bg-obsidian-800">{capitalize(p)}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-1">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Adding…' : 'Add Skill'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="Remove Skill" message={`Remove "${deleteTarget?.name}" from your profile?`}
        confirmLabel="Remove" isLoading={deleting} />
    </div>
  );
}
