'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Building2, Search, CheckCircle2, XCircle, Clock, Edit3, Users,
} from 'lucide-react';
import { fetchApi } from '@/lib/api-client';
import { useAdminTheme } from '@/context/AdminThemeContext';
import Pagination from '@/components/Pagination';

export default function AdminExhibitorsPage() {
  const { isDark } = useAdminTheme();
  const [exhibitors, setExhibitors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [stats, setStats] = useState({ total: 0, approved: 0, pending: 0, rejected: 0 });

  const [editingStall, setEditingStall] = useState<{ id: string; stallNumber: string } | null>(null);

  const loadExhibitors = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        search,
        status: statusFilter,
        page: String(page),
        limit: String(limit),
      });

      const data = await fetchApi<any>(`/api/admin/exhibitors?${query.toString()}`);
      if (data) {
        setExhibitors(data.exhibitors || []);
        if (data.pagination) setPagination(data.pagination);
        if (data.stats) setStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to load exhibitors:', err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page, limit]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadExhibitors();
    }, 300);
    return () => clearTimeout(timer);
  }, [loadExhibitors]);

  const updateStatus = async (id: string, status: string) => {
    try {
      await fetchApi<any>(`/api/admin/exhibitors/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      loadExhibitors();
    } catch (err) {
      console.error(err);
    }
  };

  const updateStallNumber = async (id: string, stallNumber: string) => {
    try {
      await fetchApi<any>(`/api/admin/exhibitors/${id}/stall`, {
        method: 'PATCH',
        body: JSON.stringify({ stallNumber }),
      });
      setEditingStall(null);
      loadExhibitors();
    } catch (err) {
      console.error(err);
    }
  };

  const rangeStart = pagination.total === 0 ? 0 : (page - 1) * limit + 1;
  const rangeEnd = Math.min(page * limit, pagination.total);

  return (
    <div className="space-y-6">
      {/* HEADER CARD */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border p-6 rounded-3xl transition-colors ${
        isDark ? 'bg-[#131B2A] border-slate-800 text-white shadow-xl' : 'bg-white border-slate-200 text-slate-900 shadow-sm'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center font-bold ${
            isDark ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-[#01A64E]'
          }`}>
            <Building2 className="w-7 h-7" />
          </div>
          <div>
            <h1 className={`font-black text-xl sm:text-2xl flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Exhibitor Management
            </h1>
            <p className={`text-xs sm:text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Approve Applications, Assign Stalls &amp; Manage Exhibitor Pass Allocations</p>
          </div>
        </div>
      </div>

      {/* STATS OVERVIEW CHIPS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className={`border rounded-2xl p-4 text-center ${isDark ? 'bg-[#131B2A] border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
          <div className="text-2xl font-black text-[#01A64E]">{stats.total.toLocaleString()}</div>
          <div className={`text-[11px] font-bold uppercase tracking-wider mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Total Companies</div>
        </div>
        <div className={`border rounded-2xl p-4 text-center ${isDark ? 'bg-[#131B2A] border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
          <div className="text-2xl font-black text-emerald-500">{stats.approved.toLocaleString()}</div>
          <div className={`text-[11px] font-bold uppercase tracking-wider mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Approved Stalls</div>
        </div>
        <div className={`border rounded-2xl p-4 text-center ${isDark ? 'bg-[#131B2A] border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
          <div className="text-2xl font-black text-amber-500">{stats.pending.toLocaleString()}</div>
          <div className={`text-[11px] font-bold uppercase tracking-wider mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Pending Review</div>
        </div>
        <div className={`border rounded-2xl p-4 text-center ${isDark ? 'bg-[#131B2A] border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
          <div className="text-2xl font-black text-rose-500">{stats.rejected.toLocaleString()}</div>
          <div className={`text-[11px] font-bold uppercase tracking-wider mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Rejected</div>
        </div>
      </div>

      {/* SEARCH AND FILTERS */}
      <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 border p-4 rounded-2xl ${
        isDark ? 'bg-[#131B2A] border-slate-800 shadow-xl' : 'bg-white border-slate-200 shadow-xs'
      }`}>
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search company, contact, category..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-[#01A64E] transition-all ${
              isDark ? 'bg-[#090D16] border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
            }`}
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
          {(['ALL', 'APPROVED', 'PENDING', 'REJECTED'] as const).map((status) => (
            <button
              key={status}
              onClick={() => {
                setStatusFilter(status);
                setPage(1);
              }}
              className={`flex-1 sm:flex-initial px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === status
                  ? 'bg-[#01A64E] text-white shadow-xs'
                  : isDark ? 'bg-[#090D16] border border-slate-700 text-slate-400 hover:text-white' : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-300'
              }`}
            >
              {status === 'ALL' ? 'All Applications' : status === 'APPROVED' ? '✅ Approved' : status === 'PENDING' ? '⏳ Pending' : '❌ Rejected'}
            </button>
          ))}

          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
            className={`px-3 py-2 rounded-xl border text-xs font-semibold focus:outline-none focus:border-[#01A64E] ${
              isDark ? 'bg-[#090D16] border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-700'
            }`}
          >
            <option value={10}>10 per page</option>
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
          </select>
        </div>
      </div>

      {/* EXHIBITORS DATA TABLE */}
      <div className={`admin-table-container custom-scrollbar border rounded-3xl overflow-hidden ${isDark ? 'bg-[#131B2A] border-slate-800 shadow-xl' : 'bg-white border-slate-200 shadow-sm'}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className={`text-[11px] uppercase tracking-wider font-extrabold border-b ${
              isDark ? 'bg-[#090D16] text-slate-400 border-slate-800' : 'bg-slate-50 text-slate-600 border-slate-200'
            }`}>
              <tr>
                <th className="py-4 px-6">Company &amp; Contact</th>
                <th className="py-4 px-6">Product / Category</th>
                <th className="py-4 px-6">Stall Assignment</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y font-medium ${isDark ? 'divide-slate-800/80 bg-[#131B2A]' : 'divide-slate-100 bg-white'}`}>
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
                  <tr key={e.id} className={`transition-colors ${isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50/80'}`}>
                    <td className="py-4 px-6">
                      <div className={`font-bold text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>{e.companyName}</div>
                      <div className={`text-xs mt-0.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{e.contactPerson}</div>
                      <div className={`text-[11px] font-mono mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{e.email} · {e.phone}</div>
                    </td>
                    <td className={`py-4 px-6 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      <div className="text-xs font-semibold">{e.productCategory || 'General Exhibition'}</div>
                      {e.website && (
                        <a
                          href={e.website.startsWith('http') ? e.website : `https://${e.website}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-[#01A64E] hover:underline block mt-0.5 truncate max-w-[200px]"
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
                            className={`px-2 py-1 border text-xs rounded w-24 focus:outline-none focus:border-[#01A64E] ${
                              isDark ? 'bg-[#090D16] border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                            }`}
                          />
                          <button
                            onClick={() => editingStall && updateStallNumber(e.id, editingStall.stallNumber)}
                            className="px-2 py-1 rounded bg-[#01A64E] text-white text-xs font-bold cursor-pointer"
                          >
                            Save
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className={`font-mono text-xs font-bold ${e.stallNumber ? (isDark ? 'text-emerald-400' : 'text-[#01A64E]') : (isDark ? 'text-slate-500' : 'text-slate-400')}`}>
                            {e.stallNumber ? `Stall #${e.stallNumber}` : 'Not Assigned'}
                          </span>
                          <button
                            onClick={() => setEditingStall({ id: e.id, stallNumber: e.stallNumber || '' })}
                            className={`p-1 rounded transition-colors ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-slate-700'}`}
                            title="Edit Stall Number"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-3 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1.5 border ${
                          e.status === 'APPROVED'
                            ? isDark ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : e.status === 'REJECTED'
                            ? isDark ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' : 'bg-rose-50 text-rose-700 border-rose-200'
                            : isDark ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-amber-50 text-amber-700 border-amber-200'
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
                        <Link
                          href={`/admin/company-employees?exhibitorId=${e.id}&company=${encodeURIComponent(e.companyName)}`}
                          className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-colors inline-flex items-center gap-1.5 ${
                            isDark ? 'bg-[#090D16] border-slate-700 text-slate-200 hover:bg-slate-800' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                          }`}
                          title="View &amp; Manage Staff Badges for this Exhibitor"
                        >
                          <Users className="w-3.5 h-3.5 text-[#01A64E]" />
                          <span>Staff</span>
                          {e._count?.employees !== undefined && (
                            <span className="bg-[#01A64E] text-white px-1.5 py-0.2 rounded-full text-[10px] font-black">
                              {e._count.employees}
                            </span>
                          )}
                        </Link>
                        <button
                          onClick={() => updateStatus(e.id, 'APPROVED')}
                          className={`px-3 py-1.5 rounded-xl border font-bold text-xs transition-colors cursor-pointer ${
                            isDark ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-[#01A64E] hover:text-white' : 'bg-emerald-50 border-emerald-200 text-[#01A64E] hover:bg-[#01A64E] hover:text-white'
                          }`}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => updateStatus(e.id, 'REJECTED')}
                          className={`px-3 py-1.5 rounded-xl border font-bold text-xs transition-colors cursor-pointer ${
                            isDark ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20' : 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-600 hover:text-white'
                          }`}
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
        <div className={`p-4 border-t ${isDark ? 'bg-[#090D16] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
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
  );
}
