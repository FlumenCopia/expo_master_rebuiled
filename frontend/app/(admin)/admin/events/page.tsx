'use client';

import { useState, useEffect, useCallback } from 'react';
import { Calendar, Plus, Trash2, Pencil, Search, RefreshCw, CheckCircle, X } from 'lucide-react';
import { fetchApi } from '@/lib/api-client';
import { useAdminTheme } from '@/context/AdminThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import Pagination from '@/components/Pagination';

export default function AdminEventsPage() {
  const { isDark } = useAdminTheme();
  const { user } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(25);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });

  // Add Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [venue, setVenue] = useState('');
  const [description, setDescription] = useState('');
  const [addLoading, setAddLoading] = useState(false);

  // Edit Modal
  const [editEvent, setEditEvent] = useState<any>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editVenue, setEditVenue] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editStatus, setEditStatus] = useState('ACTIVE');
  const [editLoading, setEditLoading] = useState(false);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({ search, page: String(page), limit: String(limit) });
      const data = await fetchApi<any>(`/api/admin/events?${query.toString()}`);
      setEvents(data.events || []);
      setPagination(data.pagination || { total: 0, totalPages: 1 });
      setStats(data.stats || { total: 0, active: 0, inactive: 0 });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, page, limit]);

  useEffect(() => {
    const t = setTimeout(() => loadEvents(), 300);
    return () => clearTimeout(t);
  }, [loadEvents]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddLoading(true);
    try {
      await fetchApi<any>('/api/admin/events', {
        method: 'POST',
        body: JSON.stringify({ title, venue, description }),
      });
      toastSuccess('Event created successfully!', 'Event Saved');
      setTitle(''); setVenue(''); setDescription('');
      setShowAddModal(false);
      setPage(1);
      loadEvents();
    } catch (err: any) {
      toastError(err.message || 'Failed to create event', 'Create Event Failed');
    } finally {
      setAddLoading(false);
    }
  };

  const openEdit = (evt: any) => {
    setEditEvent(evt);
    setEditTitle(evt.title);
    setEditVenue(evt.venue || '');
    setEditDescription(evt.description || '');
    setEditStatus(evt.status || 'ACTIVE');
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editEvent) return;
    setEditLoading(true);
    try {
      await fetchApi<any>(`/api/admin/events/${editEvent.id}`, {
        method: 'PUT',
        body: JSON.stringify({ title: editTitle, venue: editVenue, description: editDescription, status: editStatus }),
      });
      toastSuccess('Event updated successfully!', 'Changes Saved');
      setEditEvent(null);
      loadEvents();
    } catch (err: any) {
      toastError(err.message || 'Failed to update event', 'Update Failed');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    try {
      await fetchApi<any>(`/api/admin/events/${id}`, { method: 'DELETE' });
      toastSuccess('Event deleted successfully', 'Deleted');
      loadEvents();
    } catch (err: any) {
      toastError(err.message || 'Failed to delete event', 'Delete Failed');
    }
  };

  const inputCls = `w-full px-3 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-[#01A64E] ${
    isDark ? 'bg-[#090D16] border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
  }`;
  const labelCls = `block mb-1 font-bold text-xs ${isDark ? 'text-slate-300' : 'text-slate-700'}`;

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border p-4 sm:p-6 rounded-3xl transition-colors ${
        isDark ? 'bg-[#131B2A] border-slate-800 text-white shadow-xl' : 'bg-white border-slate-200 text-slate-900 shadow-sm'
      }`}>
        <div>
          <h1 className={`text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <Calendar className="w-6 h-6 text-[#01A64E]" />
            Events Management
          </h1>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {stats.total} total · {stats.active} active · {stats.inactive} inactive
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-[#01A64E] hover:bg-[#79C143] text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm shadow-[#01A64E]/20 shrink-0 self-start sm:self-auto whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Event</span>
        </button>
      </div>

      {/* SEARCH */}
      <div className={`flex items-center gap-3 p-3 rounded-2xl border ${isDark ? 'bg-[#131B2A] border-slate-800' : 'bg-white border-slate-200'}`}>
        <Search className="w-4 h-4 text-slate-400 shrink-0" />
        <input
          type="text"
          placeholder="Search events by title, venue..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className={`flex-1 bg-transparent text-xs focus:outline-none ${isDark ? 'text-white placeholder-slate-500' : 'text-slate-900 placeholder-slate-400'}`}
        />
        <button onClick={loadEvents} className={`p-1.5 rounded-lg border cursor-pointer ${isDark ? 'border-slate-700 text-slate-400 hover:text-white' : 'border-slate-200 text-slate-500 hover:text-slate-900'}`}>
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* ADD MODAL */}
      {showAddModal && (
        <div className={`fixed inset-0 z-50 backdrop-blur-sm flex items-center justify-center p-4 ${isDark ? 'bg-black/70' : 'bg-slate-900/60'}`}>
          <div className={`border p-6 rounded-3xl max-w-md w-full space-y-4 shadow-xl ${isDark ? 'bg-[#131B2A] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black">Add New Event</h2>
              <button onClick={() => setShowAddModal(false)} className="p-1.5 rounded-lg cursor-pointer text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div><label className={labelCls}>Event Title *</label><input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Masters EXPO 2026 Kerala" className={inputCls} /></div>
              <div><label className={labelCls}>Venue</label><input type="text" value={venue} onChange={(e) => setVenue(e.target.value)} placeholder="e.g. Lulu Bolgatty International Convention Centre" className={inputCls} /></div>
              <div><label className={labelCls}>Description</label><textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Event details..." className={`${inputCls} h-20`} /></div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className={`px-4 py-2 rounded-xl border font-bold cursor-pointer text-xs ${isDark ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 border-slate-200 text-slate-700'}`}>Cancel</button>
                <button type="submit" disabled={addLoading} className="px-4 py-2 rounded-xl bg-[#01A64E] hover:bg-[#79C143] text-white font-extrabold cursor-pointer text-xs disabled:opacity-60">{addLoading ? 'Creating...' : 'Create Event'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editEvent && (
        <div className={`fixed inset-0 z-50 backdrop-blur-sm flex items-center justify-center p-4 ${isDark ? 'bg-black/70' : 'bg-slate-900/60'}`}>
          <div className={`border p-6 rounded-3xl max-w-md w-full space-y-4 shadow-xl ${isDark ? 'bg-[#131B2A] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black">Edit Event</h2>
              <button onClick={() => setEditEvent(null)} className="p-1.5 rounded-lg cursor-pointer text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleEdit} className="space-y-3 text-xs">
              <div><label className={labelCls}>Event Title *</label><input type="text" required value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className={inputCls} /></div>
              <div><label className={labelCls}>Venue</label><input type="text" value={editVenue} onChange={(e) => setEditVenue(e.target.value)} className={inputCls} /></div>
              <div><label className={labelCls}>Description</label><textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} className={`${inputCls} h-20`} /></div>
              <div>
                <label className={labelCls}>Status</label>
                <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} className={inputCls}>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setEditEvent(null)} className={`px-4 py-2 rounded-xl border font-bold cursor-pointer text-xs ${isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'}`}>Cancel</button>
                <button type="submit" disabled={editLoading} className="px-4 py-2 rounded-xl bg-[#01A64E] hover:bg-[#79C143] text-white font-extrabold cursor-pointer text-xs disabled:opacity-60">{editLoading ? 'Saving...' : 'Save Changes'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TABLE */}
      <div className={`admin-table-container custom-scrollbar border rounded-3xl overflow-hidden ${isDark ? 'bg-[#131B2A] border-slate-800 shadow-xl' : 'bg-white border-slate-200 shadow-sm'}`}>
        <table className="w-full text-left text-xs">
          <thead className={`uppercase text-[10px] font-extrabold border-b ${isDark ? 'bg-[#090D16] text-slate-400 border-slate-800' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
            <tr>
              <th className="py-3.5 px-4 whitespace-nowrap">Event Title</th>
              <th className="py-3.5 px-4 whitespace-nowrap">Venue</th>
              <th className="py-3.5 px-4 whitespace-nowrap">Status</th>
              <th className="py-3.5 px-4 whitespace-nowrap">Created</th>
              <th className="py-3.5 px-4 text-right whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${isDark ? 'divide-slate-800/80 bg-[#131B2A]' : 'divide-slate-100 bg-white'}`}>
            {loading ? (
              <tr><td colSpan={5} className="py-8 text-center text-slate-500">Loading events...</td></tr>
            ) : events.length === 0 ? (
              <tr><td colSpan={5} className="py-8 text-center text-slate-500">No events found.</td></tr>
            ) : (
              events.map((evt: any) => (
                <tr key={evt.id} className={`transition-colors ${isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50/80'}`}>
                  <td className={`py-4 px-4 font-bold whitespace-nowrap ${isDark ? 'text-white' : 'text-slate-900'}`}>{evt.title}</td>
                  <td className={`py-4 px-4 whitespace-nowrap ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{evt.venue || '—'}</td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                      evt.status === 'ACTIVE'
                        ? isDark ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : isDark ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}>{evt.status}</span>
                  </td>
                  <td className={`py-4 px-4 whitespace-nowrap text-[11px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {new Date(evt.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(evt)}
                        className={`p-1.5 rounded-lg border cursor-pointer ${isDark ? 'bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20' : 'bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100'}`}
                        title="Edit Event"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      {isSuperAdmin && (
                        <button
                          onClick={() => handleDelete(evt.id)}
                          className={`p-1.5 rounded-lg border cursor-pointer ${isDark ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20' : 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100'}`}
                          title="Delete Event"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* PAGINATION */}
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
