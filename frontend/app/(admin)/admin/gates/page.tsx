'use client';

import { useState, useEffect, useCallback } from 'react';
import { DoorOpen, Plus, Trash2, ShieldCheck, CheckCircle2, AlertCircle, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchApi } from '@/lib/api-client';
import AdminNavbar from '@/components/AdminNavbar';

interface GateItem {
  id: string;
  name: string;
  code?: string;
  hall?: string;
  status: string;
  createdAt: string;
}

export default function AdminGatesPage() {
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
    const timer = setTimeout(() => {
      loadGates();
    }, 300);
    return () => clearTimeout(timer);
  }, [loadGates]);

  const handleAddGate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGateName.trim()) return;

    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetchApi<any>('/api/admin/gates', {
        method: 'POST',
        body: JSON.stringify({ name: newGateName.trim() }),
      });

      if (res && res.success) {
        setMessage({ type: 'success', text: `✅ Gate "${newGateName}" added successfully!` });
        setNewGateName('');
        loadGates();
      }
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
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950 flex flex-col">
      <AdminNavbar />

      <main className="max-w-6xl mx-auto w-full px-4 py-6 flex-1 flex flex-col space-y-6">
        {/* Header Card */}
        <div className="flex items-center justify-between bg-slate-900/80 border border-slate-800 p-6 rounded-3xl backdrop-blur-xl shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold">
              <DoorOpen className="w-7 h-7" />
            </div>
            <div>
              <h1 className="font-black text-white text-xl sm:text-2xl flex items-center gap-2">
                Gate Management
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">Configure event entry and exit gates for gatekeeper scanner stations</p>
            </div>
          </div>
        </div>

        {/* STATS OVERVIEW CHIPS */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-center">
            <div className="text-2xl font-black text-emerald-400">{stats.total.toLocaleString()}</div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">Total Gates</div>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-center">
            <div className="text-2xl font-black text-emerald-300">{stats.active.toLocaleString()}</div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">Active Stations</div>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-center">
            <div className="text-2xl font-black text-rose-400">{stats.inactive.toLocaleString()}</div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">Inactive</div>
          </div>
        </div>

        {/* Message Banner */}
        {message && (
          <div
            className={`p-4 rounded-2xl border text-sm font-semibold flex items-center gap-2 ${
              message.type === 'success'
                ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                : 'bg-rose-950/80 border-rose-500/50 text-rose-300'
            }`}
          >
            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span>{message.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Add New Gate Form */}
          <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-3xl shadow-xl backdrop-blur-xl h-fit">
            <h3 className="font-extrabold text-white text-base mb-2 flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-400" /> Add New Event Gate
            </h3>
            <p className="text-xs text-slate-400 mb-5">Create active gate stations for scanner assignment</p>

            <form onSubmit={handleAddGate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Gate Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. North Gate 3 (VIP)"
                  value={newGateName}
                  onChange={(e) => setNewGateName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-emerald-500 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{submitting ? 'Adding Gate...' : 'Add Gate Station'}</span>
              </button>
            </form>
          </div>

          {/* Active Gates List */}
          <div className="md:col-span-2 bg-slate-900/80 border border-slate-800 p-6 rounded-3xl shadow-xl backdrop-blur-xl flex flex-col justify-between">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" /> Active Event Gates
                </h3>

                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-semibold focus:outline-none focus:border-emerald-500"
                >
                  <option value="ALL">All Gate Statuses</option>
                  <option value="ACTIVE">🟢 Active</option>
                  <option value="INACTIVE">🔴 Inactive</option>
                </select>
              </div>

              {/* SEARCH BAR */}
              <div className="relative mb-4">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search gate station by name, code, or hall..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {loading ? (
                <div className="py-12 text-center text-slate-500 text-sm">Loading gate stations...</div>
              ) : gates.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-sm">No matching gate stations found.</div>
              ) : (
                <div className="space-y-3">
                  {gates.map((gate) => (
                    <div
                      key={gate.id}
                      className="p-3.5 sm:p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-3 hover:border-slate-700 transition-all overflow-hidden"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold shrink-0">
                          <DoorOpen className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-extrabold text-white text-xs sm:text-sm truncate flex items-center gap-2">
                            <span>{gate.name}</span>
                            {gate.code && (
                              <span className="font-mono text-[10px] bg-slate-800 px-2 py-0.5 rounded text-emerald-400">
                                {gate.code}
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] sm:text-[11px] text-slate-400 truncate">
                            Hall: {gate.hall || 'Main Hall'} · Status: <span className="text-emerald-400 font-semibold uppercase">{gate.status}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteGate(gate.id, gate.name)}
                        className="p-2 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 transition-all shrink-0 cursor-pointer"
                        title="Delete Gate"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* PAGINATION FOOTER */}
            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <div>
                Showing <strong className="text-white">{rangeStart} - {rangeEnd}</strong> of{' '}
                <strong className="text-emerald-400">{pagination.total}</strong> gates
              </div>

              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1 || loading}
                  onClick={() => setPage(page - 1)}
                  className="p-1.5 rounded-xl bg-slate-950 border border-slate-800 disabled:opacity-30 hover:bg-slate-800 text-white cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span>
                  Page <strong className="text-white">{page}</strong> of{' '}
                  <strong className="text-white">{pagination.totalPages}</strong>
                </span>
                <button
                  disabled={page >= pagination.totalPages || loading}
                  onClick={() => setPage(page + 1)}
                  className="p-1.5 rounded-xl bg-slate-950 border border-slate-800 disabled:opacity-30 hover:bg-slate-800 text-white cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
