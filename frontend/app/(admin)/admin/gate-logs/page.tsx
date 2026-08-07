'use client';

import { useState, useEffect } from 'react';
import { ShieldCheck, RefreshCw, Search, LogIn, LogOut, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { fetchApi } from '@/lib/api-client';

interface GateLogItem {
  id: string;
  visitorId?: string;
  visitorCode?: string;
  visitorName?: string;
  gateName?: string;
  scanType: 'ENTRY' | 'EXIT';
  status: 'SUCCESS' | 'DENIED' | 'DUPLICATE_ENTRY';
  scannedBy?: string;
  notes?: string;
  createdAt: string;
}

export default function AdminGateLogsPage() {
  const [logs, setLogs] = useState<GateLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');

  const loadLogs = async () => {
    try {
      setLoading(true);
      const data = await fetchApi<any>('/api/checkin/logs');
      if (data && data.logs) {
        setLogs(data.logs);
      }
    } catch (err) {
      console.error('Failed to load gate logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      (log.visitorName || '').toLowerCase().includes(search.toLowerCase()) ||
      (log.visitorCode || '').toLowerCase().includes(search.toLowerCase()) ||
      (log.gateName || '').toLowerCase().includes(search.toLowerCase());

    const matchesType = filterType === 'ALL' || log.scanType === filterType;

    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#072228] border border-[#0b3d46] p-6 rounded-3xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#01A64E]/15 border border-[#01A64E]/30 text-[#79C143] flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-extrabold text-white text-xl sm:text-2xl">Gate Audit Logs</h1>
            <p className="text-xs text-slate-400">Live entry & exit scan history across all event gates</p>
          </div>
        </div>

        <button
          onClick={loadLogs}
          disabled={loading}
          className="px-4 py-2.5 rounded-xl bg-[#0b3d46] hover:bg-[#0f4d58] text-slate-200 text-xs font-extrabold flex items-center gap-2 border border-slate-700 transition-all self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#072228] border border-[#0b3d46] p-4 rounded-2xl">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search code, visitor, gate..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#03151a] border border-[#0b3d46] text-white text-xs focus:outline-none focus:border-[#01A64E] transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {['ALL', 'ENTRY', 'EXIT'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                filterType === type
                  ? 'bg-[#01A64E] text-white shadow-md shadow-[#01A64E]/20'
                  : 'bg-[#03151a] text-slate-400 hover:text-white border border-[#0b3d46]'
              }`}
            >
              {type === 'ALL' ? 'All Scans' : type === 'ENTRY' ? 'Entry Scans' : 'Exit Scans'}
            </button>
          ))}
        </div>
      </div>

      {/* Logs Audit Table */}
      <div className="bg-[#072228] border border-[#0b3d46] rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#03151a] text-slate-400 font-extrabold uppercase border-b border-[#0b3d46]">
                <th className="p-4">Time</th>
                <th className="p-4">Mode</th>
                <th className="p-4">Visitor Code / Name</th>
                <th className="p-4">Gate Station</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#0b3d46]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    Loading audit logs...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    No gate scan records found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#0b3d46]/40 transition-colors">
                    <td className="p-4 text-slate-300 font-mono text-[11px]">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="p-4">
                      {log.scanType === 'ENTRY' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold text-[11px]">
                          <LogIn className="w-3.5 h-3.5" /> ENTRY
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold text-[11px]">
                          <LogOut className="w-3.5 h-3.5" /> EXIT
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="font-extrabold text-white">{log.visitorName || 'Registered Visitor'}</div>
                      <div className="font-mono text-[11px] text-[#79C143]">{log.visitorCode || log.visitorId}</div>
                    </td>
                    <td className="p-4 text-slate-300 font-medium">
                      {log.gateName || 'Main Entrance'}
                    </td>
                    <td className="p-4">
                      {log.status === 'SUCCESS' ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-bold text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                        </span>
                      ) : log.status === 'DUPLICATE_ENTRY' ? (
                        <span className="inline-flex items-center gap-1 text-amber-400 font-bold text-[11px]">
                          <AlertTriangle className="w-3.5 h-3.5" /> Already Scanned
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-400 font-bold text-[11px]">
                          <XCircle className="w-3.5 h-3.5" /> Access Denied
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
