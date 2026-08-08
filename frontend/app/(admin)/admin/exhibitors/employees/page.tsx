'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, Search, ArrowRight, QrCode } from 'lucide-react';
import { fetchApi } from '@/lib/api-client';

export default function AdminExhibitorEmployeesPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const data = await fetchApi<any>('/api/admin/company-employees');
      setEmployees(data.employees || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const filtered = employees.filter(
    (e) =>
      e.fullName.toLowerCase().includes(search.toLowerCase()) ||
      e.companyName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-[#01A64E]" />
            Exhibitor Staff &amp; Employees Directory
          </h1>
          <p className="text-slate-500 text-xs mt-1">Manage staff badges allocated to registered exhibitors</p>
        </div>

        <Link
          href="/admin/company-employees"
          className="px-4 py-2.5 rounded-xl bg-[#01A64E] hover:bg-[#79C143] text-white font-extrabold text-xs flex items-center gap-2 shadow-sm shadow-[#01A64E]/20"
        >
          <span>Open Full Staff Manager</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="bg-white border border-slate-200 p-4 rounded-3xl shadow-xs">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search exhibitor staff by name or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-[#01A64E]"
          />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 uppercase text-[10px] font-extrabold text-slate-600 border-b border-slate-200">
            <tr>
              <th className="py-3.5 px-4">Badge Code</th>
              <th className="py-3.5 px-4">Staff Member</th>
              <th className="py-3.5 px-4">Exhibitor Company</th>
              <th className="py-3.5 px-4">Contact Email</th>
              <th className="py-3.5 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {loading ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-500">
                  Loading exhibitor employees...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-500">
                  No exhibitor staff records found.
                </td>
              </tr>
            ) : (
              filtered.map((emp: any) => (
                <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-4 font-mono font-bold text-[#01A64E]">{emp.badgeCode || 'EXHIBITOR-STAFF'}</td>
                  <td className="py-4 px-4 font-bold text-slate-900">{emp.fullName}</td>
                  <td className="py-4 px-4 text-slate-700 font-semibold">{emp.companyName}</td>
                  <td className="py-4 px-4 text-slate-600">{emp.email}</td>
                  <td className="py-4 px-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      ALLOCATED
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
