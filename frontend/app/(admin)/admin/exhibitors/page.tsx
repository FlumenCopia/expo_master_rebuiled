'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Building2, CheckCircle2, Clock, XCircle, Search, Edit3, ChevronLeft, ChevronRight, Users } from 'lucide-react';
import { fetchApi } from '@/lib/api-client';
import AdminNavbar from '@/components/AdminNavbar';

export default function AdminExhibitorsPage() {
  const [exhibitors, setExhibitors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [editingStall, setEditingStall] = useState<{ id: string; stallNumber: string } | null>(null);

  const fetchExhibitors = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        search,
        status: statusFilter,
        page: String(page),
        limit: String(limit),
      });

      const data = await fetchApi<any>(`/api/admin/exhibitors?${query.toString()}`);
      if (data?.exhibitors) {
        setExhibitors(data.exhibitors);
      }
      if (data?.pagination) {
        setPagination(data.pagination);
      }
      if (data?.stats) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to fetch exhibitors:', err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page, limit]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchExhibitors();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchExhibitors]);

  const updateStatus = async (id: string, status: string, stallNumber?: string) => {
    try {
      await fetchApi<any>(`/api/admin/exhibitors/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status, ...(stallNumber && { stallNumber }) }),
      });
      fetchExhibitors();
    } catch (err) {
      console.error('Failed to update exhibitor status:', err);
    }
  };

  const rangeStart = pagination.total === 0 ? 0 : (page - 1) * limit + 1;
  const rangeEnd = Math.min(page * limit, pagination.total);

  return (
    <div className="min-h-screen bg-[#03151a] text-slate-100 font-sans selection:bg-[#01A64E] selection:text-white">
      {/* UNIFIED ADMIN NAVBAR */}
      <AdminNavbar onRefresh={fetchExhibitors} isRefreshing={loading} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#072228] border border-[#0b3d46] p-5 sm:p-6 rounded-3xl shadow-xl">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              <Building2 className="w-7 h-7 text-[#79C143]" />
              Exhibitors &amp; Stall Booking Directory
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Review exhibitor applications, assign stall numbers, and manage approval status.
            </p>
          </div>

          <Link
            href="/admin/company-employees"
            className="px-5 py-3 rounded-2xl bg-[#01A64E] hover:bg-[#79C143] text-white font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-[#01A64E]/20 transition-all shrink-0 active:scale-[0.98]"
          >
            <Users className="w-4 h-4" />
            <span>Manage Staff Badges / Employees</span>
          </Link>
        </div>

        {/* STATS OVERVIEW */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#072228] border border-[#0b3d46] rounded-2xl p-4 text-center">
            <div className="text-2xl font-black text-[#79C143]">{stats.total.toLocaleString()}</div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">Total Exhibitors</div>
          </div>
          <div className="bg-[#072228] border border-[#0b3d46] rounded-2xl p-4 text-center">
            <div className="text-2xl font-black text-amber-400">{stats.pending.toLocaleString()}</div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">Pending Approval</div>
          </div>
          <div className="bg-[#072228] border border-[#0b3d46] rounded-2xl p-4 text-center">
            <div className="text-2xl font-black text-emerald-400">{stats.approved.toLocaleString()}</div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">Approved Stalls</div>
          </div>
          <div className="bg-[#072228] border border-[#0b3d46] rounded-2xl p-4 text-center">
            <div className="text-2xl font-black text-rose-400">{stats.rejected.toLocaleString()}</div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">Rejected</div>
          </div>
        </div>

        {/* SEARCH BAR & STATUS TABS */}
        <div className="bg-[#072228] border border-[#0b3d46] p-4 sm:p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
          <div className="relative max-w-md w-full">
            <Search className="w-5 h-5 absolute left-4 top-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search by company name, contact, or email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-12 pr-4 py-3 rounded-2xl bg-[#03151a] border border-[#0b3d46] text-white placeholder-slate-500 focus:outline-none focus:border-[#01A64E] text-sm transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
            <div className="flex flex-wrap items-center gap-2 bg-[#03151a] p-1.5 rounded-2xl border border-[#0b3d46]">
              {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((st) => (
                <button
                  key={st}
                  onClick={() => {
                    setStatusFilter(st);
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-colors cursor-pointer ${
                    statusFilter === st
                      ? 'bg-[#01A64E] text-white shadow-md shadow-[#01A64E]/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#072228]'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="px-3 py-2.5 rounded-2xl bg-[#03151a] border border-[#0b3d46] text-slate-300 text-xs font-semibold focus:outline-none focus:border-[#01A64E]"
            >
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
            </select>
          </div>
        </div>

        {/* EXHIBITORS DATA TABLE */}
        <div className="bg-[#072228] border border-[#0b3d46] rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="text-[11px] uppercase tracking-wider font-extrabold text-slate-400 border-b border-[#0b3d46] bg-[#03151a]">
                <tr>
                  <th className="py-4 px-6">Company & Contact</th>
                  <th className="py-4 px-6">Product / Category</th>
                  <th className="py-4 px-6">Stall Assignment</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#0b3d46] bg-[#072228]/50">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-500">
                      Loading exhibitors directory...
                    </td>
                  </tr>
                ) : exhibitors.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-500">
                      No matching exhibitor applications found.
                    </td>
                  </tr>
                ) : (
                  exhibitors.map((e: any) => (
                    <tr key={e.id} className="hover:bg-[#0b3d46]/30 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-bold text-white text-base">{e.companyName}</div>
                        <div className="text-xs text-slate-300 mt-0.5">{e.contactPerson}</div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">{e.email} · {e.phone}</div>
                      </td>
                      <td className="py-4 px-6 text-slate-300">
                        <div className="text-xs font-semibold">{e.productCategory || 'General Exhibition'}</div>
                        {e.website && (
                          <a
                            href={e.website.startsWith('http') ? e.website : `https://${e.website}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] text-[#79C143] hover:underline block mt-0.5 truncate max-w-[200px]"
                          >
                            {e.website}
                          </a>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        {editingStall?.id === e.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={editingStall?.stallNumber || ''}
                              onChange={(ev) =>
                                setEditingStall(editingStall ? { id: editingStall.id, stallNumber: ev.target.value } : null)
                              }
                              placeholder="e.g. A-102"
                              className="px-2 py-1 bg-[#03151a] border border-[#0b3d46] text-white text-xs rounded w-24"
                            />
                            <button
                              onClick={() => {
                                if (editingStall) {
                                  updateStatus(e.id, e.status, editingStall.stallNumber);
                                  setEditingStall(null);
                                }
                              }}
                              className="px-2 py-1 bg-emerald-500 text-slate-950 font-bold text-xs rounded cursor-pointer"
                            >
                              Save
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-emerald-400">
                              Stall: {e.stallNumber || 'Unassigned'}
                            </span>
                            <button
                              onClick={() => setEditingStall({ id: e.id, stallNumber: e.stallNumber || '' })}
                              className="text-slate-500 hover:text-slate-300 cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                        <div className="text-[11px] text-slate-400">Size: {e.stallSize || '3x3 Mtr'}</div>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`px-3 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1.5 ${
                            e.status === 'APPROVED'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : e.status === 'REJECTED'
                              ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                              : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {e.status === 'APPROVED' && <CheckCircle2 className="w-3.5 h-3.5" />}
                          {e.status === 'REJECTED' && <XCircle className="w-3.5 h-3.5" />}
                          {e.status === 'PENDING' && <Clock className="w-3.5 h-3.5" />}
                          <span>{e.status}</span>
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => updateStatus(e.id, 'APPROVED')}
                            className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 font-bold text-xs transition-colors cursor-pointer"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => updateStatus(e.id, 'REJECTED')}
                            className="px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white font-bold text-xs transition-colors cursor-pointer"
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION FOOTER */}
          <div className="p-6 bg-[#03151a] border-t border-[#0b3d46] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <div>
              Showing <span className="font-bold text-white">{rangeStart} - {rangeEnd}</span> of{' '}
              <span className="font-bold text-[#79C143]">{pagination.total.toLocaleString()}</span> exhibitor records
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1 || loading}
                onClick={() => setPage(page - 1)}
                className="p-2 rounded-xl bg-[#072228] border border-[#0b3d46] disabled:opacity-30 hover:bg-[#0b3d46] text-white cursor-pointer"
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
                className="p-2 rounded-xl bg-[#072228] border border-[#0b3d46] disabled:opacity-30 hover:bg-[#0b3d46] text-white cursor-pointer"
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
