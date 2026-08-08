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
import { useAdminTheme } from '@/context/AdminThemeContext';

export default function AdminDashboardPage() {
  const { isDark } = useAdminTheme();
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
      href: '/admin/exhibitors',
    },
    {
      title: 'Event Registrations',
      value: (stats.currentEventRegistrations ?? 0).toLocaleString(),
      subtitle: 'Registered Attendees',
      icon: Users,
      href: '/admin/visitors',
    },
    {
      title: 'Total Registrations',
      value: (stats.totalRegistrationCount ?? 0).toLocaleString(),
      subtitle: 'Cumulative Total',
      icon: Ticket,
      href: '/admin/visitors',
    },
    {
      title: 'Total Visitors Count',
      value: (stats.totalVisitorsCount ?? 0).toLocaleString(),
      subtitle: 'Gate Scanned Attendees',
      icon: UserCheck,
      href: '/admin/visitors',
    },
    {
      title: 'Current Event Visitors',
      value: (stats.currentEventVisitors ?? 0).toLocaleString(),
      subtitle: 'Active On-Site Visitors',
      icon: TrendingUp,
      href: '/admin/visitors',
    },
    {
      title: "Exhibitor's Employees",
      value: (stats.currentExhibitorEmployees ?? 0).toLocaleString(),
      subtitle: 'Booths & Staff Pass Holders',
      icon: BadgeCheck,
      href: '/admin/company-employees',
    },
  ];

  const gateInPct = stats.gateInPasses?.usedPercentage ?? 0;
  const gateOutPct = stats.gateOutPasses?.usedPercentage ?? 0;
  const circumference = 2 * Math.PI * 40;

  return (
    <div className="space-y-6 sm:space-y-8 pb-10">
      {/* DASHBOARD HEADER & QUICK ACTIONS */}
      <div className={`flex flex-col lg:flex-row lg:items-center justify-between gap-4 border p-5 sm:p-6 md:p-8 rounded-3xl transition-colors ${
        isDark ? 'bg-[#131B2A] border-slate-800 text-white shadow-xl' : 'bg-white border-slate-200 text-slate-900 shadow-sm'
      }`}>
        <div>
          <div className="flex items-center gap-2 text-[#01A64E] text-xs font-extrabold uppercase tracking-widest mb-1.5">
            <ShieldCheck className="w-4 h-4 text-[#01A64E]" />
            <span>Masters Kerala RE 2.0 EXPO26</span>
          </div>
          <h1 className={`text-xl sm:text-2xl md:text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Event Management Overview
          </h1>
          <p className={`text-xs sm:text-sm mt-1 max-w-xl ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Real-time tracking of attendee check-ins, stall registrations, gate pass validation, and live analytics.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 flex-wrap sm:flex-nowrap">
          <button
            onClick={loadStats}
            disabled={loading}
            className={`p-3 rounded-2xl border transition-all flex items-center gap-2 text-xs font-bold shrink-0 cursor-pointer ${
              isDark ? 'bg-[#090D16] border-slate-700 text-slate-200 hover:bg-slate-800' : 'bg-white border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 shadow-xs'
            }`}
            title="Refresh Live Data"
          >
            <RefreshCw className={`w-4 h-4 text-[#01A64E] ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh Data</span>
          </button>

          <Link
            href="/admin/checkin"
            className="px-5 py-3 rounded-2xl bg-[#01A64E] hover:bg-[#79C143] text-white font-extrabold text-xs sm:text-sm flex items-center gap-2.5 shadow-sm shadow-[#01A64E]/20 transition-all active:scale-[0.98] shrink-0"
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
            <Link
              key={idx}
              href={card.href}
              className={`border p-5 rounded-2xl flex flex-col justify-between transition-all group cursor-pointer ${
                isDark ? 'bg-[#131B2A] border-slate-800 hover:border-[#01A64E]/50 shadow-xl' : 'bg-white border-slate-200 hover:border-[#01A64E]/50 shadow-xs hover:shadow-md'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-4">
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#01A64E] block group-hover:text-[#79C143] transition-colors">
                    {card.title}
                  </span>
                  <span className={`text-[11px] font-semibold block mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {card.subtitle}
                  </span>
                </div>
                <div className={`p-3 rounded-xl border shrink-0 group-hover:scale-105 transition-transform ${
                  isDark ? 'bg-emerald-500/10 border-emerald-500/20 text-[#79C143]' : 'bg-emerald-50 border-emerald-100 text-[#01A64E]'
                }`}>
                  <Icon className="w-5 h-5 stroke-[2]" />
                </div>
              </div>

              <div className={`flex items-baseline justify-between pt-3 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                <span className={`text-2xl sm:text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {card.value}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                  isDark ? 'bg-emerald-500/10 text-[#79C143] border-emerald-500/20' : 'bg-emerald-50 text-[#01A64E] border-emerald-200/80'
                }`}>
                  Live Sync
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* LIVE VENUE OCCUPANCY & SAFETY METER */}
      <div className={`border p-6 rounded-3xl transition-colors ${
        stats.occupancyStatus === 'CRITICAL'
          ? 'bg-rose-950/30 border-rose-500/50 text-white'
          : stats.occupancyStatus === 'WARNING'
          ? 'bg-amber-950/30 border-amber-500/50 text-white'
          : isDark
          ? 'bg-[#131B2A] border-slate-800 text-white shadow-xl'
          : 'bg-white border-slate-200 text-slate-900 shadow-sm'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full animate-ping ${
                stats.occupancyStatus === 'CRITICAL' ? 'bg-rose-500' : stats.occupancyStatus === 'WARNING' ? 'bg-amber-400' : 'bg-emerald-500'
              }`} />
              <h2 className="text-lg md:text-xl font-black tracking-tight flex items-center gap-2">
                <span>Live Venue Occupancy &amp; Safety Gauge</span>
              </h2>
            </div>
            <p className={`text-xs mt-1 font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Real-time headcount inside main exhibition halls vs maximum venue capacity limit ({(stats.venueCapacity || 150000).toLocaleString()} attendees).
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-2xl font-black">{(stats.currentlyInside || 0).toLocaleString()} / {(stats.venueCapacity || 150000).toLocaleString()}</div>
              <div className="text-[11px] font-extrabold uppercase text-[#79C143]">Active Attendees Inside</div>
            </div>
            <span className={`px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${
              stats.occupancyStatus === 'CRITICAL'
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                : stats.occupancyStatus === 'WARNING'
                ? 'bg-amber-500 text-slate-950 font-black'
                : 'bg-emerald-500/20 text-[#79C143] border border-emerald-500/40'
            }`}>
              {stats.occupancyPercentage || 0}% Cap ({stats.occupancyStatus || 'NORMAL'})
            </span>
          </div>
        </div>

        {/* Progress Capacity Bar */}
        <div className="w-full bg-slate-800/60 h-4 rounded-full overflow-hidden p-0.5 border border-slate-700/50 mb-3">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              stats.occupancyStatus === 'CRITICAL'
                ? 'bg-gradient-to-r from-rose-500 to-red-600'
                : stats.occupancyStatus === 'WARNING'
                ? 'bg-gradient-to-r from-amber-400 to-yellow-500'
                : 'bg-gradient-to-r from-[#01A64E] to-[#79C143]'
            }`}
            style={{ width: `${Math.min(100, stats.occupancyPercentage || 0)}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
          <span>0 (Empty)</span>
          <span>Hourly Flow: +{(stats.entriesPastHour || 0).toLocaleString()} Entered / -{(stats.exitsPastHour || 0).toLocaleString()} Exited</span>
          <span>{(stats.venueCapacity || 150000).toLocaleString()} (Max Capacity)</span>
        </div>
      </div>

      {/* 2 PASS ANALYTICS CARDS (GATE IN & GATE OUT) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* GATE IN PASSES */}
        <div className={`border p-5 sm:p-6 md:p-7 rounded-3xl flex flex-col justify-between ${
          isDark ? 'bg-[#131B2A] border-slate-800 shadow-xl' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className={`flex items-center justify-between border-b pb-4 mb-6 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
            <div>
              <h3 className={`font-extrabold text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>Gate In Passes</h3>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Total entry pass utilization</p>
            </div>
            <span className={`px-3 py-1 rounded-full border text-xs font-bold ${
              isDark ? 'bg-emerald-500/10 text-[#79C143] border-emerald-500/30' : 'bg-emerald-50 text-[#01A64E] border-emerald-200'
            }`}>
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
                  className={isDark ? 'stroke-slate-800' : 'stroke-slate-100'}
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
                <span className={`text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{gateInPct}%</span>
                <span className="text-[10px] font-extrabold text-[#01A64E] uppercase tracking-widest mt-0.5">
                  Used
                </span>
              </div>
            </div>

            {/* Metrics legend */}
            <div className="space-y-3 w-full sm:w-auto">
              <div className={`flex items-center justify-between sm:justify-start gap-4 p-3 rounded-xl border ${
                isDark ? 'bg-[#090D16] border-slate-800' : 'bg-slate-50 border-slate-200/80'
              }`}>
                <div className="flex items-center gap-2.5">
                  <div className="w-3.5 h-3.5 rounded-md bg-[#01A64E]" />
                  <span className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Used Passes</span>
                </div>
                <span className={`text-xs font-black font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>{stats.gateInPasses?.used ?? 0}</span>
              </div>

              <div className={`flex items-center justify-between sm:justify-start gap-4 p-3 rounded-xl border ${
                isDark ? 'bg-[#090D16] border-slate-800' : 'bg-slate-50 border-slate-200/80'
              }`}>
                <div className="flex items-center gap-2.5">
                  <div className={`w-3.5 h-3.5 rounded-md ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
                  <span className={`text-xs font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Unused Passes</span>
                </div>
                <span className={`text-xs font-black font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{stats.gateInPasses?.unused ?? 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* GATE OUT PASSES */}
        <div className={`border p-5 sm:p-6 md:p-7 rounded-3xl flex flex-col justify-between ${
          isDark ? 'bg-[#131B2A] border-slate-800 shadow-xl' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className={`flex items-center justify-between border-b pb-4 mb-6 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
            <div>
              <h3 className={`font-extrabold text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>Gate Out Passes</h3>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Exit pass checkout validation</p>
            </div>
            <span className={`px-3 py-1 rounded-full border text-xs font-bold ${
              isDark ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' : 'bg-cyan-50 text-cyan-700 border-cyan-200'
            }`}>
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
                  className={isDark ? 'stroke-slate-800' : 'stroke-slate-100'}
                  strokeWidth="10"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="stroke-cyan-500 transition-all duration-1000 ease-out"
                  strokeWidth="10"
                  strokeDasharray={`${circumference}`}
                  strokeDashoffset={`${circumference * (1 - gateOutPct / 100)}`}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className={`text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{gateOutPct}%</span>
                <span className="text-[10px] font-extrabold text-cyan-500 uppercase tracking-widest mt-0.5">
                  Checked Out
                </span>
              </div>
            </div>

            {/* Metrics legend */}
            <div className="space-y-4 w-full sm:w-auto">
              <div className={`flex items-center justify-between sm:justify-start gap-4 p-3 rounded-xl border ${
                isDark ? 'bg-[#090D16] border-slate-800' : 'bg-slate-50 border-slate-200/80'
              }`}>
                <div className="flex items-center gap-2.5">
                  <div className="w-3.5 h-3.5 rounded-md bg-cyan-500 shadow-xs" />
                  <span className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Used (Out)</span>
                </div>
                <span className={`text-xs font-black font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>{stats.gateOutPasses?.used ?? 0}</span>
              </div>

              <div className={`flex items-center justify-between sm:justify-start gap-4 p-3 rounded-xl border ${
                isDark ? 'bg-[#090D16] border-slate-800' : 'bg-slate-50 border-slate-200/80'
              }`}>
                <div className="flex items-center gap-2.5">
                  <div className={`w-3.5 h-3.5 rounded-md ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
                  <span className={`text-xs font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Unused (Remaining)</span>
                </div>
                <span className={`text-xs font-black font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{stats.gateOutPasses?.unused ?? 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RECENT REGISTRATIONS TABLE CARD */}
      <div className={`border rounded-3xl p-6 md:p-7 shadow-sm ${
        isDark ? 'bg-[#131B2A] border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className={`flex items-center justify-between mb-6 pb-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
          <div>
            <h3 className={`text-lg font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Recent Attendee Registrations</h3>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Latest visitors registered &amp; checked into the expo</p>
          </div>
          <Link
            href="/admin/visitors"
            className={`px-3.5 py-2 rounded-xl text-[#01A64E] text-xs font-extrabold transition-all flex items-center gap-1.5 border ${
              isDark ? 'bg-[#090D16] border-slate-700 hover:bg-slate-800 text-[#79C143]' : 'bg-slate-100 hover:bg-slate-200 border-slate-200/80'
            }`}
          >
            <span>View All Visitors</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        <div className={`overflow-x-auto rounded-2xl border ${isDark ? 'bg-[#090D16] border-slate-800' : 'bg-white border-slate-200'}`}>
          <table className="w-full text-left text-xs">
            <thead className={`uppercase text-[10px] font-extrabold border-b ${
              isDark ? 'bg-[#090D16] text-slate-400 border-slate-800' : 'bg-slate-50 text-slate-600 border-slate-200'
            }`}>
              <tr>
                <th className="py-3.5 px-5">Badge Code</th>
                <th className="py-3.5 px-5">Full Name</th>
                <th className="py-3.5 px-5">Category</th>
                <th className="py-3.5 px-5">Status</th>
              </tr>
            </thead>
            <tbody className={`divide-y font-medium ${isDark ? 'divide-slate-800/80' : 'divide-slate-100'}`}>
              {stats.recentVisitors && stats.recentVisitors.length > 0 ? (
                stats.recentVisitors.map((v: any) => (
                  <tr key={v.id} className={`transition-colors ${isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50/80'}`}>
                    <td className="py-3.5 px-5 font-mono font-extrabold text-[#01A64E]">
                      <span className={`px-2.5 py-1 rounded-lg border ${
                        isDark ? 'bg-emerald-500/10 text-[#79C143] border-emerald-500/30' : 'bg-emerald-50 text-[#01A64E] border-emerald-200/80'
                      }`}>
                        {v.badgeCode}
                      </span>
                    </td>
                    <td className={`py-3.5 px-5 font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{v.fullName}</td>
                    <td className="py-3.5 px-5">
                      <span className={`px-2.5 py-1 rounded-md text-[11px] font-extrabold border ${
                        isDark ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        {v.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className={`px-3 py-1 rounded-full text-[11px] font-extrabold border ${
                        v.status === 'CHECKED_IN'
                          ? isDark ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : v.status === 'ON_BREAK'
                          ? isDark ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-amber-50 text-amber-700 border-amber-200'
                          : v.status === 'CHECKED_OUT'
                          ? isDark ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' : 'bg-rose-50 text-rose-700 border-rose-200'
                          : isDark ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                        {v.status === 'CHECKED_IN' ? 'Checked In'
                          : v.status === 'ON_BREAK' ? 'On Break'
                          : v.status === 'CHECKED_OUT' ? 'Checked Out'
                          : v.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="transition-colors">
                  <td colSpan={4} className="py-8 px-5 text-center text-slate-500 font-medium">
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

