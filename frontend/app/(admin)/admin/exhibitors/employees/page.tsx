'use client';

import { useState, useEffect } from 'react';
import { Users, Plus, Trash2, Search } from 'lucide-react';
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-6 rounded-3xl backdrop-blur-xl">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-400" />
            Exhibitor Staff & Employees Directory
          </h1>
          <p className="text-slate-400 text-xs mt-1">Manage staff badges allocated to registered exhibitors</p>
        </div>
      </div>

      <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-3xl">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Search exhibitor staff..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
          />
        </div>
      </div>

      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950 uppercase text-[10px] font-extrabold text-slate-400 border-b border-slate-800">
            <tr>
              <th className="py-3.5 px-4">Badge Code</th>
              <th className="py-3.5 px-4">Staff Member</th>
              <th className="py-3.5 px-4">Exhibitor Company</th>
              <th className="py-3.5 px-4">Contact Email</th>
              <th className="py-3.5 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80 bg-slate-900/40">
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
                <tr key={emp.id} className="hover:bg-slate-800/50">
                  <td className="py-4 px-4 font-mono font-bold text-emerald-400">{emp.badgeCode || 'EXHIBITOR-STAFF'}</td>
                  <td className="py-4 px-4 font-bold text-white">{emp.fullName}</td>
                  <td className="py-4 px-4 text-slate-300 font-semibold">{emp.companyName}</td>
                  <td className="py-4 px-4 text-slate-400">{emp.email}</td>
                  <td className="py-4 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
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
