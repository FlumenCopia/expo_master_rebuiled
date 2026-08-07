'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Search, Download, RefreshCw, QrCode, ChevronLeft, ChevronRight, Users, Trash2 } from 'lucide-react';
import { fetchApi, API_BASE_URL } from '@/lib/api-client';
import AdminNavbar from '@/components/AdminNavbar';

export default function AdminVisitorsPage() {
  const [visitors, setVisitors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  const fetchVisitors = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        search,
        status: statusFilter,
        category: categoryFilter,
        page: String(page),
        limit: String(limit),
      });

      const data = await fetchApi<any>(`/api/admin/visitors?${query.toString()}`);
      setVisitors(data.visitors || []);
      setPagination(data.pagination || { total: 0, totalPages: 1 });
    } catch (err) {
      console.error('Failed to fetch visitors:', err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, categoryFilter, page, limit]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchVisitors();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchVisitors]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* UNIFIED ADMIN NAVBAR */}
      <AdminNavbar onRefresh={fetchVisitors} isRefreshing={loading} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* HEADER & EXPORT BAR */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800/80 p-6 rounded-3xl backdrop-blur-xl">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              <Users className="w-7 h-7 text-emerald-400" />
              Visitors Master Directory
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Search, filter, and inspect attendee database records.
            </p>
          </div>

          <button
            onClick={() => {
              const token = typeof window !== 'undefined' ? localStorage.getItem('expo_admin_token') || '' : '';
              window.open(
                `${API_BASE_URL}/api/admin/visitors?export=csv&search=${encodeURIComponent(
                  search
                )}&status=${statusFilter}&category=${categoryFilter}&token=${encodeURIComponent(token)}`,
                '_blank'
              );
            }}
            className="px-5 py-3 rounded-2xl bg-emerald-500 text-slate-950 font-black text-xs sm:text-sm hover:bg-emerald-400 transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-[0.98] self-start md:self-auto shrink-0 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Filtered CSV</span>
          </button>
        </div>

        {/* SEARCH & FILTER CONTROLS */}
        <div className="bg-slate-900/80 border border-slate-800/80 p-4 sm:p-6 rounded-3xl flex flex-col md:flex-row gap-4 justify-between items-center backdrop-blur-xl">
          <div className="relative w-full md:w-96">
            <Search className="w-5 h-5 absolute left-4 top-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search by name, email, phone, company, or badge code..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-white text-xs font-semibold focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="REGISTERED">🟡 Registered</option>
              <option value="CHECKED_IN">🟢 Checked-In (Inside)</option>
              <option value="ON_BREAK">☕ On Break (Pass-Out)</option>
              <option value="CHECKED_OUT">🔴 Checked-Out (Left)</option>
              <option value="CANCELLED">⛔ Cancelled</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              className="px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-white text-xs font-semibold focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Categories</option>
              <option value="VISITOR">Visitor</option>
              <option value="DELEGATE">Delegate</option>
              <option value="VIP">VIP</option>
              <option value="EXHIBITOR">Exhibitor</option>
              <option value="PRESS">Press</option>
            </select>

            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-white text-xs font-semibold focus:outline-none focus:border-emerald-500"
            >
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
            </select>

            <button
              onClick={fetchVisitors}
              className="p-3 rounded-2xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* VISITORS DATA TABLE */}
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="text-[11px] uppercase tracking-wider font-extrabold text-slate-400 border-b border-slate-800 bg-slate-950/80">
                <tr>
                  <th className="py-4 px-6">Badge Code</th>
                  <th className="py-4 px-6">Name</th>
                  <th className="py-4 px-6">Email / Phone</th>
                  <th className="py-4 px-6">Company / City</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      Loading high-scale records from Node.js Express API...
                    </td>
                  </tr>
                ) : visitors.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      No matching records found.
                    </td>
                  </tr>
                ) : (
                  visitors.map((v: any) => (
                    <tr key={v.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="py-4 px-6 font-mono text-xs font-bold text-emerald-400">{v.badgeCode}</td>
                      <td className="py-4 px-6 font-bold text-white">{v.fullName}</td>
                      <td className="py-4 px-6 text-slate-400">
                        <div className="text-xs text-white">{v.email}</div>
                        <div className="text-[11px] text-slate-500">{v.phone}</div>
                      </td>
                      <td className="py-4 px-6 text-slate-400">
                        <div className="text-xs text-slate-300 font-medium">{v.company || '—'}</div>
                        <div className="text-[11px] text-slate-500">{v.city || 'Kerala'}</div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-800 border border-slate-700/60 text-slate-300">
                          {v.category}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`px-3 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1 ${
                            v.status === 'CHECKED_IN'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : v.status === 'ON_BREAK'
                              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                              : v.status === 'CHECKED_OUT'
                              ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                              : v.status === 'CANCELLED'
                              ? 'bg-slate-500/15 text-slate-400 border border-slate-500/30'
                              : 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              v.status === 'CHECKED_IN'
                                ? 'bg-emerald-400 animate-ping'
                                : v.status === 'ON_BREAK'
                                ? 'bg-amber-400 animate-pulse'
                                : v.status === 'CHECKED_OUT'
                                ? 'bg-rose-400'
                                : 'bg-slate-400'
                            }`}
                          />
                          {v.status === 'CHECKED_IN' ? '✅ CHECKED IN'
                            : v.status === 'ON_BREAK' ? '☕ ON BREAK'
                            : v.status === 'CHECKED_OUT' ? '🔴 CHECKED OUT'
                            : v.status === 'CANCELLED' ? '⛔ CANCELLED'
                            : '🟡 ' + v.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/badge/${v.badgeCode}`}
                            target="_blank"
                            className="px-3 py-1.5 rounded-xl bg-slate-800 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 font-bold text-xs transition-colors inline-flex items-center gap-1"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                            <span>Badge</span>
                          </Link>
                          <button
                            onClick={async () => {
                              if (confirm(`Delete visitor ${v.fullName}?`)) {
                                await fetchApi(`/api/admin/visitors/${v.id}`, { method: 'DELETE' });
                                fetchVisitors();
                              }
                            }}
                            className="p-1.5 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
                            title="Delete Visitor Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="p-6 bg-slate-950/80 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <div>
              Showing <span className="font-bold text-white">{visitors.length}</span> of{' '}
              <span className="font-bold text-emerald-400">{pagination.total.toLocaleString()}</span> registered records
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 disabled:opacity-30 hover:bg-slate-800 text-white"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span>
                Page <strong className="text-white">{page}</strong> of{' '}
                <strong className="text-white">{pagination.totalPages}</strong>
              </span>
              <button
                disabled={page >= pagination.totalPages}
                onClick={() => setPage(page + 1)}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 disabled:opacity-30 hover:bg-slate-800 text-white"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
