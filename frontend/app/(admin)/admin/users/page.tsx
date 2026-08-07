'use client';

import { useState, useEffect } from 'react';
import { Users, UserPlus, Trash2, Shield, ShieldCheck, CheckCircle2, AlertCircle, Key } from 'lucide-react';
import { fetchApi } from '@/lib/api-client';
import AdminNavbar from '@/components/AdminNavbar';

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'GATE_OFFICER',
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await fetchApi<any>('/api/admin/users');
      if (data && data.users) {
        setUsers(data.users);
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to load user accounts' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetchApi<any>('/api/admin/users', {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      if (res && res.success) {
        setMessage({ type: 'success', text: `✅ User account "${formData.name}" created successfully!` });
        setFormData({ name: '', email: '', password: '', role: 'GATE_OFFICER' });
        loadUsers();
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: `❌ ${err.message || 'Failed to create user account'}` });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete user account "${name}"?`)) return;

    try {
      await fetchApi<any>(`/api/admin/users/${id}`, { method: 'DELETE' });
      setMessage({ type: 'success', text: `🗑️ User account "${name}" deleted.` });
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err: any) {
      setMessage({ type: 'error', text: `❌ ${err.message || 'Failed to delete user'}` });
    }
  };

  return (
    <div className="min-h-screen bg-[#03151a] text-slate-100 font-sans selection:bg-[#01A64E] selection:text-white flex flex-col">
      <AdminNavbar />

      <main className="max-w-5xl mx-auto w-full px-4 py-6 flex-1 flex flex-col space-y-6">
        {/* Header Card */}
        <div className="flex items-center justify-between bg-[#072228] border border-[#0b3d46] p-5 sm:p-6 rounded-3xl shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-[#01A64E]/15 border border-[#01A64E]/30 text-[#79C143] flex items-center justify-center font-bold shrink-0">
              <Users className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div>
              <h1 className="font-black text-white text-lg sm:text-xl md:text-2xl flex items-center gap-2">
                Gatekeeper & Staff User Accounts
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">Create scanning staff accounts and manage role access permissions</p>
            </div>
          </div>
        </div>

        {/* Message Banner */}
        {message && (
          <div
            className={`p-4 rounded-2xl border text-sm font-semibold flex items-center gap-2 ${
              message.type === 'success'
                ? 'bg-[#072228] border-[#01A64E]/50 text-[#79C143]'
                : 'bg-rose-950/80 border-rose-500/50 text-rose-300'
            }`}
          >
            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span>{message.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Create User Form */}
          <div className="bg-[#072228] border border-[#0b3d46] p-5 sm:p-6 rounded-3xl shadow-xl h-fit">
            <h3 className="font-extrabold text-white text-base mb-2 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-[#79C143]" /> Create New User
            </h3>
            <p className="text-xs text-slate-400 mb-5">Assign Gatekeeper or Admin login access</p>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Officer Suresh Kumar"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#03151a] border border-[#0b3d46] text-slate-100 text-sm focus:outline-none focus:border-[#01A64E] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Email Address (Login ID)
                </label>
                <input
                  type="email"
                  required
                  placeholder="gate1@expokerala.org"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#03151a] border border-[#0b3d46] text-slate-100 text-sm focus:outline-none focus:border-[#01A64E] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#03151a] border border-[#0b3d46] text-slate-100 text-sm focus:outline-none focus:border-[#01A64E] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Access Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#03151a] border border-[#0b3d46] text-slate-200 text-sm focus:outline-none focus:border-[#01A64E] transition-all"
                >
                  <option value="GATE_OFFICER">Gate Officer (Scanner Access Only)</option>
                  <option value="EVENT_MANAGER">Event Manager (Full Operations)</option>
                  <option value="SUPER_ADMIN">Super Admin (System Owner)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-[#01A64E] hover:bg-[#79C143] text-white font-extrabold text-sm transition-all shadow-lg shadow-[#01A64E]/20 flex items-center justify-center gap-2 disabled:opacity-50 mt-2 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>{submitting ? 'Creating Account...' : 'Create Account'}</span>
              </button>
            </form>
          </div>

          {/* Users List */}
          <div className="md:col-span-2 bg-[#072228] border border-[#0b3d46] p-5 sm:p-6 rounded-3xl shadow-xl flex flex-col">
            <h3 className="font-extrabold text-white text-base mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#79C143]" /> Authorized Staff & Gatekeepers
              </span>
              <span className="text-xs px-3 py-1 rounded-full bg-[#03151a] text-[#79C143] border border-[#0b3d46] font-mono font-bold">
                {users.length} Active Accounts
              </span>
            </h3>

            {loading ? (
              <div className="py-12 text-center text-slate-500 text-sm">Loading user accounts...</div>
            ) : users.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-sm">No staff accounts configured.</div>
            ) : (
              <div className="space-y-3">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="p-3.5 sm:p-4 rounded-2xl bg-[#03151a] border border-[#0b3d46] flex items-center justify-between gap-3 hover:border-[#01A64E]/30 transition-all overflow-hidden"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl border flex items-center justify-center font-bold shrink-0 ${
                        user.role === 'SUPER_ADMIN'
                          ? 'bg-purple-500/20 border-purple-500/30 text-purple-400'
                          : user.role === 'EVENT_MANAGER'
                          ? 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400'
                          : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                      }`}>
                        <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-extrabold text-white text-xs sm:text-sm flex flex-wrap items-center gap-1.5 leading-tight">
                          <span className="truncate">{user.name}</span>
                          <span className={`text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${
                            user.role === 'SUPER_ADMIN'
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                              : user.role === 'EVENT_MANAGER'
                              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}>
                            {user.role}
                          </span>
                        </div>
                        <div className="text-[11px] sm:text-xs text-slate-400 mt-0.5 truncate">{user.email}</div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteUser(user.id, user.name)}
                      className="p-2 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 transition-all shrink-0"
                      title="Delete User Account"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
