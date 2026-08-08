'use client';

import { useState, useEffect, useCallback } from 'react';
import { DoorOpen, Plus, Trash2, ShieldCheck, CheckCircle2, AlertCircle, Search } from 'lucide-react';
import { fetchApi } from '@/lib/api-client';
import { useAdminTheme } from '@/context/AdminThemeContext';
import Pagination from '@/components/Pagination';

interface GateItem {
  id: string;
  name: string;
  code?: string;
  hall?: string;
  status: string;
  createdAt: string;
}

export default function AdminGatesPage() {
  const { isDark } = useAdminTheme();
  const [gates, setGates] = useState<GateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });

  const [newGateName, setNewGateName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadGates = useCallback(async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        search,
        status: statusFilter,
        page: String(page),
        limit: String(limit),
      });

      const data = await fetchApi<any>(`/api/admin/gates?${query.toString()}`);
      if (data && data.gates) {
        setGates(data.gates);
      }
      if (data && data.pagination) {
        setPagination(data.pagination);
      }
      if (data && data.stats) {
        setStats(data.stats);
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to load gates' });
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page, limit]);

  useEffect(() => {
    loadGates();
  }, [loadGates]);

  const handleAddGate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGateName.trim()) return;

    setSubmitting(true);
    setMessage(null);

    try {
      await fetchApi<any>('/api/admin/gates', {
        method: 'POST',
        body: JSON.stringify({ name: newGateName.trim() }),
      });

      setNewGateName('');
      setMessage({ type: 'success', text: `✅ Gate "${newGateName}" created successfully.` });
      loadGates();
    } catch (err: any) {
      setMessage({ type: 'error', text: `❌ ${err.message || 'Failed to add gate'}` });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteGate = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete gate "${name}"?`)) return;

    try {
      await fetchApi<any>(`/api/admin/gates/${id}`, { method: 'DELETE' });
      setMessage({ type: 'success', text: `🗑️ Gate "${name}" deleted.` });
      loadGates();
    } catch (err: any) {
      setMessage({ type: 'error', text: `❌ ${err.message || 'Failed to delete gate'}` });
    }
  };

  const rangeStart = pagination.total === 0 ? 0 : (page - 1) * limit + 1;
  const rangeEnd = Math.min(page * limit, pagination.total);

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border p-4 sm:p-6 rounded-3xl transition-colors ${
        isDark ? 'bg-[#131B2A] border-slate-800 text-white shadow-xl' : 'bg-white border-slate-200 text-slate-900 shadow-sm'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center font-bold ${
            isDark ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-[#01A64E]'
          }`}>
            <DoorOpen className="w-7 h-7" />
          </div>
          <div>
            <h1 className={`font-black text-xl sm:text-2xl flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Gate Management
            </h1>
            <p className={`text-xs sm:text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Configure event entry and exit gates for gatekeeper scanner stations</p>
          </div>
        </div>
      </div>

      {/* STATS OVERVIEW CHIPS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={`border rounded-2xl p-4 text-center ${isDark ? 'bg-[#131B2A] border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
          <div className="text-2xl font-black text-[#01A64E]">{stats.total.toLocaleString()}</div>
          <div className={`text-[11px] font-bold uppercase tracking-wider mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Total Gates</div>
        </div>
        <div className={`border rounded-2xl p-4 text-center ${isDark ? 'bg-[#131B2A] border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
          <div className="text-2xl font-black text-emerald-500">{stats.active.toLocaleString()}</div>
          <div className={`text-[11px] font-bold uppercase tracking-wider mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Active Stations</div>
        </div>
        <div className={`border rounded-2xl p-4 text-center ${isDark ? 'bg-[#131B2A] border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
          <div className="text-2xl font-black text-rose-500">{stats.inactive.toLocaleString()}</div>
          <div className={`text-[11px] font-bold uppercase tracking-wider mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Inactive</div>
        </div>
      </div>

      {/* Message Banner */}
      {message && (
        <div
          className={`p-4 rounded-2xl border text-sm font-semibold flex items-center gap-2 ${
            message.type === 'success'
              ? isDark ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : isDark ? 'bg-rose-500/20 border-rose-500/40 text-rose-300' : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <AlertCircle className="w-5 h-5 text-rose-500" />}
          <span>{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Add New Gate Form */}
        <div className={`border p-6 rounded-3xl h-fit ${isDark ? 'bg-[#131B2A] border-slate-800 shadow-xl' : 'bg-white border-slate-200 shadow-sm'}`}>
          <h3 className={`font-extrabold text-base mb-2 flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <Plus className="w-5 h-5 text-[#01A64E]" /> Add New Event Gate
          </h3>
          <p className={`text-xs mb-5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Create active gate stations for scanner assignment</p>

          <form onSubmit={handleAddGate} className="space-y-4">
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Gate Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. North Gate 3 (VIP)"
                value={newGateName}
                onChange={(e) => setNewGateName(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:border-[#01A64E] transition-all ${
                  isDark ? 'bg-[#090D16] border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                }`}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-[#01A64E] hover:bg-[#79C143] text-white font-extrabold text-sm transition-all shadow-sm shadow-[#01A64E]/20 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{submitting ? 'Adding Gate...' : 'Add Gate Station'}</span>
            </button>
          </form>
        </div>

        {/* Active Gates List */}
        <div className={`md:col-span-2 border p-6 rounded-3xl flex flex-col justify-between ${
          isDark ? 'bg-[#131B2A] border-slate-800 shadow-xl' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <h3 className={`font-extrabold text-base flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                <ShieldCheck className="w-5 h-5 text-[#01A64E]" /> Active Event Gates
              </h3>

              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold focus:outline-none focus:border-[#01A64E] ${
                  isDark ? 'bg-[#090D16] border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-700'
                }`}
              >
                <option value="ALL">All Gates</option>
                <option value="ACTIVE">Active Stations</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>

            {loading ? (
              <div className="py-8 text-center text-slate-500 text-xs">Loading gates...</div>
            ) : gates.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">No gates added yet.</div>
            ) : (
              <div className="space-y-2.5">
                {gates.map((g) => (
                  <div
                    key={g.id}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                      isDark ? 'bg-[#090D16] border-slate-800 hover:border-slate-700' : 'bg-slate-50 border-slate-200 hover:bg-slate-100/80'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#01A64E]/10 border border-[#01A64E]/20 text-[#01A64E] flex items-center justify-center font-bold text-xs">
                        <DoorOpen className="w-4 h-4" />
                      </div>
                      <div>
                        <div className={`font-extrabold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{g.name}</div>
                        <div className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Code: {g.code || g.name.toLowerCase().replace(/\s+/g, '-')}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                        g.status === 'INACTIVE'
                          ? isDark ? 'bg-rose-500/20 border-rose-500/40 text-rose-300' : 'bg-rose-50 border-rose-200 text-rose-700'
                          : isDark ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                      }`}>
                        {g.status || 'ACTIVE'}
                      </span>

                      <button
                        onClick={() => handleDeleteGate(g.id, g.name)}
                        className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                          isDark ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20' : 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100'
                        }`}
                        title="Delete Gate"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* PAGINATION FOOTER */}
          <div className={`mt-6 pt-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-xs ${
            isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'
          }`}>
            <Pagination
              page={page}
              totalPages={pagination.totalPages}
              total={pagination.total}
              limit={limit}
              onPageChange={(p) => setPage(p)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
