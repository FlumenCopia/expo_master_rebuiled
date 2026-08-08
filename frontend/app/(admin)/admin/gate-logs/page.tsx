'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck, RefreshCw, Search, LogIn, LogOut,
  CheckCircle2, XCircle, AlertTriangle, DoorOpen, Clock,
  ChevronLeft, ChevronRight,
} from 'lucide-react';
import { fetchApi } from '@/lib/api-client';
import { useAdminTheme } from '@/context/AdminThemeContext';

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
  const { isDark } = useAdminTheme();
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
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border p-6 rounded-3xl transition-colors ${
        isDark ? 'bg-[#131B2A] border-slate-800 text-white shadow-xl' : 'bg-white border-slate-200 text-slate-900 shadow-sm'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${
            isDark ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-[#01A64E]'
          }`}>
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className={`font-extrabold text-xl sm:text-2xl ${isDark ? 'text-white' : 'text-slate-900'}`}>Gate Audit Logs</h1>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Live entry &amp; exit scan history across all event gates</p>
          </div>
        </div>

        <button
          onClick={loadLogs}
          disabled={loading}
          className={`px-4 py-2.5 rounded-xl border text-xs font-extrabold flex items-center gap-2 transition-all self-start sm:self-auto cursor-pointer ${
            isDark ? 'bg-[#090D16] border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800' : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
          }`}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className={`border rounded-2xl p-4 text-center ${isDark ? 'bg-[#131B2A] border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
          <div className="text-2xl font-black text-[#01A64E]">{stats.totalCheckIns.toLocaleString()}</div>
          <div className={`text-[11px] font-bold uppercase tracking-wider mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Check-Ins</div>
        </div>
        <div className={`border rounded-2xl p-4 text-center ${isDark ? 'bg-[#131B2A] border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
          <div className="text-2xl font-black text-amber-500">{stats.totalExits.toLocaleString()}</div>
          <div className={`text-[11px] font-bold uppercase tracking-wider mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Exits</div>
        </div>
        <div className={`border rounded-2xl p-4 text-center ${isDark ? 'bg-[#131B2A] border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
          <div className="text-2xl font-black text-rose-500">{stats.totalDenied.toLocaleString()}</div>
          <div className={`text-[11px] font-bold uppercase tracking-wider mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Denied</div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 border p-4 rounded-2xl ${
        isDark ? 'bg-[#131B2A] border-slate-800 shadow-xl' : 'bg-white border-slate-200 shadow-xs'
      }`}>
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
            className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs transition-all focus:outline-none focus:border-[#01A64E] ${
              isDark ? 'bg-[#090D16] border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
            }`}
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
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterType === type
                  ? 'bg-[#01A64E] text-white shadow-xs'
                  : isDark ? 'bg-[#090D16] border border-slate-700 text-slate-400 hover:text-white' : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-300'
              }`}
            >
              {type === 'ALL' ? 'All Scans' : type === 'ENTRY' ? '🟢 Entry' : '🔴 Exit'}
            </button>
          ))}

          <div className={`w-px h-5 hidden sm:block ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />

          {(['ALL', 'SUCCESS', 'DENIED', 'DUPLICATE_ENTRY'] as const).map((s) => (
            <button
              key={s}
              onClick={() => {
                setFilterStatus(s);
                setPage(1);
              }}
              className={`flex-1 sm:flex-initial px-3 py-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                filterStatus === s
                  ? s === 'SUCCESS' ? isDark ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : s === 'DENIED' ? isDark ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-rose-50 text-rose-700 border border-rose-200'
                  : s === 'DUPLICATE_ENTRY' ? isDark ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'bg-[#01A64E] text-white'
                  : isDark ? 'bg-[#090D16] border border-slate-700 text-slate-400 hover:text-white' : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-300'
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
            className={`px-3 py-2 rounded-xl border text-xs font-semibold focus:outline-none focus:border-[#01A64E] ${
              isDark ? 'bg-[#090D16] border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-700'
            }`}
          >
            <option value={10}>10 per page</option>
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
          </select>
        </div>
      </div>

      {/* Logs Audit Table */}
      <div className={`border rounded-3xl overflow-hidden ${isDark ? 'bg-[#131B2A] border-slate-800 shadow-xl' : 'bg-white border-slate-200 shadow-sm'}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className={`border-b font-extrabold uppercase ${
                isDark ? 'bg-[#090D16] border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}>
                <th className="p-4 whitespace-nowrap">#</th>
                <th className="p-4 whitespace-nowrap">Date &amp; Time</th>
                <th className="p-4 whitespace-nowrap">Scan Mode</th>
                <th className="p-4 whitespace-nowrap">Visitor</th>
                <th className="p-4 whitespace-nowrap">Badge ID</th>
                <th className="p-4 whitespace-nowrap">Gate Station</th>
                <th className="p-4 whitespace-nowrap">Status</th>
                <th className="p-4 whitespace-nowrap">Scanned By</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-slate-800/80 bg-[#131B2A]' : 'divide-slate-100 bg-white'}`}>
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500 font-medium">
                    Loading gate scan logs...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500 font-medium">
                    No gate scan records match current search filter.
                  </td>
                </tr>
              ) : (
                logs.map((log, index) => {
                  const modeTag = getScanMode(log);
                  return (
                    <tr key={log.id} className={`transition-colors ${isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50/80'}`}>
                      <td className={`p-4 font-mono text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{rangeStart + index}</td>
                      <td className="p-4 whitespace-nowrap font-mono text-[11px]">
                        <div className={`font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                          {new Date(log.scannedAt || log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </div>
                        <div className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                          {new Date(log.scannedAt || log.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </div>
                      </td>

                      <td className="p-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${
                          modeTag === 'ENTRY' ? isDark ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          modeTag === 'RE-ENTRY' ? isDark ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' : 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                          isDark ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          {modeTag === 'ENTRY' ? <LogIn className="w-3 h-3 text-emerald-400" /> :
                           modeTag === 'RE-ENTRY' ? <Clock className="w-3 h-3 text-indigo-400" /> :
                           <LogOut className="w-3 h-3 text-rose-400" />}
                          <span>{modeTag}</span>
                        </span>
                      </td>

                      <td className="p-4 whitespace-nowrap">
                        <div className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{log.visitor?.fullName || 'Walk-In / Guest'}</div>
                        <div className={isDark ? 'text-slate-400' : 'text-slate-500'}>{log.visitor?.company || log.visitor?.category || 'Attendee'}</div>
                      </td>

                      <td className="p-4 whitespace-nowrap">
                        <span className="font-mono font-bold text-[#01A64E]">
                          {log.visitor?.badgeCode || 'N/A'}
                        </span>
                      </td>

                      <td className="p-4 whitespace-nowrap font-medium">
                        <div className={`flex items-center gap-1.5 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                          <DoorOpen className="w-3.5 h-3.5 text-[#01A64E]" />
                          <span>{cleanGateName(log.gateName)}</span>
                        </div>
                      </td>

                      <td className="p-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${
                          log.status === 'SUCCESS' ? isDark ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          log.status === 'DUPLICATE_ENTRY' ? isDark ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-amber-50 text-amber-700 border-amber-200' :
                          isDark ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          {log.status === 'SUCCESS' ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> :
                           log.status === 'DUPLICATE_ENTRY' ? <AlertTriangle className="w-3 h-3 text-amber-400" /> :
                           <XCircle className="w-3 h-3 text-rose-400" />}
                          <span>{log.status}</span>
                        </span>
                      </td>

                      <td className={`p-4 whitespace-nowrap font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {log.scannedBy?.name || 'Gatekeeper Station'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className={`p-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-xs ${
          isDark ? 'bg-[#090D16] border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'
        }`}>
          <div>
            Showing <strong className={isDark ? 'text-white' : 'text-slate-900'}>{rangeStart} - {rangeEnd}</strong> of{' '}
            <strong className="text-[#01A64E]">{pagination.total.toLocaleString()}</strong> log entries
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1 || loading}
              onClick={() => setPage(page - 1)}
              className={`p-1.5 rounded-xl border disabled:opacity-30 cursor-pointer ${
                isDark ? 'bg-[#131B2A] border-slate-700 text-white hover:bg-slate-800' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
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
                isDark ? 'bg-[#131B2A] border-slate-700 text-white hover:bg-slate-800' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
