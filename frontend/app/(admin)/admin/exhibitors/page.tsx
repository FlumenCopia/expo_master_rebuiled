'use client';

import { useEffect, useState } from 'react';
import { Building2, CheckCircle2, Clock, XCircle, Search, Edit3 } from 'lucide-react';
import { fetchApi } from '@/lib/api-client';
import AdminNavbar from '@/components/AdminNavbar';

export default function AdminExhibitorsPage() {
  const [exhibitors, setExhibitors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingStall, setEditingStall] = useState<{ id: string; stallNumber: string } | null>(null);

  const fetchExhibitors = async () => {
    setLoading(true);
    try {
      const data = await fetchApi<any>('/api/admin/exhibitors');
      setExhibitors(data.exhibitors || []);
    } catch (err) {
      console.error('Failed to fetch exhibitors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExhibitors();
  }, []);

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

  const [statusFilter, setStatusFilter] = useState('ALL');

  const filtered = exhibitors.filter((e) => {
    const matchesSearch =
      e.companyName.toLowerCase().includes(search.toLowerCase()) ||
      e.contactPerson.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-[#03151a] text-slate-100 font-sans selection:bg-[#01A64E] selection:text-white">
      {/* UNIFIED ADMIN NAVBAR */}
      <AdminNavbar onRefresh={fetchExhibitors} isRefreshing={loading} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#072228] border border-[#0b3d46] p-5 sm:p-6 rounded-3xl shadow-xl">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              <Building2 className="w-7 h-7 text-[#79C143]" />
              Exhibitors & Stall Booking Directory
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Review exhibitor applications, assign stall numbers, and manage approval status.
            </p>
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
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-2xl bg-[#03151a] border border-[#0b3d46] text-white placeholder-slate-500 focus:outline-none focus:border-[#01A64E] text-sm transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 bg-[#03151a] p-1.5 rounded-2xl border border-[#0b3d46] self-start md:self-auto">
            {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-colors ${
                  statusFilter === st
                    ? 'bg-[#01A64E] text-white shadow-md shadow-[#01A64E]/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#072228]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="text-[11px] uppercase tracking-wider font-extrabold text-slate-400 border-b border-slate-800 bg-slate-950/80">
                <tr>
                  <th className="py-4 px-6">Company Name</th>
                  <th className="py-4 px-6">Contact Person</th>
                  <th className="py-4 px-6">Stall Details</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Approval Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-500">
                      Loading exhibitors...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-500">
                      No exhibitors found matching criteria.
                    </td>
                  </tr>
                ) : (
                  filtered.map((e: any) => (
                    <tr key={e.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="py-4 px-6 font-bold text-white">
                        <div className="text-base">{e.companyName}</div>
                        <div className="text-xs text-slate-400 font-normal">{e.productCategory || 'Real Estate'}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-xs font-semibold text-slate-200">{e.contactPerson}</div>
                        <div className="text-[11px] text-slate-400">{e.email}</div>
                        <div className="text-[11px] text-slate-500">{e.phone}</div>
                      </td>
                      <td className="py-4 px-6">
                        {editingStall?.id === e.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={editingStall?.stallNumber || ''}
                              onChange={(evt) =>
                                setEditingStall((prev) => (prev ? { ...prev, stallNumber: evt.target.value } : null))
                              }
                              placeholder="e.g. A-12"
                              className="w-20 px-2 py-1 bg-slate-950 border border-slate-700 rounded text-xs text-white"
                            />
                            <button
                              onClick={() => {
                                if (editingStall) {
                                  updateStatus(e.id, e.status, editingStall.stallNumber);
                                  setEditingStall(null);
                                }
                              }}
                              className="px-2 py-1 bg-emerald-500 text-slate-950 font-bold text-xs rounded"
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
                              className="text-slate-500 hover:text-slate-300"
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
                            className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 font-bold text-xs transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => updateStatus(e.id, 'REJECTED')}
                            className="px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white font-bold text-xs transition-colors"
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
        </div>
      </main>
    </div>
  );
}
