import { useState, useEffect, useCallback } from 'react';
import { Plus, Github, ExternalLink, Trash2, Code2, Edit2, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { getMyProjectsApi, createProjectApi, updateProjectApi, deleteProjectApi } from '../../api/projects';
import Modal from '../../components/common/Modal';
import EmptyState from '../../components/common/EmptyState';
import { SkeletonCard } from '../../components/common/Spinner';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { getStatusColor, formatDate } from '../../utils/helpers';

const BLANK = { title: '', description: '', techStack: '', githubUrl: '', liveUrl: '', status: 'in-progress', visibility: 'public' };

export default function Projects() {
  const [projects, setProjects]     = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading]       = useState(true);
  const [modalOpen, setModalOpen]   = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm]             = useState(BLANK);
  const [saving, setSaving]         = useState(false);
  const [deleting, setDeleting]     = useState(false);
  const [page, setPage]             = useState(1);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getMyProjectsApi({ page, limit: 9 });
      setProjects(res.data.data);
      setPagination(res.data.pagination);
    } finally { setLoading(false); }
  }, [page]);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const openEdit = (project) => {
    setEditTarget(project);
    setForm({ ...project, techStack: project.techStack?.join(', ') || '' });
    setModalOpen(true);
  };

  const closeModal = () => { setModalOpen(false); setEditTarget(null); setForm(BLANK); };

  const parseTech = (str) => str.split(',').map((t) => t.trim()).filter(Boolean);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, techStack: parseTech(form.techStack) };
    try {
      if (editTarget) {
        const res = await updateProjectApi(editTarget._id, payload);
        setProjects((prev) => prev.map((p) => p._id === editTarget._id ? res.data.data : p));
        toast.success('Project updated');
      } else {
        await createProjectApi(payload);
        toast.success('Project created!');
        fetchProjects();
      }
      closeModal();
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteProjectApi(deleteTarget._id);
      setProjects((prev) => prev.filter((p) => p._id !== deleteTarget._id));
      toast.success('Project deleted');
      setDeleteTarget(null);
    } finally { setDeleting(false); }
  };

  const statusColors = { 'in-progress': 'badge-electric', 'completed': 'badge-aurora', 'paused': 'badge-amber' };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title text-2xl">My Projects</h1>
          <p className="text-slate-500 text-sm mt-1">{pagination.total || 0} projects in your portfolio</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary text-sm">
          <Plus className="w-4 h-4" />New Project
        </button>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : projects.length === 0 ? (
        <EmptyState icon={Code2} title="No projects yet"
          description="Showcase your work by adding your first project."
          action={<button onClick={() => setModalOpen(true)} className="btn-primary text-sm"><Plus className="w-4 h-4" />Add Project</button>} />
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((p) => (
              <div key={p._id} className="card group flex flex-col hover:border-obsidian-600 transition-all duration-200">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-bold text-white text-sm truncate">{p.title}</h3>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className={`badge text-[10px] ${statusColors[p.status] || 'badge-neutral'}`}>
                        {p.status.replace('-', ' ')}
                      </span>
                      {p.visibility === 'private' && (
                        <EyeOff className="w-3 h-3 text-slate-600" />
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                    <button onClick={() => openEdit(p)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-obsidian-700 transition-colors">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setDeleteTarget(p)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-rose-400 hover:bg-rose-500/10 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2 flex-1 leading-relaxed">{p.description}</p>

                {p.techStack?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {p.techStack.slice(0, 4).map((t) => (
                      <span key={t} className="badge badge-neutral text-[10px]">{t}</span>
                    ))}
                    {p.techStack.length > 4 && (
                      <span className="badge badge-neutral text-[10px]">+{p.techStack.length - 4}</span>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-obsidian-700">
                  <span className="text-[10px] text-slate-600">{formatDate(p.createdAt)}</span>
                  <div className="flex gap-1 ml-auto">
                    {p.githubUrl && (
                      <a href={p.githubUrl} target="_blank" rel="noopener noreferrer"
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-obsidian-700 transition-colors">
                        <Github className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {p.liveUrl && (
                      <a href={p.liveUrl} target="_blank" rel="noopener noreferrer"
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-obsidian-700 transition-colors">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {pagination.pages > 1 && (
            <div className="flex justify-center gap-2">
              {[...Array(pagination.pages)].map((_, i) => (
                <button key={i} onClick={() => setPage(i + 1)}
                  className={`w-8 h-8 rounded-lg text-sm font-display font-medium transition-all
                    ${page === i + 1 ? 'bg-electric-500 text-white' : 'btn-secondary'}`}>
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {/* Add/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={closeModal} title={editTarget ? 'Edit Project' : 'New Project'} size="lg">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="label">Project title</label>
            <input type="text" className="input-field" placeholder="My Awesome Project"
              value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input-field resize-none" rows={3}
              placeholder="What does this project do and what problem does it solve?"
              value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          </div>
          <div>
            <label className="label">Tech stack (comma-separated)</label>
            <input type="text" className="input-field" placeholder="React, Node.js, MongoDB, Tailwind"
              value={form.techStack} onChange={(e) => setForm({ ...form, techStack: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">GitHub URL</label>
              <input type="url" className="input-field" placeholder="https://github.com/…"
                value={form.githubUrl} onChange={(e) => setForm({ ...form, githubUrl: e.target.value })} />
            </div>
            <div>
              <label className="label">Live URL</label>
              <input type="url" className="input-field" placeholder="https://…"
                value={form.liveUrl} onChange={(e) => setForm({ ...form, liveUrl: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Status</label>
              <select className="input-field" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="in-progress" className="bg-obsidian-800">In Progress</option>
                <option value="completed"   className="bg-obsidian-800">Completed</option>
                <option value="paused"      className="bg-obsidian-800">Paused</option>
              </select>
            </div>
            <div>
              <label className="label">Visibility</label>
              <select className="input-field" value={form.visibility} onChange={(e) => setForm({ ...form, visibility: e.target.value })}>
                <option value="public"  className="bg-obsidian-800">Public</option>
                <option value="private" className="bg-obsidian-800">Private</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={closeModal} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving…' : editTarget ? 'Save Changes' : 'Create Project'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Project"
        message={`Delete "${deleteTarget?.title}"? This cannot be undone.`}
        confirmLabel="Delete"
        isLoading={deleting}
      />
    </div>
  );
}
