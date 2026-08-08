'use client';

import { useState, useEffect } from 'react';
import { FolderGit2, Plus, Trash2 } from 'lucide-react';
import { fetchApi } from '@/lib/api-client';
import { useAdminTheme } from '@/context/AdminThemeContext';

export default function AdminMastersPage() {
  const { isDark } = useAdminTheme();
  const [masters, setMasters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [type, setType] = useState('CATEGORY');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');

  const loadMasters = async () => {
    setLoading(true);
    try {
      const data = await fetchApi<any>('/api/admin/masters');
      setMasters(data.masters || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMasters();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchApi<any>('/api/admin/masters', {
        method: 'POST',
        body: JSON.stringify({ type, name, code }),
      });
      setName('');
      setCode('');
      setShowModal(false);
      loadMasters();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border p-6 rounded-3xl transition-colors ${
        isDark ? 'bg-[#131B2A] border-slate-800 text-white shadow-xl' : 'bg-white border-slate-200 text-slate-900 shadow-sm'
      }`}>
        <div>
          <h1 className={`text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <FolderGit2 className="w-6 h-6 text-[#01A64E]" />
            Masters Data Management
          </h1>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Configure categories, halls, gate locations, and designations</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl bg-[#01A64E] hover:bg-[#79C143] text-white font-extrabold text-xs flex items-center gap-2 cursor-pointer shadow-sm shadow-[#01A64E]/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add Master Item</span>
        </button>
      </div>

      {showModal && (
        <div className={`fixed inset-0 z-50 backdrop-blur-sm flex items-center justify-center p-4 ${isDark ? 'bg-black/70' : 'bg-slate-900/60'}`}>
          <div className={`border p-6 rounded-3xl max-w-md w-full space-y-4 shadow-xl ${
            isDark ? 'bg-[#131B2A] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <h2 className="text-lg font-black">Add Master Item</h2>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className={`block mb-1 font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Master Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-[#01A64E] ${
                    isDark ? 'bg-[#090D16] border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                >
                  <option value="CATEGORY">Category</option>
                  <option value="HALL">Hall Location</option>
                  <option value="GATE">Gate Entrance</option>
                  <option value="DESIGNATION">Designation</option>
                </select>
              </div>
              <div>
                <label className={`block mb-1 font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Master Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. VIP Delegate"
                  className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-[#01A64E] ${
                    isDark ? 'bg-[#090D16] border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                  }`}
                />
              </div>
              <div>
                <label className={`block mb-1 font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Code / Alias</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. VIP-01"
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
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className={`border rounded-3xl overflow-hidden ${isDark ? 'bg-[#131B2A] border-slate-800 shadow-xl' : 'bg-white border-slate-200 shadow-sm'}`}>
        <table className="w-full text-left text-xs">
          <thead className={`uppercase text-[10px] font-extrabold border-b ${
            isDark ? 'bg-[#090D16] text-slate-400 border-slate-800' : 'bg-slate-50 text-slate-600 border-slate-200'
          }`}>
            <tr>
              <th className="py-3.5 px-4">Master Type</th>
              <th className="py-3.5 px-4">Name</th>
              <th className="py-3.5 px-4">Code</th>
              <th className="py-3.5 px-4">Status</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${isDark ? 'divide-slate-800/80 bg-[#131B2A]' : 'divide-slate-100 bg-white'}`}>
            {loading ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-slate-500">
                  Loading masters...
                </td>
              </tr>
            ) : masters.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-slate-500">
                  No master records configured yet.
                </td>
              </tr>
            ) : (
              masters.map((m: any) => (
                <tr key={m.id} className={`transition-colors ${isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50/80'}`}>
                  <td className="py-4 px-4 text-[#01A64E] font-bold">{m.type}</td>
                  <td className={`py-4 px-4 font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{m.name}</td>
                  <td className={`py-4 px-4 font-mono ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{m.code || '—'}</td>
                  <td className="py-4 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                      isDark ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' : 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                    }`}>
                      {m.status}
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
