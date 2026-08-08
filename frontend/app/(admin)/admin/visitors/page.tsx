'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Search, Download, RefreshCw, QrCode, Users, Trash2 } from 'lucide-react';
import { fetchApi, API_BASE_URL } from '@/lib/api-client';
import { useAdminTheme } from '@/context/AdminThemeContext';
import { useToast } from '@/context/ToastContext';
import Pagination from '@/components/Pagination';
import ConfirmModal from '@/components/ConfirmModal';

export default function AdminVisitorsPage() {
  const { isDark } = useAdminTheme();
  const { success: toastSuccess, error: toastError } = useToast();
  const [visitors, setVisitors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  // Confirm Modal State
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

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
    } catch (err: any) {
      toastError(err.message || 'Failed to load visitor records', 'Data Load Error');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, categoryFilter, page, limit, toastError]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchVisitors();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchVisitors]);

  const confirmDeleteVisitor = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await fetchApi(`/api/admin/visitors?id=${deleteTarget.id}`, { method: 'DELETE' });
      toastSuccess(`Visitor "${deleteTarget.name}" deleted successfully`, 'Visitor Deleted');
      setDeleteTarget(null);
      fetchVisitors();
    } catch (err: any) {
      toastError(err.message || 'Failed to delete visitor', 'Delete Error');
    } finally {
      setDeleting(false);
    }
  };

  const rangeStart = pagination.total === 0 ? 0 : (page - 1) * limit + 1;
  const rangeEnd = Math.min(page * limit, pagination.total);

  return (
    <div className="space-y-6">
      {/* HEADER & EXPORT BAR */}
      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 border p-6 rounded-3xl transition-colors ${
        isDark ? 'bg-[#131B2A] border-slate-800 text-white shadow-xl' : 'bg-white border-slate-200 text-slate-900 shadow-sm'
      }`}>
        <div>
          <h1 className={`text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <Users className="w-7 h-7 text-[#01A64E]" />
            Visitors Master Directory
          </h1>
          <p className={`text-xs sm:text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
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
          className="px-5 py-3 rounded-2xl bg-[#01A64E] hover:bg-[#79C143] text-white font-black text-xs sm:text-sm transition-all flex items-center gap-2 shadow-sm shadow-[#01A64E]/20 active:scale-[0.98] self-start md:self-auto shrink-0 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Export Filtered CSV</span>
        </button>
      </div>

      {/* SEARCH & FILTER CONTROLS */}
      <div className={`border p-4 sm:p-6 rounded-3xl flex flex-col md:flex-row gap-4 justify-between items-center ${
        isDark ? 'bg-[#131B2A] border-slate-800 shadow-xl' : 'bg-white border-slate-200 shadow-xs'
      }`}>
        <div className="relative w-full md:w-96">
          <Search className="w-5 h-5 absolute left-4 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, phone, company, or badge code..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className={`w-full pl-12 pr-4 py-3 rounded-2xl border text-sm transition-colors focus:outline-none focus:border-[#01A64E] ${
              isDark ? 'bg-[#090D16] border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
            }`}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className={`px-4 py-3 rounded-2xl border text-xs font-semibold focus:outline-none focus:border-[#01A64E] ${
              isDark ? 'bg-[#090D16] border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
            }`}
          >
            <option value="ALL">All Statuses</option>
            <option value="REGISTERED">🟡 Registered</option>
            <option value="CHECKED_IN">🟢 Checked-In (Inside)</option>
            <option value="CHECKED_OUT">🔴 Checked-Out (Left)</option>
            <option value="CANCELLED">⛔ Cancelled</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            className={`px-4 py-3 rounded-2xl border text-xs font-semibold focus:outline-none focus:border-[#01A64E] ${
              isDark ? 'bg-[#090D16] border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
            }`}
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
            className={`px-4 py-3 rounded-2xl border text-xs font-semibold focus:outline-none focus:border-[#01A64E] ${
              isDark ? 'bg-[#090D16] border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
            }`}
          >
            <option value={10}>10 per page</option>
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
          </select>

          <button
            onClick={fetchVisitors}
            className={`p-3 rounded-2xl border cursor-pointer transition-colors ${
              isDark ? 'bg-[#090D16] border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800' : 'bg-white border-slate-300 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* VISITORS DATA TABLE */}
      <div className={`admin-table-container custom-scrollbar border rounded-3xl overflow-hidden ${isDark ? 'bg-[#131B2A] border-slate-800 shadow-xl' : 'bg-white border-slate-200 shadow-sm'}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className={`text-[11px] uppercase tracking-wider font-extrabold border-b ${
              isDark ? 'bg-[#090D16] text-slate-400 border-slate-800' : 'bg-slate-50 text-slate-600 border-slate-200'
            }`}>
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
            <tbody className={`divide-y font-medium ${isDark ? 'divide-slate-800/80 bg-[#131B2A]' : 'divide-slate-100 bg-white'}`}>
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    Loading attendee records...
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
                  <tr key={v.id} className={`transition-colors ${isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50/80'}`}>
                    <td className="py-4 px-6 font-mono text-xs font-bold text-[#01A64E]">{v.badgeCode}</td>
                    <td className={`py-4 px-6 font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{v.fullName}</td>
                    <td className={`py-4 px-6 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      <div className={`text-xs ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>{v.email}</div>
                      <div className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{v.phone}</div>
                    </td>
                    <td className={`py-4 px-6 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      <div className={`text-xs font-medium ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{v.company || '—'}</div>
                      <div className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{v.city || 'Kerala'}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border ${
                        isDark ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-100 border-slate-200 text-slate-700'
                      }`}>
                        {v.category}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-3 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1.5 border ${
                          v.status === 'CHECKED_IN'
                            ? isDark ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : v.status === 'ON_BREAK'
                            ? isDark ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-amber-50 text-amber-700 border-amber-200'
                            : v.status === 'CHECKED_OUT'
                            ? isDark ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' : 'bg-rose-50 text-rose-700 border-rose-200'
                            : isDark ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            v.status === 'CHECKED_IN'
                              ? 'bg-emerald-500'
                              : v.status === 'ON_BREAK'
                              ? 'bg-amber-500'
                              : v.status === 'CHECKED_OUT'
                              ? 'bg-rose-500'
                              : 'bg-blue-500'
                          }`}
                        />
                        <span>{v.status === 'CHECKED_IN' ? 'CHECKED IN' : v.status}</span>
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {v.badgeCode && (
                          <Link
                            href={`/badge/${v.badgeCode}`}
                            target="_blank"
                            className={`px-3 py-1.5 rounded-xl border font-extrabold text-xs flex items-center gap-1.5 transition-colors ${
                              isDark ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-[#01A64E] hover:text-white' : 'bg-emerald-50 border-emerald-200 text-[#01A64E] hover:bg-[#01A64E] hover:text-white'
                            }`}
                          >
                            <QrCode className="w-3.5 h-3.5" />
                            <span>Badge</span>
                          </Link>
                        )}

                        <button
                          onClick={() => setDeleteTarget({ id: v.id, name: v.fullName })}
                          className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                            isDark ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20' : 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100'
                          }`}
                          title="Delete Visitor Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className={`p-4 border-t ${isDark ? 'bg-[#090D16] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
          <Pagination
            currentPage={page}
            totalPages={pagination.totalPages}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      </div>

      {/* CONFIRMATION MODAL FOR DANGEROUS DELETION */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Visitor Record?"
        message={`Are you sure you want to permanently delete visitor "${deleteTarget?.name}"? This action cannot be undone and will remove their gate pass.`}
        confirmText="Yes, Permanently Delete"
        variant="danger"
        loading={deleting}
        onConfirm={confirmDeleteVisitor}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
