'use client';

import React, { useState, useEffect } from 'react';
import {
  Mail,
  Search,
  Filter,
  RefreshCw,
  Trash2,
  Eye,
  CheckCircle2,
  Clock,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Phone,
  User,
  Calendar,
  Send,
  X,
  FileText,
} from 'lucide-react';
import { useAdminTheme } from '@/context/AdminThemeContext';
import { useToast } from '@/context/ToastContext';
import { fetchApi } from '@/lib/api-client';

interface ContactEnquiry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  status: 'NEW' | 'CONTACTED' | 'RESOLVED';
  notes?: string;
  createdAt: string;
}

export default function ContactEnquiriesAdminPage() {
  const { isDark } = useAdminTheme();
  const { success: toastSuccess, error: toastError } = useToast();

  const [enquiries, setEnquiries] = useState<ContactEnquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({ total: 0, newCount: 0, contactedCount: 0, resolvedCount: 0 });

  // Modal State
  const [selectedEnquiry, setSelectedEnquiry] = useState<ContactEnquiry | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editNotes, setEditNotes] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const loadEnquiries = async () => {
    setLoading(true);
    try {
      const res = await fetchApi<any>(
        `/api/admin/contact-enquiries?page=${page}&limit=15&search=${encodeURIComponent(search)}&status=${statusFilter}`
      );
      if (res.success) {
        setEnquiries(res.enquiries || []);
        setStats(res.stats || { total: 0, newCount: 0, contactedCount: 0, resolvedCount: 0 });
        setTotalPages(res.pagination?.totalPages || 1);
      }
    } catch (err: any) {
      toastError(err.message || 'Failed to load contact enquiries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEnquiries();
  }, [page, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadEnquiries();
  };

  const handleOpenDetail = (enquiry: ContactEnquiry) => {
    setSelectedEnquiry(enquiry);
    setEditNotes(enquiry.notes || '');
    setModalOpen(true);
  };

  const handleUpdateStatus = async (newStatus: 'NEW' | 'CONTACTED' | 'RESOLVED') => {
    if (!selectedEnquiry) return;
    setUpdatingStatus(true);
    try {
      const res = await fetchApi<any>(`/api/admin/contact-enquiries/${selectedEnquiry.id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus, notes: editNotes }),
      });
      if (res.success) {
        toastSuccess(`Enquiry status updated to ${newStatus}`);
        setSelectedEnquiry(res.enquiry);
        loadEnquiries();
      }
    } catch (err: any) {
      toastError(err.message || 'Failed to update enquiry status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this contact enquiry record?')) return;
    try {
      const res = await fetchApi<any>(`/api/admin/contact-enquiries/${id}`, { method: 'DELETE' });
      if (res.success) {
        toastSuccess('Contact enquiry record deleted');
        if (selectedEnquiry?.id === id) setModalOpen(false);
        loadEnquiries();
      }
    } catch (err: any) {
      toastError(err.message || 'Failed to delete record');
    }
  };

  return (
    <div className={`p-4 md:p-8 min-h-screen transition-colors duration-200 ${isDark ? 'bg-[#0B1120] text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-2xl ${isDark ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-cyan-50 text-cyan-600 border border-cyan-200'}`}>
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight">Contact Messages &amp; Enquiries</h1>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Manage public website contact submissions, view attendee questions, and update inquiry statuses.
            </p>
          </div>
        </div>

        <button
          onClick={loadEnquiries}
          disabled={loading}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
            isDark
              ? 'bg-slate-800/80 text-slate-200 border-slate-700 hover:bg-slate-800'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 shadow-sm'
          }`}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#0D1527] border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Enquiries</span>
            <MessageSquare className="w-5 h-5 text-cyan-400" />
          </div>
          <span className="text-3xl font-black">{stats.total}</span>
        </div>

        <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#0D1527] border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">New Messages</span>
            <Clock className="w-5 h-5 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-400">{stats.newCount}</span>
            {stats.newCount > 0 && <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400">ACTION REQ</span>}
          </div>
        </div>

        <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#0D1527] border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400">In Progress</span>
            <Send className="w-5 h-5 text-blue-400" />
          </div>
          <span className="text-3xl font-black text-blue-400">{stats.contactedCount}</span>
        </div>

        <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#0D1527] border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Resolved</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <span className="text-3xl font-black text-emerald-400">{stats.resolvedCount}</span>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className={`p-4 rounded-2xl border mb-6 flex flex-col md:flex-row items-center justify-between gap-4 ${isDark ? 'bg-[#0D1527] border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
        
        {/* Status Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
          {(['ALL', 'NEW', 'CONTACTED', 'RESOLVED'] as const).map((s) => (
            <button
              key={s}
              onClick={() => {
                setStatusFilter(s);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === s
                  ? isDark
                    ? 'bg-cyan-500 text-slate-950 shadow-md'
                    : 'bg-cyan-600 text-white shadow-sm'
                  : isDark
                  ? 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {s === 'ALL' ? 'All Messages' : s}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="w-full md:w-72 relative">
          <input
            type="text"
            placeholder="Search name, email, subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full pl-9 pr-4 py-2 rounded-xl text-xs border outline-none transition-colors ${
              isDark
                ? 'bg-slate-900 border-slate-800 text-slate-100 focus:border-cyan-500'
                : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-cyan-500'
            }`}
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </form>
      </div>

      {/* ENQUIRIES TABLE */}
      <div className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-[#0D1527] border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className={`border-b ${isDark ? 'bg-slate-900/60 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
              <tr>
                <th className="p-4 font-bold uppercase tracking-wider">Sender</th>
                <th className="p-4 font-bold uppercase tracking-wider">Subject &amp; Message</th>
                <th className="p-4 font-bold uppercase tracking-wider">Date</th>
                <th className="p-4 font-bold uppercase tracking-wider">Status</th>
                <th className="p-4 font-bold uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-slate-800/60' : 'divide-slate-100'}`}>
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-cyan-400" />
                    <span>Loading contact enquiries...</span>
                  </td>
                </tr>
              ) : enquiries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 text-slate-500" />
                    <span>No contact enquiries found matching your filter.</span>
                  </td>
                </tr>
              ) : (
                enquiries.map((e) => (
                  <tr key={e.id} className={`transition-colors ${isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}`}>
                    
                    {/* Sender Info */}
                    <td className="p-4">
                      <div className="font-bold text-sm text-slate-100">{e.name}</div>
                      <div className="text-slate-400 text-[11px]">{e.email}</div>
                      {e.phone && <div className="text-slate-500 text-[11px] flex items-center gap-1 mt-0.5"><Phone className="w-3 h-3" />{e.phone}</div>}
                    </td>

                    {/* Subject & Snippet */}
                    <td className="p-4 max-w-xs">
                      <div className="font-semibold text-cyan-400 truncate">{e.subject || 'General Enquiry'}</div>
                      <div className={`text-[11px] truncate mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{e.message}</div>
                    </td>

                    {/* Date */}
                    <td className="p-4 text-slate-400 text-[11px] whitespace-nowrap">
                      {new Date(e.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>

                    {/* Status Badge */}
                    <td className="p-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-black ${
                        e.status === 'NEW'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : e.status === 'CONTACTED'
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {e.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenDetail(e)}
                          className={`p-2 rounded-lg transition-colors ${
                            isDark
                              ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                          title="View Message Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(e.id)}
                          className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors"
                          title="Delete Enquiry"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className={`p-4 border-t flex items-center justify-between ${isDark ? 'border-slate-800 bg-slate-900/40' : 'border-slate-100 bg-slate-50'}`}>
          <span className="text-xs text-slate-400">Page {page} of {totalPages}</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-2 rounded-lg bg-slate-800 disabled:opacity-30 text-slate-200 hover:bg-slate-700"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-2 rounded-lg bg-slate-800 disabled:opacity-30 text-slate-200 hover:bg-slate-700"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* DETAIL & STATUS UPDATE MODAL */}
      {modalOpen && selectedEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className={`w-full max-w-xl p-6 rounded-2xl border shadow-2xl relative ${isDark ? 'bg-[#0D1527] border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'}`}>
            
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Contact Enquiry Details</h3>
                <span className="text-xs text-slate-400">Received {new Date(selectedEnquiry.createdAt).toLocaleString()}</span>
              </div>
            </div>

            {/* SENDER SUMMARY */}
            <div className={`p-4 rounded-xl border mb-4 ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Full Name:</span>
                  <span className="font-bold text-sm">{selectedEnquiry.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Email:</span>
                  <a href={`mailto:${selectedEnquiry.email}`} className="font-bold text-cyan-400 underline">{selectedEnquiry.email}</a>
                </div>
                {selectedEnquiry.phone && (
                  <div>
                    <span className="text-slate-400 block font-medium">Phone:</span>
                    <a href={`tel:${selectedEnquiry.phone}`} className="font-bold text-emerald-400">{selectedEnquiry.phone}</a>
                  </div>
                )}
                <div>
                  <span className="text-slate-400 block font-medium">Subject:</span>
                  <span className="font-bold">{selectedEnquiry.subject || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* MESSAGE CONTENT */}
            <div className="mb-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Message Content</span>
              <div className={`p-4 rounded-xl border text-xs leading-relaxed whitespace-pre-wrap ${isDark ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-100 border-slate-200 text-slate-800'}`}>
                {selectedEnquiry.message}
              </div>
            </div>

            {/* ADMIN NOTES & STATUS UPDATE */}
            <div className="mb-6">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Admin Internal Notes</span>
              <textarea
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Write internal team notes or resolution comments..."
                rows={2}
                className={`w-full p-3 rounded-xl text-xs border outline-none ${
                  isDark ? 'bg-slate-950 border-slate-800 text-slate-100 focus:border-cyan-500' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              />
            </div>

            {/* UPDATE STATUS BUTTONS */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800">
              <span className="text-xs font-bold text-slate-400">Mark Status As:</span>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => handleUpdateStatus('NEW')}
                  disabled={updatingStatus}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30"
                >
                  NEW
                </button>
                <button
                  onClick={() => handleUpdateStatus('CONTACTED')}
                  disabled={updatingStatus}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30"
                >
                  CONTACTED
                </button>
                <button
                  onClick={() => handleUpdateStatus('RESOLVED')}
                  disabled={updatingStatus}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30"
                >
                  RESOLVED
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
