'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck, RefreshCw, Search, LogIn, LogOut,
  CheckCircle2, XCircle, AlertTriangle, DoorOpen, Clock,
  ChevronLeft, ChevronRight,
} from 'lucide-react';
import { fetchApi } from '@/lib/api-client';

interface GateLogItem {
  id: string;
  visitorId?: string;
  gateName?: string;
  scanType: 'ENTRY' | 'EXIT' | 'BREAK';
  status: 'SUCCESS' | 'DENIED' | 'DUPLICATE_ENTRY';
  scannedAt?: string;
  createdAt: string;
  notes?: string;
  visitor?: {
    fullName: string;
    badgeCode: string;
    category: string;
    company?: string;
  };
  scannedBy?: {
    name: string;
    email: string;
  };
}

export default function AdminGateLogsPage() {
  const [logs, setLogs] = useState<GateLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [stats, setStats] = useState({ totalCheckIns: 0, totalExits: 0, totalDenied: 0, totalLogs: 0 });

  const loadLogs = useCallback(async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        search,
        scanType: filterType,
        status: filterStatus,
        page: String(page),
        limit: String(limit),
      });

      const data = await fetchApi<any>(`/api/checkin/logs?${query.toString()}`);
      if (data?.logs) {
        setLogs(data.logs);
      }
      if (data?.pagination) {
        setPagination(data.pagination);
      }
      if (data?.stats) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to load gate logs:', err);
    } finally {
      setLoading(false);
    }
  }, [search, filterType, filterStatus, page, limit]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadLogs();
    }, 300);
    return () => clearTimeout(timer);
  }, [loadLogs]);

  // Strip trailing "(ENTRY)" / "(EXIT)" / "(RE-ENTRY)" suffix that the controller appends
  const cleanGateName = (raw?: string) => {
    if (!raw) return '—';
    return raw.replace(/\s*\((ENTRY|EXIT|RE-ENTRY|BREAK)\)\s*$/i, '').trim();
  };

  const getScanMode = (log: GateLogItem) => {
    const raw = log.gateName || '';
    if (/RE-ENTRY/i.test(raw)) return 'RE-ENTRY';
    if (/EXIT/i.test(raw)) return 'EXIT';
    return log.scanType === 'ENTRY' ? 'ENTRY' : 'EXIT';
  };

  const rangeStart = pagination.total === 0 ? 0 : (page - 1) * limit + 1;
  const rangeEnd = Math.min(page * limit, pagination.total);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#072228] border border-[#0b3d46] p-6 rounded-3xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#01A64E]/15 border border-[#01A64E]/30 text-[#79C143] flex items-center justify-center">
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

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[#072228] border border-[#0b3d46] rounded-2xl p-4 text-center">
          <div className="text-2xl font-black text-[#79C143]">{stats.totalCheckIns.toLocaleString()}</div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">Check-Ins</div>
        </div>
        <div className="bg-[#072228] border border-[#0b3d46] rounded-2xl p-4 text-center">
          <div className="text-2xl font-black text-amber-400">{stats.totalExits.toLocaleString()}</div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">Exits</div>
        </div>
        <div className="bg-[#072228] border border-[#0b3d46] rounded-2xl p-4 text-center">
          <div className="text-2xl font-black text-rose-400">{stats.totalDenied.toLocaleString()}</div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">Denied</div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#072228] border border-[#0b3d46] p-4 rounded-2xl">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search visitor, badge code, gate..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#03151a] border border-[#0b3d46] text-white text-xs focus:outline-none focus:border-[#01A64E] transition-all"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
          {(['ALL', 'ENTRY', 'EXIT'] as const).map((type) => (
            <button
              key={type}
              onClick={() => {
                setFilterType(type);
                setPage(1);
              }}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                filterType === type
                  ? 'bg-[#01A64E] text-white shadow-md shadow-[#01A64E]/20'
                  : 'bg-[#03151a] text-slate-400 hover:text-white border border-[#0b3d46]'
              }`}
            >
              {type === 'ALL' ? 'All Scans' : type === 'ENTRY' ? '🟢 Entry' : '🔴 Exit'}
            </button>
          ))}

          <div className="w-px h-5 bg-[#0b3d46] hidden sm:block" />

          {(['ALL', 'SUCCESS', 'DENIED', 'DUPLICATE_ENTRY'] as const).map((s) => (
            <button
              key={s}
              onClick={() => {
                setFilterStatus(s);
                setPage(1);
              }}
              className={`flex-1 sm:flex-initial px-3 py-2 rounded-xl text-[11px] font-bold transition-all ${
                filterStatus === s
                  ? s === 'SUCCESS' ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
                  : s === 'DENIED' ? 'bg-rose-500/30 text-rose-300 border border-rose-500/40'
                  : s === 'DUPLICATE_ENTRY' ? 'bg-amber-500/30 text-amber-300 border border-amber-500/40'
                  : 'bg-[#01A64E] text-white'
                  : 'bg-[#03151a] text-slate-400 hover:text-white border border-[#0b3d46]'
              }`}
            >
              {s === 'ALL' ? 'All Status' : s === 'SUCCESS' ? '✅ Approved' : s === 'DENIED' ? '❌ Denied' : '⚠️ Duplicate'}
            </button>
          ))}

          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
            className="px-3 py-2 rounded-xl bg-[#03151a] border border-[#0b3d46] text-slate-300 text-xs font-semibold focus:outline-none focus:border-[#01A64E]"
          >
            <option value={10}>10 per page</option>
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
          </select>
        </div>
      </div>

      {/* Logs Audit Table */}
      <div className="bg-[#072228] border border-[#0b3d46] rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#03151a] text-slate-400 font-extrabold uppercase border-b border-[#0b3d46]">
                <th className="p-4 whitespace-nowrap">#</th>
                <th className="p-4 whitespace-nowrap">Date & Time</th>
                <th className="p-4 whitespace-nowrap">Scan Mode</th>
                <th className="p-4 whitespace-nowrap">Visitor</th>
                <th className="p-4 whitespace-nowrap">Badge ID</th>
                <th className="p-4 whitespace-nowrap">Gate Station</th>
                <th className="p-4 whitespace-nowrap">Status</th>
                <th className="p-4 whitespace-nowrap">Scanned By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#0b3d46]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">Loading audit logs...</td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">No gate scan records found.</td>
                </tr>
              ) : (
                logs.map((log, idx) => {
                  const mode = getScanMode(log);
                  const gateName = cleanGateName(log.gateName);
                  const ts = new Date(log.scannedAt || log.createdAt);

                  return (
                    <tr key={log.id} className="hover:bg-[#0b3d46]/40 transition-colors">
                      {/* Row # */}
                      <td className="p-4 text-slate-500 font-mono text-[11px]">
                        {rangeStart + idx}
                      </td>

                      {/* Timestamp */}
                      <td className="p-4 text-slate-300 font-mono text-[11px] whitespace-nowrap">
                        <div>{ts.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                        <div className="text-slate-500">{ts.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</div>
                      </td>

                      {/* Scan Mode */}
                      <td className="p-4">
                        {mode === 'ENTRY' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold text-[11px] whitespace-nowrap">
                            <LogIn className="w-3.5 h-3.5" /> ENTRY
                          </span>
                        ) : mode === 'RE-ENTRY' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 font-bold text-[11px] whitespace-nowrap">
                            <LogIn className="w-3.5 h-3.5" /> RE-ENTRY
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold text-[11px] whitespace-nowrap">
                            <LogOut className="w-3.5 h-3.5" /> EXIT
                          </span>
                        )}
                      </td>

                      {/* Visitor Name + Category */}
                      <td className="p-4">
                        <div className="font-extrabold text-white whitespace-nowrap">
                          {log.visitor?.fullName || '—'}
                        </div>
                        {log.visitor?.category && (
                          <div className="text-[10px] text-slate-400 font-semibold mt-0.5">
                            {log.visitor.category}
                            {log.visitor.company ? ` · ${log.visitor.company}` : ''}
                          </div>
                        )}
                      </td>

                      {/* Badge Code */}
                      <td className="p-4">
                        <span className="font-mono font-bold text-[#79C143] bg-[#01A64E]/10 px-2 py-0.5 rounded-lg border border-[#01A64E]/20 text-[11px] whitespace-nowrap">
                          {log.visitor?.badgeCode || '—'}
                        </span>
                      </td>

                      {/* Gate Station */}
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1.5 text-slate-200 font-bold text-[11px] whitespace-nowrap">
                          <DoorOpen className="w-3.5 h-3.5 text-slate-500" />
                          {gateName}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        {log.status === 'SUCCESS' ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400 font-bold text-[11px] whitespace-nowrap">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                          </span>
                        ) : log.status === 'DUPLICATE_ENTRY' ? (
                          <span className="inline-flex items-center gap-1 text-amber-400 font-bold text-[11px] whitespace-nowrap">
                            <AlertTriangle className="w-3.5 h-3.5" /> Already Scanned
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-400 font-bold text-[11px] whitespace-nowrap">
                            <XCircle className="w-3.5 h-3.5" /> Access Denied
                          </span>
                        )}
                        {log.notes && (
                          <div className="text-[10px] text-slate-500 mt-0.5 max-w-[160px] truncate">{log.notes}</div>
                        )}
                      </td>

                      {/* Scanned By */}
                      <td className="p-4 text-slate-400 text-[11px] whitespace-nowrap">
                        {log.scannedBy?.name || 'Gate Officer'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-6 py-4 bg-[#03151a] border-t border-[#0b3d46] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            Showing <strong className="text-white">{rangeStart} - {rangeEnd}</strong> of{' '}
            <strong className="text-[#79C143]">{pagination.total.toLocaleString()}</strong> scan records
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <button
                disabled={page <= 1 || loading}
                onClick={() => setPage(page - 1)}
                className="p-2 rounded-xl bg-[#072228] border border-[#0b3d46] disabled:opacity-30 hover:bg-[#0b3d46] text-white transition-all cursor-pointer"
                title="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 py-1 text-xs">
                Page <strong className="text-white">{page}</strong> of{' '}
                <strong className="text-white">{pagination.totalPages}</strong>
              </span>
              <button
                disabled={page >= pagination.totalPages || loading}
                onClick={() => setPage(page + 1)}
                className="p-2 rounded-xl bg-[#072228] border border-[#0b3d46] disabled:opacity-30 hover:bg-[#0b3d46] text-white transition-all cursor-pointer"
                title="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <span className="flex items-center gap-1 text-[11px] text-slate-500 hidden md:inline-flex">
              <Clock className="w-3 h-3" /> Live audit trail
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
