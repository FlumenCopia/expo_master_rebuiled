'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Calendar,
  CalendarDays,
  Users,
  FileSpreadsheet,
  Building2,
  Settings,
  QrCode,
  ChevronDown,
  ChevronRight,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Mail,
  Sun,
  Moon,
  Zap,
  Activity,
  Printer,
  Star,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useAdminTheme } from '@/context/AdminThemeContext';

export default function AdminSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useAdminTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  // If on login page, render content directly without admin sidebar
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // Gate Officer: fullscreen scanner layout — no sidebar or topbar
  if (user?.role === 'GATE_OFFICER') {
    return (
      <div className={`min-h-screen flex flex-col font-sans ${isDark ? 'bg-[#090D16] text-slate-100' : 'bg-[#F8FAFC] text-slate-800'}`}>
        {/* Minimal header strip for gate staff */}
        <div className={`sticky top-0 z-50 h-12 px-4 flex items-center justify-between border-b ${isDark ? 'bg-[#131B2A] border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center gap-2">
            <img src={isDark ? '/assets/logo/logo3.png' : '/assets/logo/logoblc.png'} alt="Masters EXPO26" className="h-7 object-contain" />
            <span className={`text-[11px] font-black uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Gate Officer</span>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs font-bold truncate max-w-[120px] ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{user?.name || user?.email}</span>
            <button
              onClick={logout}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-black border cursor-pointer transition-all ${isDark ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20' : 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100'}`}
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </button>
          </div>
        </div>
        {/* Full page content */}
        <div className="flex-1">
          {children}
        </div>
      </div>
    );
  }

  // Expanded state for dropdown menus
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    visitors: pathname.includes('/visitors'),
    exhibitors: pathname.includes('/exhibitors'),
  });

  const toggleMenu = (key: string) => {
    setOpenMenus((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const isActive = (path: string) => pathname === path;

  const logoSrc = isDark ? '/assets/logo/logo3.png' : '/assets/logo/logoblc.png';

  return (
    <div
      className={`min-h-screen flex flex-col md:flex-row font-sans transition-colors duration-200 ${
        isDark ? 'bg-[#090D16] text-slate-100' : 'bg-[#F8FAFC] text-slate-800'
      }`}
    >
      {/* MOBILE OVERLAY BACKDROP */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="md:hidden fixed top-14 inset-x-0 bottom-0 bg-slate-900/60 backdrop-blur-sm z-40 transition-opacity"
        />
      )}

      {/* MOBILE TOP BAR */}
      <div
        className={`md:hidden sticky top-0 z-40 h-14 px-4 flex items-center justify-between shadow-xs border-b ${
          isDark ? 'bg-[#131B2A] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <img
            src={logoSrc}
            alt="Masters EXPO26"
            className="h-8 object-contain shrink-0"
          />
          <span className="font-extrabold text-xs sm:text-sm tracking-tight truncate">EVENT MANAGEMENT</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
              isDark
                ? 'bg-[#1C2638] border-slate-700 text-amber-400'
                : 'bg-slate-100 border-slate-200 text-indigo-600'
            }`}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`p-2 rounded-lg shrink-0 ${
              isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* LEFT SIDEBAR NAVIGATION */}
      <aside
        className={`fixed md:sticky top-14 md:top-0 z-50 h-[calc(100vh-56px)] md:h-screen w-64 max-w-[85vw] border-r shadow-sm flex flex-col transition-all duration-300 ${
          isDark
            ? 'bg-[#131B2A] border-slate-800 text-slate-100'
            : 'bg-white border-slate-200 text-slate-800'
        } ${mobileOpen ? 'left-0' : '-left-full md:left-0'}`}
      >
        {/* LOGO HEADER — visible on desktop only (mobile topbar handles this) */}
        <div className={`hidden md:flex p-5 border-b items-center justify-between ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
          <Link href="/admin/dashboard" onClick={() => setMobileOpen(false)} className="flex items-center gap-3">
            <img
              src={logoSrc}
              alt="Masters EXPO26"
              className="h-9 sm:h-10 object-contain"
            />
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className={`md:hidden p-1.5 rounded-lg ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-slate-900'}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MOBILE SIDEBAR HEADING — only visible on mobile */}
        <div className={`md:hidden flex items-center justify-between px-4 py-3 border-b ${isDark ? 'border-slate-800 text-slate-300' : 'border-slate-100 text-slate-700'}`}>
          <span className="text-xs font-black uppercase tracking-widest">Menu</span>
          <button
            onClick={() => setMobileOpen(false)}
            className={`p-1.5 rounded-lg ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-slate-900'}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SIDEBAR MENU NAVIGATION */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6 custom-scrollbar">
          {/* MAIN NAVIGATION */}
          <div className="space-y-1">
            <div className={`text-[10px] font-black uppercase tracking-wider px-3 mb-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              NAVIGATION
            </div>

            {/* Gatekeeper Role View: Scanner Only */}
            {user?.role === 'GATE_OFFICER' ? (
              <Link
                href="/admin/checkin"
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive('/admin/checkin')
                    ? isDark
                      ? 'bg-[#01A64E]/20 text-[#79C143] border border-[#01A64E]/30'
                      : 'bg-[#01A64E]/10 text-[#01A64E] border border-[#01A64E]/20 shadow-xs'
                    : isDark
                    ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <QrCode className="w-4 h-4 text-[#01A64E]" />
                <span>Gate Scanner</span>
              </Link>
            ) : (
              <>
                {/* Dashboard */}
                <Link
                  href="/admin/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive('/admin/dashboard')
                      ? isDark
                        ? 'bg-[#01A64E]/20 text-[#79C143] border border-[#01A64E]/30'
                        : 'bg-[#01A64E]/10 text-[#01A64E] border border-[#01A64E]/20 shadow-xs'
                      : isDark
                      ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 text-[#01A64E]" />
                  <span>Dashboard</span>
                </Link>

                {/* Events */}
                <Link
                  href="/admin/events"
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive('/admin/events')
                      ? isDark
                        ? 'bg-[#01A64E]/20 text-[#79C143] border border-[#01A64E]/30'
                        : 'bg-[#01A64E]/10 text-[#01A64E] border border-[#01A64E]/20 shadow-xs'
                      : isDark
                      ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  <span>Events</span>
                </Link>

                {/* Sub Events */}
                <Link
                  href="/admin/sub-events"
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive('/admin/sub-events')
                      ? isDark
                        ? 'bg-[#01A64E]/20 text-[#79C143] border border-[#01A64E]/30'
                        : 'bg-[#01A64E]/10 text-[#01A64E] border border-[#01A64E]/20 shadow-xs'
                      : isDark
                      ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <CalendarDays className="w-4 h-4" />
                  <span>Sub Events</span>
                </Link>

                {/* Visitors Dropdown */}
                <div>
                  <button
                    onClick={() => toggleMenu('visitors')}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800/60' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Users className="w-4 h-4" />
                      <span>Visitors</span>
                    </div>
                    {openMenus.visitors ? <ChevronDown className="w-3.5 h-3.5 text-[#01A64E]" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  </button>

                  {openMenus.visitors && (
                    <div className={`ml-7 mt-1 space-y-1 border-l pl-3 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                      <Link
                        href="/admin/visitors"
                        onClick={() => setMobileOpen(false)}
                        className={`block py-2 px-2.5 rounded-lg text-xs font-semibold ${
                          isActive('/admin/visitors')
                            ? isDark ? 'text-[#79C143] bg-[#01A64E]/20 font-bold' : 'text-[#01A64E] bg-[#01A64E]/10 font-bold'
                            : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Visitor List
                      </Link>
                      <Link
                        href="/admin/visitors/reports"
                        onClick={() => setMobileOpen(false)}
                        className={`block py-2 px-2.5 rounded-lg text-xs font-semibold ${
                          isActive('/admin/visitors/reports')
                            ? isDark ? 'text-[#79C143] bg-[#01A64E]/20 font-bold' : 'text-[#01A64E] bg-[#01A64E]/10 font-bold'
                            : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Visitor Reports
                      </Link>
                    </div>
                  )}
                </div>

                {/* Exhibitors Dropdown */}
                <div>
                  <button
                    onClick={() => toggleMenu('exhibitors')}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800/60' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Building2 className="w-4 h-4 text-cyan-500" />
                      <span>Exhibitors</span>
                    </div>
                    {openMenus.exhibitors ? <ChevronDown className="w-3.5 h-3.5 text-[#01A64E]" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  </button>

                  {openMenus.exhibitors && (
                    <div className={`ml-7 mt-1 space-y-1 border-l pl-3 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                      <Link
                        href="/admin/exhibitors"
                        onClick={() => setMobileOpen(false)}
                        className={`block py-2 px-2.5 rounded-lg text-xs font-semibold ${
                          isActive('/admin/exhibitors')
                            ? isDark ? 'text-[#79C143] bg-[#01A64E]/20 font-bold' : 'text-[#01A64E] bg-[#01A64E]/10 font-bold'
                            : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Exhibitor Stalls
                      </Link>
                      <Link
                        href="/admin/company-employees"
                        onClick={() => setMobileOpen(false)}
                        className={`block py-2 px-2.5 rounded-lg text-xs font-semibold ${
                          isActive('/admin/company-employees')
                            ? isDark ? 'text-[#79C143] bg-[#01A64E]/20 font-bold' : 'text-[#01A64E] bg-[#01A64E]/10 font-bold'
                            : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Exhibitor Staff / Badges
                      </Link>
                    </div>
                  )}
                </div>

                {/* Reports */}
                <Link
                  href="/admin/visitors/reports"
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive('/admin/visitors/reports')
                      ? isDark
                        ? 'bg-[#01A64E]/20 text-[#79C143] border border-[#01A64E]/30'
                        : 'bg-[#01A64E]/10 text-[#01A64E] border border-[#01A64E]/20 shadow-xs'
                      : isDark
                      ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Reports</span>
                </Link>

                {/* Email Campaigns & Trigger Mails */}
                <Link
                  href="/admin/email-campaigns"
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive('/admin/email-campaigns')
                      ? isDark
                        ? 'bg-[#01A64E]/20 text-[#79C143] border border-[#01A64E]/30'
                        : 'bg-[#01A64E]/10 text-[#01A64E] border border-[#01A64E]/20 shadow-xs'
                      : isDark
                      ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <Mail className="w-4 h-4 text-purple-500" />
                  <span>Email Campaigns</span>
                </Link>

                {/* Desk Kiosk */}
                <Link
                  href="/admin/kiosk"
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive('/admin/kiosk')
                      ? isDark
                        ? 'bg-[#01A64E]/20 text-[#79C143] border border-[#01A64E]/30'
                        : 'bg-[#01A64E]/10 text-[#01A64E] border border-[#01A64E]/20 shadow-xs'
                      : isDark
                      ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <Printer className="w-4 h-4 text-emerald-400" />
                  <span>Desk Kiosk &amp; Badges</span>
                </Link>

                {/* Gate Scanner */}
                <Link
                  href="/admin/checkin"
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive('/admin/checkin')
                      ? isDark
                        ? 'bg-[#01A64E]/20 text-[#79C143] border border-[#01A64E]/30'
                        : 'bg-[#01A64E]/10 text-[#01A64E] border border-[#01A64E]/20 shadow-xs'
                      : isDark
                      ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <QrCode className="w-4 h-4 text-[#01A64E]" />
                  <span>Gate Scanner</span>
                </Link>

                {/* Gate Management */}
                <Link
                  href="/admin/gates"
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive('/admin/gates')
                      ? isDark
                        ? 'bg-[#01A64E]/20 text-[#79C143] border border-[#01A64E]/30'
                        : 'bg-[#01A64E]/10 text-[#01A64E] border border-[#01A64E]/20 shadow-xs'
                      : isDark
                      ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Gate Management</span>
                </Link>

                {/* Gate Audit Logs */}
                <Link
                  href="/admin/gate-logs"
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive('/admin/gate-logs')
                      ? isDark
                        ? 'bg-[#01A64E]/20 text-[#79C143] border border-[#01A64E]/30'
                        : 'bg-[#01A64E]/10 text-[#01A64E] border border-[#01A64E]/20 shadow-xs'
                      : isDark
                      ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <FileSpreadsheet className="w-4 h-4 text-amber-500" />
                  <span>Gate Audit Logs</span>
                </Link>

                {/* Staff Users */}
                <Link
                  href="/admin/users"
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive('/admin/users')
                      ? isDark
                        ? 'bg-[#01A64E]/20 text-[#79C143] border border-[#01A64E]/30'
                        : 'bg-[#01A64E]/10 text-[#01A64E] border border-[#01A64E]/20 shadow-xs'
                      : isDark
                      ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <Users className="w-4 h-4 text-cyan-500" />
                  <span>Staff &amp; Gatekeepers</span>
                </Link>

                {/* System Health & Telemetry Monitor */}
                <Link
                  href="/admin/load-tester"
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive('/admin/load-tester')
                      ? isDark
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-xs'
                      : isDark
                      ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    <span>System Health &amp; Telemetry</span>
                  </div>
                  <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    LIVE
                  </span>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* USER FOOTER */}
        <div className={`p-4 border-t flex items-center justify-between gap-2 overflow-hidden ${isDark ? 'border-slate-800 bg-[#0D1422]' : 'border-slate-100 bg-slate-50'}`}>
          <div className="min-w-0 flex-1 pr-1">
            <span className={`text-xs font-bold block truncate ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{user?.name || 'Masters Admin'}</span>
            <span className="text-[10px] text-slate-500 block truncate">{user?.email || 'Founder'}</span>
          </div>
          <button
            onClick={logout}
            title="Logout"
            className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50/20 transition-colors shrink-0 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT CONTAINER */}
      <div className="flex-1 min-w-0 flex flex-col w-full max-w-full overflow-x-hidden">
        {/* TOP SUB-HEADER BAR */}
        <header
          className={`sticky top-0 z-30 backdrop-blur-xl px-4 sm:px-6 md:px-8 py-3.5 flex items-center justify-between w-full max-w-full overflow-hidden border-b transition-colors ${
            isDark
              ? 'bg-[#131B2A]/90 border-slate-800 text-slate-100'
              : 'bg-white/90 border-slate-200/80 text-slate-900 shadow-2xs'
          }`}
        >
          <div className="flex items-center gap-2.5 text-xs font-bold text-slate-400 truncate">
            <span className={`font-extrabold tracking-wide shrink-0 ${isDark ? 'text-white' : 'text-slate-900'}`}>EXPO26 ADMIN</span>
            <span className="text-slate-400">/</span>
            <span className="text-[#01A64E] font-extrabold capitalize truncate">
              {pathname.split('/').filter(Boolean).pop()?.replace('-', ' ') || 'Dashboard'}
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* THEME TOGGLE BUTTON */}
            <button
              onClick={toggleTheme}
              className={`hidden md:flex px-3 py-1.5 rounded-xl border items-center gap-2 text-xs font-extrabold transition-all cursor-pointer ${
                isDark
                  ? 'bg-[#1C2638] border-slate-700 text-amber-400 hover:bg-slate-800'
                  : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
              }`}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400 fill-amber-400/20" />
                  <span className="hidden sm:inline text-slate-200">Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-indigo-600 fill-indigo-600/20" />
                  <span className="hidden sm:inline text-slate-700">Dark Mode</span>
                </>
              )}
            </button>

            <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-[11px] font-extrabold ${
              isDark ? 'bg-emerald-500/10 border-emerald-500/20 text-[#79C143]' : 'bg-emerald-50 border-emerald-200/80 text-[#01A64E]'
            }`}>
              <span className="w-2 h-2 rounded-full bg-[#01A64E] animate-pulse shrink-0" />
              <span className="hidden sm:inline">Masters System Online</span>
              <span className="sm:hidden">Online</span>
            </div>
          </div>
        </header>

        {/* CONTENT AREA */}
        <div
          className={`flex-1 p-4 sm:p-6 md:p-8 w-full max-w-full overflow-x-hidden transition-colors ${
            isDark ? 'bg-[#090D16] text-slate-100' : 'bg-[#F8FAFC] text-slate-800'
          }`}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
