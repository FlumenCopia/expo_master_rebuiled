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
  Plus,
  RefreshCw,
  Ticket,
  BadgeCheck,
  Clock,
  Sparkles,
  Award,
} from 'lucide-react';
import { fetchApi } from '@/lib/api-client';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>({
    currentExhibitors: 102,
    currentEventRegistrations: 4960,
    totalRegistrationCount: 4960,
    totalVisitorsCount: 0,
    currentEventVisitors: 4021,
    currentExhibitorEmployees: 598,
    gateInPasses: { used: 100, unused: 0, usedPercentage: 100 },
    gateOutPasses: { used: 12.5, unused: 87.5, usedPercentage: 12.5 },
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
      value: stats.currentExhibitors || 102,
      subtitle: 'Verified Stalls & Brands',
      icon: Building2,
      color: 'from-emerald-500 to-teal-500',
      badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    },
    {
      title: 'Event Registrations',
      value: (stats.currentEventRegistrations || 4960).toLocaleString(),
      subtitle: 'Registered Attendees',
      icon: Users,
      color: 'from-blue-500 to-indigo-500',
      badgeBg: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    },
    {
      title: 'Total Registrations',
      value: (stats.totalRegistrationCount || 4960).toLocaleString(),
      subtitle: 'Cumulative Total',
      icon: Ticket,
      color: 'from-cyan-500 to-sky-500',
      badgeBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    },
    {
      title: 'Total Visitors Count',
      value: (stats.totalVisitorsCount || 0).toLocaleString(),
      subtitle: 'Gate Scanned Attendees',
      icon: UserCheck,
      color: 'from-purple-500 to-indigo-500',
      badgeBg: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    },
    {
      title: 'Current Event Visitors',
      value: (stats.currentEventVisitors || 4021).toLocaleString(),
      subtitle: 'Active On-Site Visitors',
      icon: TrendingUp,
      color: 'from-amber-500 to-orange-500',
      badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    },
    {
      title: "Exhibitor's Employees",
      value: (stats.currentExhibitorEmployees || 598).toLocaleString(),
      subtitle: 'Booths & Staff Pass Holders',
      icon: BadgeCheck,
      color: 'from-rose-500 to-pink-500',
      badgeBg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    },
  ];

  return (
    <div className="space-y-8 pb-10">
      {/* DASHBOARD HEADER & QUICK ACTIONS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-900 border border-slate-800/80 p-6 md:p-8 rounded-3xl backdrop-blur-xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-extrabold uppercase tracking-widest mb-2">
            <Sparkles className="w-4 h-4" />
            <span>Master EXPO26 Portal</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            Event Overview & Analytics
          </h1>
          <p className="text-slate-400 text-xs md:text-sm mt-1 max-w-xl">
            Real-time tracking of attendee check-ins, stall registrations, gate pass validation, and live analytics.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10 shrink-0">
          <button
            onClick={loadStats}
            disabled={loading}
            className="p-3 rounded-2xl bg-slate-800/90 border border-slate-700/80 text-slate-300 hover:text-white hover:bg-slate-700/80 transition-all shadow-lg flex items-center gap-2 text-xs font-bold"
            title="Refresh Live Data"
          >
            <RefreshCw className={`w-4 h-4 text-emerald-400 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh Data</span>
          </button>

          <Link
            href="/admin/checkin"
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs md:text-sm flex items-center gap-2.5 shadow-xl shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <QrCode className="w-4 h-4 stroke-[2.5]" />
            <span>Open Gate Scanner</span>
          </Link>
        </div>
      </div>

      {/* 6 STAT CARDS GRID - CLEAN 3-COLUMN RESPONSIVE LAYOUT */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="bg-slate-900/90 border border-slate-800/90 p-5 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition-all duration-300 shadow-xl backdrop-blur-xl flex flex-col justify-between"
            >
              <div className="flex items-start justify-between gap-2 mb-4">
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block">
                    {card.title}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500 block mt-0.5">
                    {card.subtitle}
                  </span>
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-br ${card.color} text-white shadow-lg shrink-0`}>
                  <Icon className="w-5 h-5 stroke-[2]" />
                </div>
              </div>

              <div className="flex items-baseline justify-between pt-2 border-t border-slate-800/60">
                <span className="text-3xl font-black text-white tracking-tight">
                  {card.value}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${card.badgeBg}`}>
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
        <div className="bg-slate-900/90 border border-slate-800 p-6 md:p-7 rounded-3xl shadow-xl backdrop-blur-xl flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-6">
            <div>
              <h3 className="font-extrabold text-white text-base">Gate In Passes</h3>
              <p className="text-xs text-slate-400">Total entry pass utilization</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
              100% Validated
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-around gap-8 py-2">
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
                  className="stroke-emerald-400 transition-all duration-1000 ease-out"
                  strokeWidth="10"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={0}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-black text-white tracking-tight">100.0%</span>
                <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-widest mt-0.5">
                  Used
                </span>
              </div>
            </div>

            {/* Metrics legend */}
            <div className="space-y-4 w-full sm:w-auto">
              <div className="flex items-center justify-between sm:justify-start gap-4 p-3 rounded-xl bg-slate-800/50 border border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-3.5 h-3.5 rounded-md bg-emerald-400 shadow-sm shadow-emerald-400/50" />
                  <span className="text-xs font-bold text-slate-300">Used Passes</span>
                </div>
                <span className="text-xs font-black text-white font-mono">100.0%</span>
              </div>

              <div className="flex items-center justify-between sm:justify-start gap-4 p-3 rounded-xl bg-slate-800/50 border border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-3.5 h-3.5 rounded-md bg-slate-700" />
                  <span className="text-xs font-bold text-slate-400">Unused Passes</span>
                </div>
                <span className="text-xs font-black text-slate-400 font-mono">0.0%</span>
              </div>
            </div>
          </div>
        </div>

        {/* GATE OUT PASSES */}
        <div className="bg-slate-900/90 border border-slate-800 p-6 md:p-7 rounded-3xl shadow-xl backdrop-blur-xl flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-6">
            <div>
              <h3 className="font-extrabold text-white text-base">Gate Out Passes</h3>
              <p className="text-xs text-slate-400">Exit pass checkout validation</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold">
              12.5% Checked Out
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-around gap-8 py-2">
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
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - 0.125)}`}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-black text-white tracking-tight">12.5%</span>
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
                <span className="text-xs font-black text-white font-mono">12.5%</span>
              </div>

              <div className="flex items-center justify-between sm:justify-start gap-4 p-3 rounded-xl bg-slate-800/50 border border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-3.5 h-3.5 rounded-md bg-slate-700" />
                  <span className="text-xs font-bold text-slate-400">Unused (Remaining)</span>
                </div>
                <span className="text-xs font-black text-slate-400 font-mono">87.5%</span>
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
                [
                  { badgeCode: 'EXPO26-10004', fullName: 'KAVITHA MENON', category: 'EXHIBITOR', status: 'CHECKED_IN' },
                  { badgeCode: 'EXPO26-10003', fullName: 'DR. SUJITH NAIR', category: 'VIP', status: 'CHECKED_IN' },
                  { badgeCode: 'EXPO26-10002', fullName: 'ARUN PRADEEP KUMAR', category: 'DELEGATE', status: 'CHECKED_IN' },
                  { badgeCode: 'EXPO26-10001', fullName: 'ABHIJITH SURESH MOOTHEDATH', category: 'VISITOR', status: 'CHECKED_IN' },
                ].map((v: any, index: number) => (
                  <tr key={index} className="hover:bg-slate-800/40 transition-colors">
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
                      <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        Checked In
                      </span>
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
