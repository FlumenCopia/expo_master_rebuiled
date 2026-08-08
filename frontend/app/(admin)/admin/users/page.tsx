'use client';

import { useState, useEffect, useCallback } from 'react';
import { Users, UserPlus, Trash2, Shield, ShieldCheck, CheckCircle2, AlertCircle, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchApi } from '@/lib/api-client';
import { useAdminTheme } from '@/context/AdminThemeContext';

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function AdminUsersPage() {
  const { isDark } = useAdminTheme();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [stats, setStats] = useState({ total: 0, superAdmins: 0, eventManagers: 0, gateOfficers: 0 });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'GATE_OFFICER',
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        search,
        role: roleFilter,
        page: String(page),
        limit: String(limit),
      });

      const data = await fetchApi<any>(`/api/admin/users?${query.toString()}`);
      if (data && data.users) {
        setUsers(data.users);
      }
      if (data && data.pagination) {
        setPagination(data.pagination);
      }
      if (data && data.stats) {
        setStats(data.stats);
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to load users' });
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, page, limit]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadUsers();
    }, 300);
    return () => clearTimeout(timer);
  }, [loadUsers]);

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
        setMessage({ type: 'success', text: `✅ User "${formData.name}" created successfully!` });
        setFormData({ name: '', email: '', password: '', role: 'GATE_OFFICER' });
        loadUsers();
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: `❌ ${err.message || 'Failed to create user'}` });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete user "${name}"?`)) return;

    try {
      await fetchApi<any>(`/api/admin/users/${id}`, { method: 'DELETE' });
      setMessage({ type: 'success', text: `🗑️ User "${name}" deleted.` });
      loadUsers();
    } catch (err: any) {
      setMessage({ type: 'error', text: `❌ ${err.message || 'Failed to delete user'}` });
    }
  };

  const rangeStart = pagination.total === 0 ? 0 : (page - 1) * limit + 1;
  const rangeEnd = Math.min(page * limit, pagination.total);

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className={`flex items-center justify-between border p-5 sm:p-6 rounded-3xl transition-colors ${
        isDark ? 'bg-[#131B2A] border-slate-800 text-white shadow-xl' : 'bg-white border-slate-200 text-slate-900 shadow-sm'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl border flex items-center justify-center font-bold shrink-0 ${
            isDark ? 'bg-emerald-500/20 border-emerald-500/30 text-[#79C143]' : 'bg-emerald-50 border-emerald-200 text-[#01A64E]'
          }`}>
            <Users className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <div>
            <h1 className={`font-black text-lg sm:text-xl md:text-2xl flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Gatekeeper &amp; Staff User Accounts
            </h1>
            <p className={`text-xs sm:text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Create scanning staff accounts and manage role access permissions
            </p>
          </div>
        </div>
      </div>

      {/* STATS CHIPS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className={`border rounded-2xl p-4 text-center ${isDark ? 'bg-[#131B2A] border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
          <div className="text-2xl font-black text-[#01A64E]">{stats.total.toLocaleString()}</div>
          <div className={`text-[11px] font-bold uppercase tracking-wider mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Total Users</div>
        </div>
        <div className={`border rounded-2xl p-4 text-center ${isDark ? 'bg-[#131B2A] border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
          <div className="text-2xl font-black text-emerald-500">{stats.gateOfficers.toLocaleString()}</div>
          <div className={`text-[11px] font-bold uppercase tracking-wider mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Gate Officers</div>
        </div>
        <div className={`border rounded-2xl p-4 text-center ${isDark ? 'bg-[#131B2A] border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
          <div className="text-2xl font-black text-cyan-500">{stats.eventManagers.toLocaleString()}</div>
          <div className={`text-[11px] font-bold uppercase tracking-wider mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Event Managers</div>
        </div>
        <div className={`border rounded-2xl p-4 text-center ${isDark ? 'bg-[#131B2A] border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
          <div className="text-2xl font-black text-purple-500">{stats.superAdmins.toLocaleString()}</div>
          <div className={`text-[11px] font-bold uppercase tracking-wider mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Super Admins</div>
        </div>
      </div>

      {/* Message Banner */}
      {message && (
        <div
          className={`p-4 rounded-2xl border text-sm font-semibold flex items-center gap-2 ${
            message.type === 'success'
              ? isDark ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : isDark ? 'bg-rose-950/60 border-rose-500/40 text-rose-300' : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <AlertCircle className="w-5 h-5 text-rose-500" />}
          <span>{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Create User Form */}
        <div className={`border p-5 sm:p-6 rounded-3xl h-fit ${isDark ? 'bg-[#131B2A] border-slate-800 shadow-xl' : 'bg-white border-slate-200 shadow-sm'}`}>
          <h3 className={`font-extrabold text-base mb-2 flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <UserPlus className="w-5 h-5 text-[#01A64E]" /> Create New User
          </h3>
          <p className={`text-xs mb-5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Assign Gatekeeper or Admin login access</p>

          <form onSubmit={handleCreateUser} className="space-y-4">
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Full Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Officer Suresh Kumar"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-[#01A64E] transition-all border ${
                  isDark ? 'bg-[#090D16] border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                }`}
              />
            </div>

            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Email Address (Login ID)
              </label>
              <input
                type="email"
                required
                placeholder="gate1@expokerala.org"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-[#01A64E] transition-all border ${
                  isDark ? 'bg-[#090D16] border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                }`}
              />
            </div>

            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className={`w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-[#01A64E] transition-all border ${
                  isDark ? 'bg-[#090D16] border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                }`}
              />
            </div>

            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Access Role
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className={`w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-[#01A64E] transition-all border ${
                  isDark ? 'bg-[#090D16] border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              >
                <option value="GATE_OFFICER">Gate Officer (Scanner Access Only)</option>
                <option value="EVENT_MANAGER">Event Manager (Full Operations)</option>
                <option value="SUPER_ADMIN">Super Admin (System Owner)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-[#01A64E] hover:bg-[#79C143] text-white font-extrabold text-sm transition-all shadow-sm shadow-[#01A64E]/20 flex items-center justify-center gap-2 disabled:opacity-50 mt-2 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>{submitting ? 'Creating Account...' : 'Create Account'}</span>
            </button>
          </form>
        </div>

        {/* Users List Container */}
        <div className={`md:col-span-2 border p-5 sm:p-6 rounded-3xl flex flex-col justify-between ${
          isDark ? 'bg-[#131B2A] border-slate-800 shadow-xl' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <h3 className={`font-extrabold text-base flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                <ShieldCheck className="w-5 h-5 text-[#01A64E]" /> Authorized Staff &amp; Gatekeepers
              </h3>

              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={roleFilter}
                  onChange={(e) => {
                    setRoleFilter(e.target.value);
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#01A64E] border ${
                    isDark ? 'bg-[#090D16] border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-700'
                  }`}
                >
                  <option value="ALL">All Roles</option>
                  <option value="GATE_OFFICER">Gate Officers</option>
                  <option value="EVENT_MANAGER">Event Managers</option>
                  <option value="SUPER_ADMIN">Super Admins</option>
                </select>
              </div>
            </div>

            {/* SEARCH INPUT */}
            <div className="relative mb-4">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search user by name or email..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className={`w-full pl-10 pr-4 py-2 rounded-xl text-xs focus:outline-none focus:border-[#01A64E] border ${
                  isDark ? 'bg-[#090D16] border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                }`}
              />
            </div>

            {loading ? (
              <div className="py-12 text-center text-slate-500 text-sm">Loading user accounts...</div>
            ) : users.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-sm">No matching user accounts found.</div>
            ) : (
              <div className="space-y-3">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className={`p-3.5 sm:p-4 rounded-2xl border flex items-center justify-between gap-3 transition-all overflow-hidden ${
                      isDark ? 'bg-[#090D16] border-slate-800 hover:border-slate-700' : 'bg-slate-50 border-slate-200 hover:border-[#01A64E]/40'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl border flex items-center justify-center font-bold shrink-0 ${
                        user.role === 'SUPER_ADMIN'
                          ? isDark ? 'bg-purple-500/20 border-purple-500/30 text-purple-400' : 'bg-purple-50 border-purple-200 text-purple-600'
                          : user.role === 'EVENT_MANAGER'
                          ? isDark ? 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400' : 'bg-cyan-50 border-cyan-200 text-cyan-600'
                          : isDark ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-600'
                      }`}>
                        <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className={`font-extrabold text-xs sm:text-sm flex flex-wrap items-center gap-1.5 leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          <span className="truncate">{user.name}</span>
                          <span className={`text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${
                            user.role === 'SUPER_ADMIN'
                              ? isDark ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-purple-50 text-purple-700 border border-purple-200'
                              : user.role === 'EVENT_MANAGER'
                              ? isDark ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'bg-cyan-50 text-cyan-700 border border-cyan-200'
                              : isDark ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}>
                            {user.role}
                          </span>
                        </div>
                        <div className={`text-[11px] sm:text-xs mt-0.5 truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{user.email}</div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteUser(user.id, user.name)}
                      className={`p-2 rounded-xl border transition-all shrink-0 cursor-pointer ${
                        isDark ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border-rose-500/30' : 'bg-rose-50 text-rose-600 hover:bg-rose-100 border-rose-200'
                      }`}
                      title="Delete User Account"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* PAGINATION FOOTER */}
          <div className={`mt-6 pt-4 border-t flex items-center justify-between text-xs ${
            isDark ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-500'
          }`}>
            <div>
              Showing <strong className={isDark ? 'text-white' : 'text-slate-900'}>{rangeStart} - {rangeEnd}</strong> of{' '}
              <strong className="text-[#01A64E]">{pagination.total}</strong> accounts
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1 || loading}
                onClick={() => setPage(page - 1)}
                className={`p-1.5 rounded-xl border disabled:opacity-30 cursor-pointer ${
                  isDark ? 'bg-[#090D16] border-slate-700 text-white hover:bg-slate-800' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span>
                Page <strong className={isDark ? 'text-white' : 'text-slate-900'}>{page}</strong> of{' '}
                <strong className={isDark ? 'text-white' : 'text-slate-900'}>{pagination.totalPages}</strong>
              </span>
              <button
                disabled={page >= pagination.totalPages || loading}
                onClick={() => setPage(page + 1)}
                className={`p-1.5 rounded-xl border disabled:opacity-30 cursor-pointer ${
                  isDark ? 'bg-[#090D16] border-slate-700 text-white hover:bg-slate-800' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
