'use client';

import { useState, useEffect } from 'react';
import { Calendar, Plus, Trash2, MapPin, Clock } from 'lucide-react';
import { fetchApi } from '@/lib/api-client';
import { useAdminTheme } from '@/context/AdminThemeContext';

export default function AdminEventsPage() {
  const { isDark } = useAdminTheme();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [venue, setVenue] = useState('');
  const [description, setDescription] = useState('');

  const loadEvents = async () => {
    setLoading(true);
    try {
      const data = await fetchApi<any>('/api/admin/events');
      setEvents(data.events || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchApi<any>('/api/admin/events', {
        method: 'POST',
        body: JSON.stringify({ title, venue, description }),
      });
      setTitle('');
      setVenue('');
      setDescription('');
      setShowAddModal(false);
      loadEvents();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    try {
      await fetchApi<any>(`/api/admin/events/${id}`, { method: 'DELETE' });
      loadEvents();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className={`flex items-center justify-between border p-6 rounded-3xl transition-colors ${
        isDark ? 'bg-[#131B2A] border-slate-800 text-white shadow-xl' : 'bg-white border-slate-200 text-slate-900 shadow-sm'
      }`}>
        <div>
          <h1 className={`text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <Calendar className="w-6 h-6 text-[#01A64E]" />
            Events Management
          </h1>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Manage main expo events, venues, and schedules</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-[#01A64E] hover:bg-[#79C143] text-white font-extrabold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-sm shadow-[#01A64E]/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Event</span>
        </button>
      </div>

      {showAddModal && (
        <div className={`fixed inset-0 z-50 backdrop-blur-sm flex items-center justify-center p-4 ${isDark ? 'bg-black/70' : 'bg-slate-900/60'}`}>
          <div className={`border p-6 rounded-3xl max-w-md w-full space-y-4 shadow-xl ${
            isDark ? 'bg-[#131B2A] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <h2 className="text-lg font-black">Add New Event</h2>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className={`block mb-1 font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Event Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Masters EXPO 2026 Kerala"
                  className={`w-full px-3 py-2.5 rounded-xl border focus:outline-none focus:border-[#01A64E] ${
                    isDark ? 'bg-[#090D16] border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                  }`}
                />
              </div>
              <div>
                <label className={`block mb-1 font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Venue</label>
                <input
                  type="text"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="e.g. Lulu Bolgatty International Convention Centre"
                  className={`w-full px-3 py-2.5 rounded-xl border focus:outline-none focus:border-[#01A64E] ${
                    isDark ? 'bg-[#090D16] border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                  }`}
                />
              </div>
              <div>
                <label className={`block mb-1 font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Event details..."
                  className={`w-full px-3 py-2.5 rounded-xl border focus:outline-none focus:border-[#01A64E] h-20 ${
                    isDark ? 'bg-[#090D16] border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                  }`}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className={`px-4 py-2 rounded-xl border font-bold cursor-pointer ${
                    isDark ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#01A64E] hover:bg-[#79C143] text-white font-extrabold cursor-pointer"
                >
                  Create Event
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
              <th className="py-3.5 px-4">Event Title</th>
              <th className="py-3.5 px-4">Venue</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${isDark ? 'divide-slate-800/80 bg-[#131B2A]' : 'divide-slate-100 bg-white'}`}>
            {loading ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-slate-500">
                  Loading events...
                </td>
              </tr>
            ) : events.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-slate-500">
                  No events found. Click "Add New Event" above to create one.
                </td>
              </tr>
            ) : (
              events.map((evt: any) => (
                <tr key={evt.id} className={`transition-colors ${isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50/80'}`}>
                  <td className={`py-4 px-4 font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{evt.title}</td>
                  <td className={`py-4 px-4 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{evt.venue || '—'}</td>
                  <td className="py-4 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                      isDark ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' : 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                    }`}>
                      {evt.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button
                      onClick={() => handleDelete(evt.id)}
                      className={`p-1.5 rounded-lg border cursor-pointer ${
                        isDark ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20' : 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100'
                      }`}
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
    </div>
  );
}
