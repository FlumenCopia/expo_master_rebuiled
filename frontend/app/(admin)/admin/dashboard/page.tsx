'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  UserCheck,
  Building2,
  QrCode,
  ArrowUpRight,
  TrendingUp,
  ShieldCheck,
  RefreshCw,
  Ticket,
  BadgeCheck,
} from 'lucide-react';
import { fetchApi } from '@/lib/api-client';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>({
    currentExhibitors: 0,
    currentEventRegistrations: 0,
    totalRegistrationCount: 0,
    totalVisitorsCount: 0,
    currentEventVisitors: 0,
    currentExhibitorEmployees: 0,
    gateInPasses: { used: 0, unused: 0, usedPercentage: 0 },
    gateOutPasses: { used: 0, unused: 0, usedPercentage: 0 },
    recentVisitors: [],
  });
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    setLoading(true);
    try {
      const data = await fetchApi<any>('/api/admin/stats');
      if (data && data.stats) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const statCards = [
    {
      title: 'Current Exhibitors',
      value: (stats.currentExhibitors ?? 0).toLocaleString(),
      subtitle: 'Verified Stalls & Brands',
      icon: Building2,
      color: 'from-emerald-500 to-teal-500',
      badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    },
    {
      title: 'Event Registrations',
      value: (stats.currentEventRegistrations ?? 0).toLocaleString(),
      subtitle: 'Registered Attendees',
      icon: Users,
      color: 'from-blue-500 to-indigo-500',
      badgeBg: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    },
    {
      title: 'Total Registrations',
      value: (stats.totalRegistrationCount ?? 0).toLocaleString(),
      subtitle: 'Cumulative Total',
      icon: Ticket,
      color: 'from-cyan-500 to-sky-500',
      badgeBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    },
    {
      title: 'Total Visitors Count',
      value: (stats.totalVisitorsCount ?? 0).toLocaleString(),
      subtitle: 'Gate Scanned Attendees',
      icon: UserCheck,
      color: 'from-purple-500 to-indigo-500',
      badgeBg: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    },
    {
      title: 'Current Event Visitors',
      value: (stats.currentEventVisitors ?? 0).toLocaleString(),
      subtitle: 'Active On-Site Visitors',
      icon: TrendingUp,
      color: 'from-amber-500 to-orange-500',
      badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    },
    {
      title: "Exhibitor's Employees",
      value: (stats.currentExhibitorEmployees ?? 0).toLocaleString(),
      subtitle: 'Booths & Staff Pass Holders',
      icon: BadgeCheck,
      color: 'from-rose-500 to-pink-500',
      badgeBg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    },
  ];

  const gateInPct = stats.gateInPasses?.usedPercentage ?? 0;
  const gateOutPct = stats.gateOutPasses?.usedPercentage ?? 0;
  const circumference = 2 * Math.PI * 40;

  return (
    <div className="space-y-6 sm:space-y-8 pb-10">
      {/* DASHBOARD HEADER & QUICK ACTIONS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#072228] border border-[#0b3d46] p-5 sm:p-6 md:p-8 rounded-3xl shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-[#79C143] text-xs font-extrabold uppercase tracking-widest mb-1.5">
            <ShieldCheck className="w-4 h-4 text-[#79C143]" />
            <span>Masters Kerala RE 2.0 EXPO26</span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight">
            Event Management Overview
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-xl">
            Real-time tracking of attendee check-ins, stall registrations, gate pass validation, and live analytics.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 flex-wrap sm:flex-nowrap">
          <button
            onClick={loadStats}
            disabled={loading}
            className="p-3 rounded-2xl bg-[#0b3d46] text-slate-200 hover:text-white hover:bg-[#0f4d58] border border-[#0b3d46] transition-all flex items-center gap-2 text-xs font-bold shrink-0"
            title="Refresh Live Data"
          >
            <RefreshCw className={`w-4 h-4 text-[#79C143] ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh Data</span>
          </button>

          <Link
            href="/admin/checkin"
            className="px-5 py-3 rounded-2xl bg-[#01A64E] hover:bg-[#79C143] text-white font-extrabold text-xs sm:text-sm flex items-center gap-2.5 shadow-lg shadow-[#01A64E]/20 transition-all active:scale-[0.98] shrink-0"
          >
            <QrCode className="w-4 h-4 stroke-[2.5]" />
            <span>Open Gate Scanner</span>
          </Link>
        </div>
      </div>

      {/* 6 STAT CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="bg-[#072228] border border-[#0b3d46] p-5 rounded-2xl flex flex-col justify-between hover:border-[#01A64E]/40 transition-all shadow-xl"
            >
              <div className="flex items-start justify-between gap-2 mb-4">
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#79C143] block">
                    {card.title}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-400 block mt-0.5">
                    {card.subtitle}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#0b3d46] text-[#79C143] border border-[#0b3d46] shrink-0">
                  <Icon className="w-5 h-5 stroke-[2]" />
                </div>
              </div>

              <div className="flex items-baseline justify-between pt-3 border-t border-[#0b3d46]">
                <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {card.value}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#01A64E]/15 text-[#79C143] border border-[#01A64E]/30">
                  Live Sync
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2 PASS ANALYTICS CARDS (GATE IN & GATE OUT) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* GATE IN PASSES */}
        <div className="bg-[#072228] border border-[#0b3d46] p-5 sm:p-6 md:p-7 rounded-3xl shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-[#0b3d46] pb-4 mb-6">
            <div>
              <h3 className="font-extrabold text-white text-base">Gate In Passes</h3>
              <p className="text-xs text-slate-400">Total entry pass utilization</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-[#01A64E]/15 border border-[#01A64E]/30 text-[#79C143] text-xs font-bold">
              {gateInPct}% Validated
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-around gap-6 sm:gap-8 py-2">
            {/* SVG Circular Ring Chart */}
            <div className="relative w-40 h-40 sm:w-44 sm:h-44 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="stroke-[#0b3d46]"
                  strokeWidth="10"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="stroke-[#01A64E] transition-all duration-1000 ease-out"
                  strokeWidth="10"
                  strokeDasharray={`${circumference}`}
                  strokeDashoffset={`${circumference * (1 - gateInPct / 100)}`}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-black text-white tracking-tight">{gateInPct}%</span>
                <span className="text-[10px] font-extrabold text-[#79C143] uppercase tracking-widest mt-0.5">
                  Used
                </span>
              </div>
            </div>

            {/* Metrics legend */}
            <div className="space-y-3 w-full sm:w-auto">
              <div className="flex items-center justify-between sm:justify-start gap-4 p-3 rounded-xl bg-[#03151a] border border-[#0b3d46]">
                <div className="flex items-center gap-2.5">
                  <div className="w-3.5 h-3.5 rounded-md bg-[#01A64E]" />
                  <span className="text-xs font-bold text-slate-300">Used Passes</span>
                </div>
                <span className="text-xs font-black text-white font-mono">{stats.gateInPasses?.used ?? 0}</span>
              </div>

              <div className="flex items-center justify-between sm:justify-start gap-4 p-3 rounded-xl bg-[#03151a] border border-[#0b3d46]">
                <div className="flex items-center gap-2.5">
                  <div className="w-3.5 h-3.5 rounded-md bg-[#0b3d46]" />
                  <span className="text-xs font-bold text-slate-400">Unused Passes</span>
                </div>
                <span className="text-xs font-black text-slate-400 font-mono">{stats.gateInPasses?.unused ?? 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* GATE OUT PASSES */}
        <div className="bg-[#072228] border border-[#0b3d46] p-5 sm:p-6 md:p-7 rounded-3xl shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-[#0b3d46] pb-4 mb-6">
            <div>
              <h3 className="font-extrabold text-white text-base">Gate Out Passes</h3>
              <p className="text-xs text-slate-400">Exit pass checkout validation</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold">
              {gateOutPct}% Checked Out
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-around gap-6 sm:gap-8 py-2">
            {/* SVG Circular Ring Chart */}
            <div className="relative w-44 h-44 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="stroke-slate-800"
                  strokeWidth="10"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="stroke-cyan-400 transition-all duration-1000 ease-out"
                  strokeWidth="10"
                  strokeDasharray={`${circumference}`}
                  strokeDashoffset={`${circumference * (1 - gateOutPct / 100)}`}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-black text-white tracking-tight">{gateOutPct}%</span>
                <span className="text-[10px] font-extrabold text-cyan-400 uppercase tracking-widest mt-0.5">
                  Checked Out
                </span>
              </div>
            </div>

            {/* Metrics legend */}
            <div className="space-y-4 w-full sm:w-auto">
              <div className="flex items-center justify-between sm:justify-start gap-4 p-3 rounded-xl bg-slate-800/50 border border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-3.5 h-3.5 rounded-md bg-cyan-400 shadow-sm shadow-cyan-400/50" />
                  <span className="text-xs font-bold text-slate-300">Used (Out)</span>
                </div>
                <span className="text-xs font-black text-white font-mono">{stats.gateOutPasses?.used ?? 0}</span>
              </div>

              <div className="flex items-center justify-between sm:justify-start gap-4 p-3 rounded-xl bg-slate-800/50 border border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-3.5 h-3.5 rounded-md bg-slate-700" />
                  <span className="text-xs font-bold text-slate-400">Unused (Remaining)</span>
                </div>
                <span className="text-xs font-black text-slate-400 font-mono">{stats.gateOutPasses?.unused ?? 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RECENT REGISTRATIONS TABLE CARD */}
      <div className="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-6 md:p-7 backdrop-blur-xl shadow-2xl">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-black text-white tracking-tight">Recent Attendee Registrations</h3>
            <p className="text-xs text-slate-400 mt-0.5">Latest visitors registered & checked into the expo</p>
          </div>
          <Link
            href="/admin/visitors"
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-extrabold transition-all flex items-center gap-1.5 border border-slate-700/60"
          >
            <span>View All Visitors</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-800/90 bg-slate-950/40">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 uppercase text-[10px] font-extrabold text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-5">Badge Code</th>
                <th className="py-3.5 px-5">Full Name</th>
                <th className="py-3.5 px-5">Category</th>
                <th className="py-3.5 px-5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {stats.recentVisitors && stats.recentVisitors.length > 0 ? (
                stats.recentVisitors.map((v: any) => (
                  <tr key={v.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-5 font-mono font-extrabold text-emerald-400">
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                        {v.badgeCode}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-white font-bold text-sm">{v.fullName}</td>
                    <td className="py-3.5 px-5">
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-extrabold bg-slate-800 text-slate-300 border border-slate-700">
                        {v.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className={`px-3 py-1 rounded-full text-[11px] font-extrabold border ${
                        v.status === 'CHECKED_IN'
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                          : v.status === 'ON_BREAK'
                          ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                          : v.status === 'CHECKED_OUT'
                          ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                          : 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                      }`}>
                        {v.status === 'CHECKED_IN' ? '✅ Checked In'
                          : v.status === 'ON_BREAK' ? '☕ On Break'
                          : v.status === 'CHECKED_OUT' ? '🔴 Checked Out'
                          : '🟡 ' + v.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="hover:bg-slate-800/40 transition-colors">
                  <td colSpan={4} className="py-8 px-5 text-center text-slate-400 font-medium">
                    No recent visitor registrations found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

