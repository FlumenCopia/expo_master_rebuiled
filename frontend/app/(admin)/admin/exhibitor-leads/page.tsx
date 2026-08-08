'use client';

import React, { useState, useEffect, useRef } from 'react';
import { QrCode, Download, Star, Filter, Search, UserCheck, Flame, Thermometer, Snowflake, Edit3, Check, RefreshCw } from 'lucide-react';
import { useAdminTheme } from '@/context/AdminThemeContext';
import { useToast } from '@/context/ToastContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { fetchApi, getApiBaseUrl } from '@/lib/api-client';

export default function ExhibitorLeadsPage() {
  const { isDark } = useAdminTheme();
  const { showToast } = useToast();

  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [ratingFilter, setRatingFilter] = useState('ALL');
  const [ratingsCount, setRatingsCount] = useState({ HOT: 0, WARM: 0, COLD: 0 });
  const [totalLeads, setTotalLeads] = useState(0);

  // Booth Scan Form State
  const [badgeCodeInput, setBadgeCodeInput] = useState('');
  const [selectedRating, setSelectedRating] = useState('WARM');
  const [notesInput, setNotesInput] = useState('');
  const [scanning, setScanning] = useState(false);

  // Editing Note State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search,
        rating: ratingFilter,
        limit: '50',
      });
      const data = await fetchApi<any>(`/api/exhibitor-leads?${params.toString()}`);
      if (data.success) {
        setLeads(data.data || []);
        setTotalLeads(data.meta?.total || 0);
        if (data.meta?.ratingsCount) {
          setRatingsCount(data.meta.ratingsCount);
        }
      }
    } catch (err) {
      console.error('Fetch Leads Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [search, ratingFilter]);

  // Handle Stall Lead Scan Submission
  const handleScanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!badgeCodeInput.trim()) {
      showToast('Please enter or scan a badge code', 'error');
      return;
    }

    setScanning(true);
    try {
      const data = await fetchApi<any>('/api/exhibitor-leads/scan', {
        method: 'POST',
        body: JSON.stringify({
          badgeCode: badgeCodeInput.trim(),
          rating: selectedRating,
          notes: notesInput.trim(),
        }),
      });

      if (data.success) {
        showToast(data.message || '🌟 Lead captured successfully!', 'success');
        setBadgeCodeInput('');
        setNotesInput('');
        fetchLeads();
        if (inputRef.current) inputRef.current.focus();
      } else {
        showToast(data.message || 'Failed to capture lead', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Network error while saving lead', 'error');
    } finally {
      setScanning(false);
    }
  };

  // Update Rating or Notes for existing lead
  const handleUpdateLead = async (id: string, newRating?: string, newNotes?: string) => {
    try {
      const data = await fetchApi<any>(`/api/exhibitor-leads/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          ...(newRating && { rating: newRating }),
          ...(newNotes !== undefined && { notes: newNotes }),
        }),
      });
      if (data.success) {
        showToast('Lead updated', 'success');
        setEditingId(null);
        fetchLeads();
      }
    } catch (err) {
      showToast('Failed to update lead', 'error');
    }
  };

  // Download CSV Export
  const handleExportCsv = () => {
    const token = localStorage.getItem('expo_admin_token');
    const baseUrl = getApiBaseUrl();
    window.open(`${baseUrl}/api/exhibitor-leads/export?token=${token}`, '_blank');
  };

  return (
    <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'EVENT_MANAGER', 'GATE_OFFICER']}>
      <div className={`p-4 md:p-8 min-h-screen transition-colors duration-200 ${isDark ? 'bg-[#090D16] text-slate-100' : 'bg-[#F8FAFC] text-slate-800'}`}>
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <QrCode className="w-7 h-7 text-[#01A64E]" />
              <h1 className="text-2xl md:text-3xl font-black tracking-tight">Exhibitor Lead Retrieval</h1>
            </div>
            <p className={`text-xs md:text-sm mt-1 font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Scan visitor badges at your booth, tag lead interest (Hot/Warm/Cold), take notes, and export CSV leads.
            </p>
          </div>

          <button
            onClick={handleExportCsv}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#01A64E] to-[#79C143] hover:brightness-110 text-white font-extrabold flex items-center gap-2 shadow-lg shadow-[#01A64E]/25 cursor-pointer transition-all shrink-0"
          >
            <Download className="w-5 h-5" />
            <span>Export Leads CSV ({totalLeads})</span>
          </button>
        </div>

        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className={`p-5 rounded-2xl border flex items-center justify-between ${isDark ? 'bg-[#131B2A] border-rose-500/30' : 'bg-white border-rose-200 shadow-xs'}`}>
            <div>
              <div className="text-xs font-black uppercase text-rose-500 tracking-wider">🔥 Hot Leads</div>
              <div className="text-3xl font-black text-rose-400 mt-1">{ratingsCount.HOT}</div>
            </div>
            <Flame className="w-9 h-9 text-rose-500/40" />
          </div>

          <div className={`p-5 rounded-2xl border flex items-center justify-between ${isDark ? 'bg-[#131B2A] border-amber-500/30' : 'bg-white border-amber-200 shadow-xs'}`}>
            <div>
              <div className="text-xs font-black uppercase text-amber-500 tracking-wider">⚡ Warm Leads</div>
              <div className="text-3xl font-black text-amber-400 mt-1">{ratingsCount.WARM}</div>
            </div>
            <Thermometer className="w-9 h-9 text-amber-500/40" />
          </div>

          <div className={`p-5 rounded-2xl border flex items-center justify-between ${isDark ? 'bg-[#131B2A] border-blue-500/30' : 'bg-white border-blue-200 shadow-xs'}`}>
            <div>
              <div className="text-xs font-black uppercase text-blue-500 tracking-wider">❄️ Cold Leads</div>
              <div className="text-3xl font-black text-blue-400 mt-1">{ratingsCount.COLD}</div>
            </div>
            <Snowflake className="w-9 h-9 text-blue-500/40" />
          </div>
        </div>

        {/* Booth Scanner Input Box */}
        <div className={`p-6 rounded-3xl border mb-8 ${isDark ? 'bg-[#131B2A] border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
          <h2 className="text-lg font-black mb-4 flex items-center gap-2">
            <QrCode className="w-5 h-5 text-[#01A64E]" />
            <span>Scan Visitor Badge at Stall</span>
          </h2>

          <form onSubmit={handleScanSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-4">
              <label className="block text-xs font-bold text-slate-400 mb-1">Visitor Badge Code *</label>
              <input
                ref={inputRef}
                type="text"
                value={badgeCodeInput}
                onChange={(e) => setBadgeCodeInput(e.target.value)}
                placeholder="Scan or type EXPO26-XXXXX..."
                className={`w-full px-4 py-3 rounded-2xl text-base font-mono font-bold border outline-none ${
                  isDark ? 'bg-[#090D16] border-slate-700 text-white placeholder:text-slate-500' : 'bg-slate-50 border-slate-300'
                }`}
                autoFocus
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-slate-400 mb-1">Lead Rating</label>
              <select
                value={selectedRating}
                onChange={(e) => setSelectedRating(e.target.value)}
                className={`w-full px-4 py-3 rounded-2xl text-sm font-bold border outline-none ${
                  isDark ? 'bg-[#090D16] border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                }`}
              >
                <option value="HOT">🔥 HOT - Immediate Interest / High Budget</option>
                <option value="WARM">⚡ WARM - General Inquiry / Request Quote</option>
                <option value="COLD">❄️ COLD - Browsing / Informational</option>
              </select>
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-slate-400 mb-1">Stall Notes</label>
              <input
                type="text"
                value={notesInput}
                onChange={(e) => setNotesInput(e.target.value)}
                placeholder="e.g. Requested 100kW inverter quote"
                className={`w-full px-4 py-3 rounded-2xl text-sm border outline-none ${
                  isDark ? 'bg-[#090D16] border-slate-700 text-white placeholder:text-slate-500' : 'bg-slate-50 border-slate-300'
                }`}
              />
            </div>

            <div className="md:col-span-2 flex items-end">
              <button
                type="submit"
                disabled={scanning}
                className="w-full py-3 rounded-2xl bg-[#01A64E] hover:bg-[#79C143] text-white font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#01A64E]/20 disabled:opacity-50"
              >
                {scanning ? <RefreshCw className="w-5 h-5 animate-spin" /> : <UserCheck className="w-5 h-5" />}
                <span>Save Lead</span>
              </button>
            </div>
          </form>
        </div>

        {/* Filter Bar & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
            {['ALL', 'HOT', 'WARM', 'COLD'].map((r) => (
              <button
                key={r}
                onClick={() => setRatingFilter(r)}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  ratingFilter === r
                    ? 'bg-[#01A64E] text-white shadow-md'
                    : isDark
                    ? 'bg-[#131B2A] border border-slate-800 text-slate-400 hover:text-white'
                    : 'bg-white border border-slate-200 text-slate-600'
                }`}
              >
                {r === 'ALL' ? 'All Leads' : r}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search leads..."
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs font-semibold border outline-none ${
                isDark ? 'bg-[#131B2A] border-slate-800 text-white placeholder:text-slate-500' : 'bg-white border-slate-200'
              }`}
            />
          </div>
        </div>

        {/* Leads Table */}
        <div className={`rounded-3xl border overflow-hidden ${isDark ? 'bg-[#131B2A] border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className={`uppercase text-[11px] font-black tracking-wider border-b ${isDark ? 'bg-[#090D16] border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                <tr>
                  <th className="py-4 px-5">Visitor Name</th>
                  <th className="py-4 px-5">Company / Title</th>
                  <th className="py-4 px-5">Contact Details</th>
                  <th className="py-4 px-5">Rating</th>
                  <th className="py-4 px-5">Stall Notes</th>
                  <th className="py-4 px-5">Scanned Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 font-medium">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">Loading leads...</td>
                  </tr>
                ) : leads.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">No leads recorded yet. Scan visitor badges above to start collecting booth leads!</td>
                  </tr>
                ) : (
                  leads.map((lead) => (
                    <tr key={lead.id} className={isDark ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50'}>
                      <td className="py-4 px-5">
                        <div className="font-bold text-sm">{lead.visitor?.fullName}</div>
                        <div className="font-mono text-[11px] text-[#79C143] font-bold">{lead.visitor?.badgeCode}</div>
                      </td>

                      <td className="py-4 px-5">
                        <div className="font-bold">{lead.visitor?.company || 'N/A'}</div>
                        <div className="text-slate-400">{lead.visitor?.designation || 'Visitor'}</div>
                      </td>

                      <td className="py-4 px-5 space-y-0.5">
                        <div className="text-slate-300 font-semibold">{lead.visitor?.phone}</div>
                        <div className="text-slate-400 text-[11px]">{lead.visitor?.email}</div>
                      </td>

                      <td className="py-4 px-5">
                        <select
                          value={lead.rating}
                          onChange={(e) => handleUpdateLead(lead.id, e.target.value)}
                          className={`px-3 py-1 rounded-full text-[11px] font-black uppercase border outline-none cursor-pointer ${
                            lead.rating === 'HOT'
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/40'
                              : lead.rating === 'WARM'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/40'
                              : 'bg-blue-500/10 text-blue-400 border-blue-500/40'
                          }`}
                        >
                          <option value="HOT">🔥 HOT</option>
                          <option value="WARM">⚡ WARM</option>
                          <option value="COLD">❄️ COLD</option>
                        </select>
                      </td>

                      <td className="py-4 px-5">
                        {editingId === lead.id ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              value={editNotes}
                              onChange={(e) => setEditNotes(e.target.value)}
                              className={`px-2 py-1 rounded-lg text-xs border outline-none ${isDark ? 'bg-[#090D16] border-slate-700 text-white' : 'bg-white border-slate-300'}`}
                            />
                            <button
                              onClick={() => handleUpdateLead(lead.id, undefined, editNotes)}
                              className="p-1 rounded bg-[#01A64E] text-white hover:bg-[#79C143]"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 group">
                            <span className="text-slate-300 italic">{lead.notes || 'No notes added'}</span>
                            <button
                              onClick={() => {
                                setEditingId(lead.id);
                                setEditNotes(lead.notes || '');
                              }}
                              className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-white"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>

                      <td className="py-4 px-5 text-slate-400 text-[11px]">
                        {new Date(lead.scannedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
