'use client';

import { useState, useEffect } from 'react';
import { Download, RefreshCw, CheckCircle2 } from 'lucide-react';
import { fetchApi, API_BASE_URL } from '@/lib/api-client';

export default function AdminCheckinReportsPage() {
  const [visitors, setVisitors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusTab, setStatusTab] = useState<'CHECKED_IN' | 'ON_BREAK' | 'CHECKED_OUT'>('CHECKED_IN');

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
    CHECKED_IN: { label: '✅ Inside Now', color: 'bg-emerald-500 text-slate-950' },
    ON_BREAK: { label: '☕ On Break', color: 'bg-amber-500 text-slate-950' },
    CHECKED_OUT: { label: '🔴 Checked Out', color: 'bg-rose-500 text-white' },
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-6 rounded-3xl backdrop-blur-xl">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            Gate Checkin Entrance Audit Report
          </h1>
          <p className="text-slate-400 text-xs mt-1">Live audit log of attendees verified at venue entrance gates</p>
        </div>
        <a
          href={`${API_BASE_URL}/api/admin/visitors?export=csv&status=${statusTab}`}
          className="px-4 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-extrabold text-xs flex items-center gap-2 hover:bg-emerald-400"
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
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
              statusTab === tab
                ? tabConfig[tab].color + ' shadow-lg'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
            }`}
          >
            {tabConfig[tab].label}
          </button>
        ))}
        <button
          onClick={() => loadCheckinReport(statusTab)}
          className="px-3 py-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950 uppercase text-[10px] font-extrabold text-slate-400 border-b border-slate-800">
            <tr>
              <th className="py-3.5 px-4">Badge Code</th>
              <th className="py-3.5 px-4">Full Name</th>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4">Checked-In At</th>
              <th className="py-3.5 px-4">Gate Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80 bg-slate-900/40">
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
                <tr key={v.id} className="hover:bg-slate-800/50">
                  <td className="py-4 px-4 font-mono font-bold text-emerald-400">{v.badgeCode}</td>
                  <td className="py-4 px-4 font-bold text-white">{v.fullName}</td>
                  <td className="py-4 px-4 text-slate-300">{v.category}</td>
                  <td className="py-4 px-4 text-slate-400 font-mono text-[11px]">
                    {v.checkedInAt ? new Date(v.checkedInAt).toLocaleString() : '—'}
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      v.status === 'CHECKED_IN'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : v.status === 'ON_BREAK'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}>
                      {v.status === 'CHECKED_IN' ? '✅ INSIDE'
                        : v.status === 'ON_BREAK' ? '☕ ON BREAK'
                        : '🔴 DEPARTED'}
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
