'use client';

import { useState, useEffect } from 'react';
import { Download, RefreshCw, CheckCircle2 } from 'lucide-react';
import { fetchApi, API_BASE_URL } from '@/lib/api-client';
import { useAdminTheme } from '@/context/AdminThemeContext';

export default function AdminCheckinReportsPage() {
  const { isDark } = useAdminTheme();
  const [visitors, setVisitors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusTab, setStatusTab] = useState<'CHECKED_IN' | 'CHECKED_OUT'>('CHECKED_IN');

  const loadCheckinReport = async (status: string) => {
    setLoading(true);
    try {
      const data = await fetchApi<any>(`/api/admin/visitors?status=${status}&limit=200`);
      setVisitors(data.visitors || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCheckinReport(statusTab);
  }, [statusTab]);

  const tabConfig = {
    CHECKED_IN: { label: '🟢 Inside Now (Checked-In)', color: 'bg-emerald-500 text-slate-950' },
    CHECKED_OUT: { label: '🔴 Checked Out (Exit)', color: 'bg-rose-500 text-white' },
  };

  return (
    <div className="space-y-6">
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border p-6 rounded-3xl transition-colors ${
        isDark ? 'bg-[#131B2A] border-slate-800 text-white shadow-xl' : 'bg-white border-slate-200 text-slate-900 shadow-sm'
      }`}>
        <div>
          <h1 className={`text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <CheckCircle2 className="w-6 h-6 text-[#01A64E]" />
            Gate Checkin Entrance Audit Report
          </h1>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Live audit log of attendees verified at venue entrance gates</p>
        </div>
        <a
          href={`${API_BASE_URL}/api/admin/visitors?export=csv&status=${statusTab}`}
          className="px-4 py-2.5 rounded-xl bg-[#01A64E] hover:bg-[#79C143] text-white font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-[#01A64E]/20 self-start sm:self-auto shrink-0 whitespace-nowrap"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV</span>
        </a>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 flex-wrap">
        {(Object.keys(tabConfig) as Array<keyof typeof tabConfig>).map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusTab(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              statusTab === tab
                ? 'bg-[#01A64E] text-white shadow-xs'
                : isDark ? 'bg-[#131B2A] border border-slate-800 text-slate-400 hover:text-white' : 'bg-white border border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tabConfig[tab].label}
          </button>
        ))}
        <button
          onClick={() => loadCheckinReport(statusTab)}
          className={`px-3 py-2 rounded-xl border cursor-pointer ${
            isDark ? 'bg-[#131B2A] border-slate-800 text-slate-300 hover:text-white' : 'bg-white border-slate-300 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className={`admin-table-container custom-scrollbar border rounded-3xl overflow-hidden ${isDark ? 'bg-[#131B2A] border-slate-800 shadow-xl' : 'bg-white border-slate-200 shadow-sm'}`}>
        <table className="w-full text-left text-xs">
          <thead className={`uppercase text-[10px] font-extrabold border-b ${
            isDark ? 'bg-[#090D16] text-slate-400 border-slate-800' : 'bg-slate-50 text-slate-600 border-slate-200'
          }`}>
            <tr>
              <th className="py-3.5 px-4">Badge Code</th>
              <th className="py-3.5 px-4">Full Name</th>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4">Checked-In At</th>
              <th className="py-3.5 px-4">Gate Status</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${isDark ? 'divide-slate-800/80 bg-[#131B2A]' : 'divide-slate-100 bg-white'}`}>
            {loading ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-500">Loading records...</td>
              </tr>
            ) : visitors.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-500">No records for this status.</td>
              </tr>
            ) : (
              visitors.map((v: any) => (
                <tr key={v.id} className={`transition-colors ${isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50/80'}`}>
                  <td className="py-4 px-4 font-mono font-bold text-[#01A64E]">{v.badgeCode}</td>
                  <td className={`py-4 px-4 font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{v.fullName}</td>
                  <td className={`py-4 px-4 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{v.category}</td>
                  <td className={`py-4 px-4 font-mono text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {v.checkedInAt ? new Date(v.checkedInAt).toLocaleString() : '—'}
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                      v.status === 'CHECKED_IN'
                        ? isDark ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : v.status === 'ON_BREAK'
                        ? isDark ? 'bg-amber-500/10 text-amber-300 border-amber-500/30' : 'bg-amber-50 text-amber-700 border-amber-200'
                        : isDark ? 'bg-rose-500/10 text-rose-300 border-rose-500/30' : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                      {v.status === 'CHECKED_IN' ? 'INSIDE'
                        : v.status === 'ON_BREAK' ? 'ON BREAK'
                        : 'DEPARTED'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
