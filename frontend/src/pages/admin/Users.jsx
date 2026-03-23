import { useState, useEffect, useCallback } from 'react';
import { Search, UserX, UserCheck, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { getAllUsersApi, toggleUserStatusApi, deleteUserApi } from '../../api/admin';
import { SkeletonTable } from '../../components/common/Spinner';
import Avatar from '../../components/common/Avatar';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import toast from 'react-hot-toast';
import { timeAgo } from '../../utils/helpers';

export default function AdminUsers() {
  const [users, setUsers]               = useState([]);
  const [pagination, setPagination]     = useState({});
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [roleFilter, setRoleFilter]     = useState('');
  const [page, setPage]                 = useState(1);
  const [confirmAction, setConfirmAction] = useState(null);
  const [processing, setProcessing]     = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllUsersApi({ page, limit: 15, search: search || undefined, role: roleFilter || undefined });
      setUsers(res.data.data);
      setPagination(res.data.pagination);
    } finally { setLoading(false); }
  }, [page, search, roleFilter]);

  useEffect(() => {
    const t = setTimeout(fetchUsers, 300);
    return () => clearTimeout(t);
  }, [fetchUsers]);

  const handleToggle = async () => {
    setProcessing(true);
    try {
      const res = await toggleUserStatusApi(confirmAction.user._id);
      const updated = res.data.data.user;
      setUsers((prev) => prev.map((u) => u._id === updated._id ? { ...u, isActive: updated.isActive } : u));
      toast.success(`User ${updated.isActive ? 'activated' : 'deactivated'}`);
      setConfirmAction(null);
    } finally { setProcessing(false); }
  };

  const handleDelete = async () => {
    setProcessing(true);
    try {
      await deleteUserApi(confirmAction.user._id);
      setUsers((prev) => prev.filter((u) => u._id !== confirmAction.user._id));
      toast.success('User deleted');
      setConfirmAction(null);
    } finally { setProcessing(false); }
  };

  const roleBadge = { student: 'badge-electric', mentor: 'badge-aurora', admin: 'badge-amber' };
  const ROLES = [{ v: '', l: 'All' }, { v: 'student', l: 'Students' }, { v: 'mentor', l: 'Mentors' }];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="section-title text-2xl">User Management</h1>
        <p className="text-slate-500 text-sm mt-1">{pagination.total ?? 0} total users</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input type="text" className="input-field pl-11" placeholder="Search by name or email…"
            value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <div className="flex gap-2">
          {ROLES.map(({ v, l }) => (
            <button key={v} onClick={() => { setRoleFilter(v); setPage(1); }}
              className={`px-4 py-2.5 rounded-lg text-sm font-display font-medium transition-all
                ${roleFilter === v ? 'bg-electric-500 text-white' : 'btn-secondary'}`}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {loading ? <SkeletonTable rows={8} /> : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-obsidian-700">
                  {['User','Role','Status','Joined','Actions'].map((h, i) => (
                    <th key={h} className={`text-xs font-display font-semibold text-slate-500 uppercase tracking-wider px-5 py-3 ${i === 4 ? 'text-right' : 'text-left'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-obsidian-800">
                {users.length === 0 && (
                  <tr><td colSpan={5} className="text-center py-12 text-slate-600 font-display">No users found</td></tr>
                )}
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-obsidian-800/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar name={u.name} avatar={u.avatar} size="sm" />
                        <div>
                          <p className="text-sm font-display font-semibold text-white">{u.name}</p>
                          <p className="text-xs text-slate-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`badge ${roleBadge[u.role] || 'badge-neutral'}`}>{u.role}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${u.isActive ? 'bg-aurora-400' : 'bg-rose-400'}`} />
                        <span className="text-xs text-slate-400">{u.isActive ? 'Active' : 'Inactive'}</span>
                        {u.role === 'mentor' && !u.isApproved && (
                          <span className="badge badge-amber text-[10px]">pending</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs text-slate-500">{timeAgo(u.createdAt)}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setConfirmAction({ type: 'toggle', user: u })}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors
                            ${u.isActive ? 'text-amber-400 hover:bg-amber-500/10' : 'text-aurora-400 hover:bg-aurora-500/10'}`}
                          title={u.isActive ? 'Deactivate' : 'Activate'}>
                          {u.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </button>
                        <button onClick={() => setConfirmAction({ type: 'delete', user: u })}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-rose-400 hover:bg-rose-500/10 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination.pages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-obsidian-700">
              <p className="text-xs text-slate-500 font-display">Page {pagination.page} of {pagination.pages}</p>
              <div className="flex gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary px-3 py-2 text-xs">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages} className="btn-secondary px-3 py-2 text-xs">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={confirmAction?.type === 'delete' ? handleDelete : handleToggle}
        title={confirmAction?.type === 'delete' ? 'Delete User' : (confirmAction?.user?.isActive ? 'Deactivate User' : 'Activate User')}
        message={confirmAction?.type === 'delete'
          ? `Permanently delete ${confirmAction?.user?.name}? This cannot be undone.`
          : `${confirmAction?.user?.isActive ? 'Deactivate' : 'Activate'} ${confirmAction?.user?.name}?`}
        confirmLabel={confirmAction?.type === 'delete' ? 'Delete' : (confirmAction?.user?.isActive ? 'Deactivate' : 'Activate')}
        isLoading={processing}
      />
    </div>
  );
}
