'use client';

import { useEffect, useState, useCallback } from 'react';
import { Clock, Calendar, MapPin, Users, Plus, Trash2, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchApi } from '@/lib/api-client';

export default function AdminSubEventsPage() {
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
        body: JSON.stringify({ title, description, speaker, location, timeSlot, capacity }),
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-6 rounded-3xl backdrop-blur-xl shadow-xl">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Calendar className="w-6 h-6 text-amber-400" />
            Sub-Events & Workshop Agenda
          </h1>
          <p className="text-slate-400 text-xs mt-1">Manage technical seminars, panel discussions, and workshops</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-extrabold text-xs flex items-center gap-2 hover:bg-amber-400 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Sub-Event</span>
        </button>
      </div>

      {/* SEARCH BAR & STATS CHIP */}
      <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
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
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span>
            Total Scheduled: <strong className="text-amber-400">{stats.total.toLocaleString()}</strong> sub-events
          </span>
          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-semibold focus:outline-none focus:border-amber-400"
          >
            <option value={6}>6 per page</option>
            <option value={12}>12 per page</option>
            <option value={24}>24 per page</option>
          </select>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl max-w-md w-full space-y-4 shadow-2xl">
            <h2 className="text-lg font-black text-white">Add Sub-Event / Workshop</h2>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1 font-bold">Sub-Event Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Solar & Rooftop Energy Summit"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1 font-bold">Speaker / Lead</label>
                <input
                  type="text"
                  value={speaker}
                  onChange={(e) => setSpeaker(e.target.value)}
                  placeholder="e.g. Dr. Rajesh Kumar"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1 font-bold">Location / Hall</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Main Exhibition Hall"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1 font-bold">Time Slot</label>
                  <input
                    type="text"
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    placeholder="Day 1 • 10:30 AM"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
              </div>
              <div>
                <label className="text-slate-400 block mb-1 font-bold">Max Capacity</label>
                <input
                  type="number"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1 font-bold">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white h-16"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold cursor-pointer">
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
          <div className="col-span-3 py-12 text-center text-slate-500 bg-slate-900/40 border border-slate-800 rounded-3xl">
            Loading scheduled sub-events...
          </div>
        ) : subEvents.length > 0 ? (
          subEvents.map((se) => (
            <div
              key={se.id}
              className="bg-slate-900/80 border border-slate-800/80 p-6 rounded-3xl backdrop-blur-xl hover:border-slate-700 transition-all shadow-xl relative group flex flex-col justify-between"
            >
              <div>
                <button
                  onClick={() => handleDelete(se.id)}
                  className="absolute top-4 right-4 p-1.5 rounded-lg bg-rose-500/10 text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  title="Delete Sub-Event"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-white text-base leading-tight truncate">{se.title}</h3>
                    <span className="text-xs text-amber-400 font-semibold truncate block">{se.speaker || 'Keynote Speaker'}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-400 mb-4 leading-relaxed line-clamp-3">{se.description}</p>
              </div>

              <div className="space-y-2 text-xs text-slate-300 border-t border-slate-800/80 pt-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" /> {se.timeSlot || 'Day 1 • 10:30 AM'}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-400" /> {se.location || 'Hall A, Lulu Mall'}
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-400" /> Max Capacity: {se.capacity || 200}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-3 py-12 text-center text-slate-500 bg-slate-900/40 border border-slate-800 rounded-3xl">
            No matching sub-events found.
          </div>
        )}
      </div>

      {/* PAGINATION FOOTER */}
      <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
        <div>
          Showing <strong className="text-white">{rangeStart} - {rangeEnd}</strong> of{' '}
          <strong className="text-amber-400">{pagination.total}</strong> sub-events
        </div>

        <div className="flex items-center gap-2">
          <button
            disabled={page <= 1 || loading}
            onClick={() => setPage(page - 1)}
            className="p-1.5 rounded-xl bg-slate-950 border border-slate-800 disabled:opacity-30 hover:bg-slate-800 text-white cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span>
            Page <strong className="text-white">{page}</strong> of{' '}
            <strong className="text-white">{pagination.totalPages}</strong>
          </span>
          <button
            disabled={page >= pagination.totalPages || loading}
            onClick={() => setPage(page + 1)}
            className="p-1.5 rounded-xl bg-slate-950 border border-slate-800 disabled:opacity-30 hover:bg-slate-800 text-white cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
