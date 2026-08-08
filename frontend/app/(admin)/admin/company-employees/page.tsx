'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { UserCheck, Plus, Trash2, Search, QrCode, Building2 } from 'lucide-react';
import { fetchApi } from '@/lib/api-client';
import { useAdminTheme } from '@/context/AdminThemeContext';
import Pagination from '@/components/Pagination';

export default function AdminCompanyEmployeesPage() {
  const { isDark } = useAdminTheme();
  const searchParams = useSearchParams();
  const initialCompany = searchParams?.get('company') || '';
  const initialExhibitorId = searchParams?.get('exhibitorId') || '';

  const [employees, setEmployees] = useState<any[]>([]);
  const [exhibitors, setExhibitors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialCompany);
  const [selectedExhibitorFilter, setSelectedExhibitorFilter] = useState(initialExhibitorId);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [stats, setStats] = useState({ total: 0 });

  const [showModal, setShowModal] = useState(false);
  const [fullName, setFullName] = useState('');
  const [selectedExhibitorId, setSelectedExhibitorId] = useState<string>('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [designation, setDesignation] = useState('');

  // Fetch Exhibitors list for selection & filtering
  const loadExhibitors = useCallback(async () => {
    try {
      const data = await fetchApi<any>('/api/admin/exhibitors?limit=200');
      if (data?.exhibitors) {
        setExhibitors(data.exhibitors);
      }
    } catch (err) {
      console.error('Failed to load exhibitors list:', err);
    }
  }, []);

  const loadEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        search,
        exhibitorId: selectedExhibitorFilter,
        page: String(page),
        limit: String(limit),
      });

      const data = await fetchApi<any>(`/api/admin/company-employees?${query.toString()}`);
      if (data) {
        setEmployees(data.employees || []);
        if (data.pagination) setPagination(data.pagination);
        if (data.stats) setStats(data.stats);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, selectedExhibitorFilter, page, limit]);

  useEffect(() => {
    loadExhibitors();
  }, [loadExhibitors]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadEmployees();
    }, 300);
    return () => clearTimeout(timer);
  }, [loadEmployees]);

  const handleExhibitorSelect = (exId: string) => {
    setSelectedExhibitorId(exId);
    if (!exId || exId === 'CUSTOM') {
      return;
    }
    const found = exhibitors.find((e) => e.id === exId);
    if (found) {
      setCompanyName(found.companyName);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchApi('/api/admin/company-employees', {
        method: 'POST',
        body: JSON.stringify({
          fullName,
          companyName,
          exhibitorId: selectedExhibitorId === 'CUSTOM' ? null : selectedExhibitorId || null,
          email,
          phone,
          designation,
        }),
      });
      setShowModal(false);
      setFullName('');
      setSelectedExhibitorId('');
      setCompanyName('');
      setEmail('');
      setPhone('');
      setDesignation('');
      loadEmployees();
    } catch (err: any) {
      alert(err.message || 'Failed to create employee');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this company employee?')) return;
    try {
      await fetchApi(`/api/admin/company-employees?id=${id}`, { method: 'DELETE' });
      loadEmployees();
    } catch (err: any) {
      alert(err.message || 'Failed to delete employee');
    }
  };

  const rangeStart = pagination.total === 0 ? 0 : (page - 1) * limit + 1;
  const rangeEnd = Math.min(page * limit, pagination.total);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border p-4 sm:p-6 rounded-3xl transition-colors ${
        isDark ? 'bg-[#131B2A] border-slate-800 text-white shadow-xl' : 'bg-white border-slate-200 text-slate-900 shadow-sm'
      }`}>
        <div>
          <h1 className={`text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <UserCheck className="w-6 h-6 text-[#01A64E]" />
            Exhibitor Staff &amp; Company Employees
          </h1>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Manage staff badges allocated to participating exhibitor companies</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl bg-[#01A64E] hover:bg-[#79C143] text-white font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto shadow-sm shadow-[#01A64E]/20 shrink-0 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Add Company Employee</span>
        </button>
      </div>

      {showModal && (
        <div className={`fixed inset-0 z-50 backdrop-blur-sm flex items-center justify-center p-4 ${isDark ? 'bg-black/70' : 'bg-slate-900/60'}`}>
          <div className={`border p-6 rounded-3xl max-w-md w-full space-y-4 shadow-xl ${
            isDark ? 'bg-[#131B2A] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <h2 className="text-lg font-black flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#01A64E]" /> Add Company Employee
            </h2>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className={`block mb-1 font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Select Exhibitor Company</label>
                <select
                  value={selectedExhibitorId}
                  onChange={(e) => handleExhibitorSelect(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-[#01A64E] ${
                    isDark ? 'bg-[#090D16] border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                >
                  <option value="">-- Choose Exhibitor Reference --</option>
                  {exhibitors.map((ex) => (
                    <option key={ex.id} value={ex.id}>
                      {ex.companyName} {ex.stallNumber ? `(Stall #${ex.stallNumber})` : ''}
                    </option>
                  ))}
                  <option value="CUSTOM">➕ Custom / Unlisted Company</option>
                </select>
              </div>

              <div>
                <label className={`block mb-1 font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Company Name</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Apex Solar Tech"
                  className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-[#01A64E] ${
                    isDark ? 'bg-[#090D16] border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                  }`}
                />
              </div>
              <div>
                <label className={`block mb-1 font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Rahul Varma"
                  className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-[#01A64E] ${
                    isDark ? 'bg-[#090D16] border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                  }`}
                />
              </div>
              <div>
                <label className={`block mb-1 font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rahul@apexsolar.com"
                  className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-[#01A64E] ${
                    isDark ? 'bg-[#090D16] border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                  }`}
                />
              </div>
              <div>
                <label className={`block mb-1 font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Phone</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 9876543210"
                  className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-[#01A64E] ${
                    isDark ? 'bg-[#090D16] border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                  }`}
                />
              </div>
              <div>
                <label className={`block mb-1 font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Designation</label>
                <input
                  type="text"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  placeholder="Senior Project Lead"
                  className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-[#01A64E] ${
                    isDark ? 'bg-[#090D16] border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                  }`}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className={`px-4 py-2 rounded-xl border font-bold cursor-pointer ${
                    isDark ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-[#01A64E] hover:bg-[#79C143] text-white font-bold cursor-pointer">
                  Save Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SEARCH BAR & STATS HEADER */}
      <div className={`border p-4 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-4 ${
        isDark ? 'bg-[#131B2A] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
      }`}>
        <div className="flex items-center gap-3 w-full md:w-auto flex-1">
          <div className="relative max-w-md w-full">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search employees by name, company, email, phone..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className={`w-full pl-9 pr-4 py-2 rounded-xl border text-xs focus:outline-none focus:border-[#01A64E] ${
                isDark ? 'bg-[#090D16] border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
              }`}
            />
          </div>

          <select
            value={selectedExhibitorFilter}
            onChange={(e) => {
              setSelectedExhibitorFilter(e.target.value);
              setPage(1);
            }}
            className={`px-3 py-2 rounded-xl border text-xs font-semibold focus:outline-none focus:border-[#01A64E] hidden sm:block max-w-[220px] truncate ${
              isDark ? 'bg-[#090D16] border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-700'
            }`}
          >
            <option value="">All Exhibitor Companies</option>
            {exhibitors.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.companyName}
              </option>
            ))}
          </select>
        </div>

        <div className={`flex items-center gap-3 text-xs shrink-0 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          <span>
            Total Registered: <strong className="text-[#01A64E]">{stats.total.toLocaleString()}</strong> employees
          </span>
          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold focus:outline-none focus:border-[#01A64E] ${
              isDark ? 'bg-[#090D16] border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-700'
            }`}
          >
            <option value={10}>10 per page</option>
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
          </select>
        </div>
      </div>

      {/* EMPLOYEES DATA TABLE */}
      <div className={`admin-table-container custom-scrollbar border rounded-3xl overflow-hidden ${isDark ? 'bg-[#131B2A] border-slate-800 shadow-xl' : 'bg-white border-slate-200 shadow-sm'}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className={`uppercase text-[10px] font-extrabold border-b ${
              isDark ? 'bg-[#090D16] text-slate-400 border-slate-800' : 'bg-slate-50 text-slate-600 border-slate-200'
            }`}>
              <tr>
                <th className="py-3.5 px-4">Badge Code</th>
                <th className="py-3.5 px-4">Full Name &amp; Designation</th>
                <th className="py-3.5 px-4">Exhibitor / Company</th>
                <th className="py-3.5 px-4">Email / Phone</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-slate-800/80 bg-[#131B2A]' : 'divide-slate-100 bg-white'}`}>
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    Loading company employees...
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    No matching company employees found.
                  </td>
                </tr>
              ) : (
                employees.map((emp: any) => (
                  <tr key={emp.id} className={`transition-colors ${isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50/80'}`}>
                    <td className="py-4 px-4 font-mono font-bold text-[#01A64E]">{emp.badgeCode || 'EXPO-STAFF'}</td>
                    <td className="py-4 px-4">
                      <div className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{emp.fullName}</div>
                      {emp.designation && <div className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{emp.designation}</div>}
                    </td>
                    <td className="py-4 px-4">
                      <div className={`font-semibold flex items-center gap-1.5 ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>
                        <span>{emp.companyName}</span>
                        {emp.exhibitor?.stallNumber && (
                          <span className={`font-mono text-[10px] border px-2 py-0.5 rounded font-bold ${
                            isDark ? 'bg-emerald-500/10 text-[#79C143] border-emerald-500/30' : 'bg-emerald-50 text-[#01A64E] border-emerald-200'
                          }`}>
                            Stall #{emp.exhibitor.stallNumber}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className={`py-4 px-4 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      <div>{emp.email}</div>
                      <div className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>{emp.phone}</div>
                    </td>
                    <td className="py-4 px-4 text-right flex items-center justify-end gap-2">
                      {emp.badgeCode && (
                        <a
                          href={`/badge/${emp.badgeCode}`}
                          target="_blank"
                          rel="noreferrer"
                          className={`px-2.5 py-1 rounded-lg border text-xs font-bold flex items-center gap-1 transition-colors ${
                            isDark ? 'bg-emerald-500/10 text-[#79C143] border-emerald-500/30 hover:bg-[#01A64E] hover:text-white' : 'bg-emerald-50 text-[#01A64E] border-emerald-200 hover:bg-[#01A64E] hover:text-white'
                          }`}
                          title="View & Print Staff Badge Pass"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span>Badge</span>
                        </a>
                      )}
                      <button
                        onClick={() => handleDelete(emp.id)}
                        className={`p-1.5 rounded-lg border cursor-pointer ${
                          isDark ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border-rose-500/30' : 'bg-rose-50 text-rose-600 hover:bg-rose-100 border-rose-200'
                        }`}
                        title="Delete Employee"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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
