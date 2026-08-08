'use client';

import { useState, useEffect } from 'react';
import { FileSpreadsheet, Download, RefreshCw } from 'lucide-react';
import { fetchApi, API_BASE_URL } from '@/lib/api-client';
import { useAdminTheme } from '@/context/AdminThemeContext';

export default function AdminVisitorReportsPage() {
  const { isDark } = useAdminTheme();
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
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border p-6 rounded-3xl transition-colors ${
        isDark ? 'bg-[#131B2A] border-slate-800 text-white shadow-xl' : 'bg-white border-slate-200 text-slate-900 shadow-sm'
      }`}>
        <div>
          <h1 className={`text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <FileSpreadsheet className="w-6 h-6 text-[#01A64E]" />
            Visitor Analytics &amp; Reports
          </h1>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Generate and download custom registration reports</p>
        </div>
        <button
          onClick={() => {
            const token = typeof window !== 'undefined' ? localStorage.getItem('expo_admin_token') || '' : '';
            window.open(
              `${API_BASE_URL}/api/admin/visitors?export=csv&category=${category}&token=${encodeURIComponent(token)}`,
              '_blank'
            );
          }}
          className="px-4 py-2.5 rounded-xl bg-[#01A64E] hover:bg-[#79C143] text-white font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-[#01A64E]/20 self-start sm:self-auto shrink-0 whitespace-nowrap"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV Report</span>
        </button>
      </div>

      <div className={`border p-4 rounded-3xl flex items-center gap-4 ${
        isDark ? 'bg-[#131B2A] border-slate-800 shadow-xl' : 'bg-white border-slate-200 shadow-xs'
      }`}>
        <span className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Category Filter:</span>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={`px-3 py-2 rounded-xl border text-xs focus:outline-none focus:border-[#01A64E] ${
            isDark ? 'bg-[#090D16] border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
          }`}
        >
          <option value="ALL">All Categories</option>
          <option value="VISITOR">Visitor</option>
          <option value="DELEGATE">Delegate</option>
          <option value="VIP">VIP</option>
          <option value="EXHIBITOR">Exhibitor</option>
        </select>
        <button
          onClick={loadReport}
          className={`p-2 rounded-xl border cursor-pointer ${
            isDark ? 'bg-[#090D16] border-slate-700 text-slate-300 hover:text-white' : 'bg-white border-slate-300 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
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
              <th className="py-3.5 px-4">Email</th>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4">Status</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${isDark ? 'divide-slate-800/80 bg-[#131B2A]' : 'divide-slate-100 bg-white'}`}>
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
                <tr key={v.id} className={`transition-colors ${isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50/80'}`}>
                  <td className="py-4 px-4 font-mono font-bold text-[#01A64E]">{v.badgeCode}</td>
                  <td className={`py-4 px-4 font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{v.fullName}</td>
                  <td className={`py-4 px-4 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{v.email}</td>
                  <td className={`py-4 px-4 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{v.category}</td>
                  <td className="py-4 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                      isDark ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' : 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                    }`}>
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
