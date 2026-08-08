'use client';

import { useEffect, useState, useCallback } from 'react';
import { Clock, Calendar, MapPin, Users, Plus, Trash2, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchApi } from '@/lib/api-client';
import { useAdminTheme } from '@/context/AdminThemeContext';

export default function AdminSubEventsPage() {
  const { isDark } = useAdminTheme();
  const [subEvents, setSubEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [stats, setStats] = useState({ total: 0 });

  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [speaker, setSpeaker] = useState('');
  const [location, setLocation] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [capacity, setCapacity] = useState('200');

  const fetchSubEvents = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        search,
        page: String(page),
        limit: String(limit),
      });

      const data = await fetchApi<any>(`/api/admin/sub-events?${query.toString()}`);
      if (data?.subEvents) {
        setSubEvents(data.subEvents);
      }
      if (data?.pagination) {
        setPagination(data.pagination);
      }
      if (data?.stats) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to fetch sub-events:', err);
    } finally {
      setLoading(false);
    }
  }, [search, page, limit]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSubEvents();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchSubEvents]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchApi<any>('/api/admin/sub-events', {
        method: 'POST',
        body: JSON.stringify({
          title,
          description,
          speaker,
          location,
          timeSlot,
          capacity: Number(capacity),
        }),
      });
      setTitle('');
      setDescription('');
      setSpeaker('');
      setLocation('');
      setTimeSlot('');
      setCapacity('200');
      setShowModal(false);
      fetchSubEvents();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this sub-event?')) return;
    try {
      await fetchApi<any>(`/api/admin/sub-events/${id}`, { method: 'DELETE' });
      fetchSubEvents();
    } catch (err) {
      console.error(err);
    }
  };

  const rangeStart = pagination.total === 0 ? 0 : (page - 1) * limit + 1;
  const rangeEnd = Math.min(page * limit, pagination.total);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border p-6 rounded-3xl transition-colors ${
        isDark ? 'bg-[#131B2A] border-slate-800 text-white shadow-xl' : 'bg-white border-slate-200 text-slate-900 shadow-sm'
      }`}>
        <div>
          <h1 className={`text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <Calendar className="w-6 h-6 text-[#01A64E]" />
            Sub-Events &amp; Workshops
          </h1>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Manage parallel tracks, keynote sessions, speaker slots &amp; capacity</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl bg-[#01A64E] hover:bg-[#79C143] text-white font-extrabold text-xs flex items-center gap-2 cursor-pointer self-start sm:self-auto shadow-sm shadow-[#01A64E]/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add Sub-Event</span>
        </button>
      </div>

      {/* SEARCH BAR & STATS CHIP */}
      <div className={`border p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 ${
        isDark ? 'bg-[#131B2A] border-slate-800 shadow-xl' : 'bg-white border-slate-200 shadow-xs'
      }`}>
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search title, speaker, location..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-[#01A64E] ${
              isDark ? 'bg-[#090D16] border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
            }`}
          />
        </div>

        <div className={`flex items-center gap-3 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          <span>
            Total Scheduled: <strong className="text-[#01A64E]">{stats.total.toLocaleString()}</strong> sub-events
          </span>
          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold focus:outline-none focus:border-[#01A64E] ${
              isDark ? 'bg-[#090D16] border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-700'
            }`}
          >
            <option value={6}>6 per page</option>
            <option value={12}>12 per page</option>
            <option value={24}>24 per page</option>
          </select>
        </div>
      </div>

      {showModal && (
        <div className={`fixed inset-0 z-50 backdrop-blur-sm flex items-center justify-center p-4 ${isDark ? 'bg-black/70' : 'bg-slate-900/60'}`}>
          <div className={`border p-6 rounded-3xl max-w-md w-full space-y-4 shadow-xl ${
            isDark ? 'bg-[#131B2A] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <h2 className="text-lg font-black">Add Sub-Event / Workshop</h2>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className={`block mb-1 font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Sub-Event Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Solar &amp; Rooftop Energy Summit"
                  className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-[#01A64E] ${
                    isDark ? 'bg-[#090D16] border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                  }`}
                />
              </div>
              <div>
                <label className={`block mb-1 font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Speaker / Lead</label>
                <input
                  type="text"
                  value={speaker}
                  onChange={(e) => setSpeaker(e.target.value)}
                  placeholder="e.g. Dr. Rajesh Kumar"
                  className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-[#01A64E] ${
                    isDark ? 'bg-[#090D16] border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                  }`}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={`block mb-1 font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Location / Hall</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Main Exhibition Hall"
                    className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-[#01A64E] ${
                      isDark ? 'bg-[#090D16] border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block mb-1 font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Time Slot</label>
                  <input
                    type="text"
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    placeholder="Day 1 • 10:30 AM"
                    className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-[#01A64E] ${
                      isDark ? 'bg-[#090D16] border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                </div>
              </div>
              <div>
                <label className={`block mb-1 font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Max Capacity</label>
                <input
                  type="number"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-[#01A64E] ${
                    isDark ? 'bg-[#090D16] border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>
              <div>
                <label className={`block mb-1 font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-[#01A64E] h-16 ${
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
                  Save Sub-Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUB-EVENTS CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
          <div className={`col-span-3 py-12 text-center rounded-3xl border ${
            isDark ? 'bg-[#131B2A] border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-500'
          }`}>
            Loading scheduled sub-events...
          </div>
        ) : subEvents.length > 0 ? (
          subEvents.map((se) => (
            <div
              key={se.id}
              className={`border p-6 rounded-3xl transition-all relative group flex flex-col justify-between ${
                isDark
                  ? 'bg-[#131B2A] border-slate-800 text-white hover:border-[#01A64E]/60 shadow-xl'
                  : 'bg-white border-slate-200 text-slate-900 hover:border-[#01A64E]/50 shadow-xs hover:shadow-md'
              }`}
            >
              <div>
                <button
                  onClick={() => handleDelete(se.id)}
                  className={`absolute top-4 right-4 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity border cursor-pointer ${
                    isDark ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20' : 'bg-rose-50 border-rose-200 text-rose-600'
                  }`}
                  title="Delete Sub-Event"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center font-bold shrink-0 ${
                    isDark ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-[#01A64E]'
                  }`}>
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className={`font-bold text-base leading-tight truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{se.title}</h3>
                    <span className="text-xs text-[#01A64E] font-semibold truncate block">{se.speaker || 'Keynote Speaker'}</span>
                  </div>
                </div>
                <p className={`text-xs mb-4 leading-relaxed line-clamp-3 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{se.description}</p>
              </div>

              <div className={`space-y-2 text-xs border-t pt-3 ${
                isDark ? 'border-slate-800 text-slate-300' : 'border-slate-100 text-slate-600'
              }`}>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#01A64E]" /> {se.timeSlot || 'Day 1 • 10:30 AM'}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#01A64E]" /> {se.location || 'Hall A, Lulu Mall'}
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#01A64E]" /> Max Capacity: {se.capacity || 200}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className={`col-span-3 py-12 text-center rounded-3xl border ${
            isDark ? 'bg-[#131B2A] border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-500'
          }`}>
            No matching sub-events found.
          </div>
        )}
      </div>

      {/* PAGINATION FOOTER */}
      <div className={`p-4 border rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs ${
        isDark ? 'bg-[#131B2A] border-slate-800 text-slate-400 shadow-xl' : 'bg-white border-slate-200 text-slate-500 shadow-xs'
      }`}>
        <div>
          Showing <strong className={isDark ? 'text-white' : 'text-slate-900'}>{rangeStart} - {rangeEnd}</strong> of{' '}
          <strong className="text-[#01A64E]">{pagination.total}</strong> sub-events
        </div>

        <div className="flex items-center gap-2">
          <button
            disabled={page <= 1 || loading}
            onClick={() => setPage(page - 1)}
            className={`p-1.5 rounded-xl border disabled:opacity-30 cursor-pointer ${
              isDark ? 'bg-[#090D16] border-slate-700 text-white hover:bg-slate-800' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span>
            Page <strong className={isDark ? 'text-white' : 'text-slate-900'}>{page}</strong> of{' '}
            <strong className={isDark ? 'text-white' : 'text-slate-900'}>{pagination.totalPages}</strong>
          </span>
          <button
            disabled={page >= pagination.totalPages || loading}
            onClick={() => setPage(page + 1)}
            className={`p-1.5 rounded-xl border disabled:opacity-30 cursor-pointer ${
              isDark ? 'bg-[#090D16] border-slate-700 text-[#01A64E] hover:bg-slate-800' : 'bg-white border-slate-200 text-[#01A64E] hover:bg-slate-100'
            }`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
