'use client';

import { useState, useEffect } from 'react';
import { DoorOpen, Plus, Trash2, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { fetchApi } from '@/lib/api-client';
import AdminNavbar from '@/components/AdminNavbar';

interface GateItem {
  id: string;
  name: string;
  code?: string;
  status: string;
  createdAt: string;
}

export default function AdminGatesPage() {
  const [gates, setGates] = useState<GateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newGateName, setNewGateName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadGates = async () => {
    try {
      setLoading(true);
      const data = await fetchApi<any>('/api/admin/gates');
      if (data && data.gates) {
        setGates(data.gates);
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to load gates' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGates();
  }, []);

  const handleAddGate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGateName.trim()) return;

    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetchApi<any>('/api/admin/gates', {
        method: 'POST',
        body: JSON.stringify({ name: newGateName.trim() }),
      });

      if (res && res.success) {
        setMessage({ type: 'success', text: `✅ Gate "${newGateName}" added successfully!` });
        setNewGateName('');
        loadGates();
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: `❌ ${err.message || 'Failed to add gate'}` });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteGate = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete gate "${name}"?`)) return;

    try {
      await fetchApi<any>(`/api/admin/gates/${id}`, { method: 'DELETE' });
      setMessage({ type: 'success', text: `🗑️ Gate "${name}" deleted.` });
      setGates((prev) => prev.filter((g) => g.id !== id));
    } catch (err: any) {
      setMessage({ type: 'error', text: `❌ ${err.message || 'Failed to delete gate'}` });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950 flex flex-col">
      <AdminNavbar />

      <main className="max-w-5xl mx-auto w-full px-4 py-6 flex-1 flex flex-col space-y-6">
        {/* Header Card */}
        <div className="flex items-center justify-between bg-slate-900/80 border border-slate-800 p-6 rounded-3xl backdrop-blur-xl shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold">
              <DoorOpen className="w-7 h-7" />
            </div>
            <div>
              <h1 className="font-black text-white text-xl sm:text-2xl flex items-center gap-2">
                Gate Management
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">Configure event entry and exit gates for gatekeeper scanner stations</p>
            </div>
          </div>
        </div>

        {/* Message Banner */}
        {message && (
          <div
            className={`p-4 rounded-2xl border text-sm font-semibold flex items-center gap-2 ${
              message.type === 'success'
                ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                : 'bg-rose-950/80 border-rose-500/50 text-rose-300'
            }`}
          >
            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span>{message.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Add New Gate Form */}
          <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-3xl shadow-xl backdrop-blur-xl h-fit">
            <h3 className="font-extrabold text-white text-base mb-2 flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-400" /> Add New Event Gate
            </h3>
            <p className="text-xs text-slate-400 mb-5">Create active gate stations for scanner assignment</p>

            <form onSubmit={handleAddGate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Gate Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. North Gate 3 (VIP)"
                  value={newGateName}
                  onChange={(e) => setNewGateName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-emerald-500 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                <span>{submitting ? 'Adding Gate...' : 'Add Gate Station'}</span>
              </button>
            </form>
          </div>

          {/* Active Gates List */}
          <div className="md:col-span-2 bg-slate-900/80 border border-slate-800 p-6 rounded-3xl shadow-xl backdrop-blur-xl flex flex-col">
            <h3 className="font-extrabold text-white text-base mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" /> Active Event Gates
              </span>
              <span className="text-xs px-3 py-1 rounded-full bg-slate-800 text-emerald-400 font-mono font-bold">
                {gates.length} Gates Configured
              </span>
            </h3>

            {loading ? (
              <div className="py-12 text-center text-slate-500 text-sm">Loading gate stations...</div>
            ) : gates.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-sm">No gate stations configured yet.</div>
            ) : (
              <div className="space-y-3">
                {gates.map((gate) => (
                  <div
                    key={gate.id}
                    className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold">
                        <DoorOpen className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-extrabold text-white text-sm">{gate.name}</div>
                        <div className="text-[11px] text-slate-400">
                          Status: <span className="text-emerald-400 font-semibold uppercase">{gate.status}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteGate(gate.id, gate.name)}
                      className="p-2 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 transition-all"
                      title="Delete Gate"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
