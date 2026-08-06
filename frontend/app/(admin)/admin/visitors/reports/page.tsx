'use client';

import { useState, useEffect } from 'react';
import { FileSpreadsheet, Download, RefreshCw } from 'lucide-react';
import { fetchApi, API_BASE_URL } from '@/lib/api-client';

export default function AdminVisitorReportsPage() {
  const [visitors, setVisitors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('ALL');

  const loadReport = async () => {
    setLoading(true);
    try {
      const data = await fetchApi<any>(`/api/admin/visitors?category=${category}&limit=100`);
      setVisitors(data.visitors || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [category]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-6 rounded-3xl backdrop-blur-xl">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-emerald-400" />
            Visitor Analytics & Reports
          </h1>
          <p className="text-slate-400 text-xs mt-1">Generate and download custom registration reports</p>
        </div>
        <button
          onClick={() => {
            const token = typeof window !== 'undefined' ? localStorage.getItem('expo_admin_token') || '' : '';
            window.open(
              `${API_BASE_URL}/api/admin/visitors?export=csv&category=${category}&token=${encodeURIComponent(token)}`,
              '_blank'
            );
          }}
          className="px-4 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-extrabold text-xs flex items-center gap-2 hover:bg-emerald-400 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV Report</span>
        </button>
      </div>

      <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-3xl flex items-center gap-4">
        <span className="text-xs text-slate-400 font-bold">Category Filter:</span>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
        >
          <option value="ALL">All Categories</option>
          <option value="VISITOR">Visitor</option>
          <option value="DELEGATE">Delegate</option>
          <option value="VIP">VIP</option>
          <option value="EXHIBITOR">Exhibitor</option>
        </select>
        <button
          onClick={loadReport}
          className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
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
              <th className="py-3.5 px-4">Email</th>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80 bg-slate-900/40">
            {loading ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-500">
                  Generating report...
                </td>
              </tr>
            ) : visitors.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-500">
                  No records match selected filter.
                </td>
              </tr>
            ) : (
              visitors.map((v: any) => (
                <tr key={v.id} className="hover:bg-slate-800/50">
                  <td className="py-4 px-4 font-mono font-bold text-emerald-400">{v.badgeCode}</td>
                  <td className="py-4 px-4 font-bold text-white">{v.fullName}</td>
                  <td className="py-4 px-4 text-slate-300">{v.email}</td>
                  <td className="py-4 px-4 text-slate-300">{v.category}</td>
                  <td className="py-4 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {v.status}
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
