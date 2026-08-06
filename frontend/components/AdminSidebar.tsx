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
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AdminSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  // If on login page, render content directly without admin sidebar
  if (pathname === '/admin/login') {
    return <>{children}</>;
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

  return (
    <div className="min-h-screen bg-[#03151a] text-slate-100 flex flex-col md:flex-row font-sans">
      {/* MOBILE TOP BAR */}
      <div className="md:hidden sticky top-0 z-50 bg-[#072228] border-b border-[#0b3d46] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#7fee00] flex items-center justify-center font-black text-[#03151a] text-xs">
            EXPO
          </div>
          <span className="font-extrabold text-sm text-white tracking-tight">EVENT MANAGEMENT</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg bg-[#0b3d46] text-slate-300 hover:text-white"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* LEFT SIDEBAR NAVIGATION */}
      <aside
        className={`fixed md:sticky top-0 z-40 h-screen w-64 bg-[#072228] border-r border-[#0b3d46] flex flex-col transition-all duration-300 ${
          mobileOpen ? 'left-0' : '-left-64 md:left-0'
        }`}
      >
        {/* LOGO HEADER */}
        <div className="p-5 border-b border-[#0b3d46] flex items-center justify-between">
          <Link href="/admin/dashboard" className="flex items-center gap-3">
            <img
              src="/assets/logo/logo3.png"
              alt="Masters EXPO26"
              className="h-10 object-contain"
            />
          </Link>
        </div>

        {/* SIDEBAR MENU NAVIGATION */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6 custom-scrollbar">
          {/* MAIN NAVIGATION */}
          <div className="space-y-1">
            <div className="text-[10px] font-black uppercase tracking-wider text-[#7fee00] px-3 mb-2">
              NAVIGATION
            </div>

            {/* Gatekeeper Role View: Scanner Only */}
            {user?.role === 'GATE_OFFICER' ? (
              <Link
                href="/admin/checkin"
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive('/admin/checkin')
                    ? 'bg-[#7fee00]/15 text-[#7fee00] border border-[#7fee00]/30 shadow-md shadow-[#7fee00]/10'
                    : 'text-slate-300 hover:text-white hover:bg-[#0b3d46]/60'
                }`}
              >
                <QrCode className="w-4 h-4 text-[#7fee00]" />
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
                      ? 'bg-[#7fee00]/15 text-[#7fee00] border border-[#7fee00]/30 shadow-md shadow-[#7fee00]/10'
                      : 'text-slate-300 hover:text-white hover:bg-[#0b3d46]/60'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 text-[#7fee00]" />
                  <span>Dashboard</span>
                </Link>

                {/* Events */}
                <Link
                  href="/admin/events"
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive('/admin/events')
                      ? 'bg-[#7fee00]/15 text-[#7fee00] border border-[#7fee00]/30 shadow-md shadow-[#7fee00]/10'
                      : 'text-slate-300 hover:text-white hover:bg-[#0b3d46]/60'
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
                      ? 'bg-[#7fee00]/15 text-[#7fee00] border border-[#7fee00]/30 shadow-md shadow-[#7fee00]/10'
                      : 'text-slate-300 hover:text-white hover:bg-[#0b3d46]/60'
                  }`}
                >
                  <CalendarDays className="w-4 h-4" />
                  <span>Sub Events</span>
                </Link>

                {/* Visitors Dropdown */}
                <div>
                  <button
                    onClick={() => toggleMenu('visitors')}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-[#0b3d46]/60 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <Users className="w-4 h-4" />
                      <span>Visitors</span>
                    </div>
                    {openMenus.visitors ? <ChevronDown className="w-3.5 h-3.5 text-[#7fee00]" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  </button>

                  {openMenus.visitors && (
                    <div className="ml-7 mt-1 space-y-1 border-l border-[#0b3d46] pl-3">
                      <Link
                        href="/admin/visitors"
                        onClick={() => setMobileOpen(false)}
                        className={`block py-2 px-2.5 rounded-lg text-xs font-semibold ${
                          isActive('/admin/visitors')
                            ? 'text-[#7fee00] bg-[#7fee00]/10'
                            : 'text-slate-300 hover:text-white'
                        }`}
                      >
                        Visitor List
                      </Link>
                      <Link
                        href="/admin/visitors/reports"
                        onClick={() => setMobileOpen(false)}
                        className={`block py-2 px-2.5 rounded-lg text-xs font-semibold ${
                          isActive('/admin/visitors/reports')
                            ? 'text-[#7fee00] bg-[#7fee00]/10'
                            : 'text-slate-300 hover:text-white'
                        }`}
                      >
                        Visitor Reports
                      </Link>
                    </div>
                  )}
                </div>

                {/* Exhibitors */}
                <Link
                  href="/admin/exhibitors"
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive('/admin/exhibitors')
                      ? 'bg-[#7fee00]/15 text-[#7fee00] border border-[#7fee00]/30 shadow-md shadow-[#7fee00]/10'
                      : 'text-slate-300 hover:text-white hover:bg-[#0b3d46]/60'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>Exhibitors</span>
                </Link>

                {/* Reports */}
                <Link
                  href="/admin/visitors/reports"
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive('/admin/visitors/reports')
                      ? 'bg-[#7fee00]/15 text-[#7fee00] border border-[#7fee00]/30 shadow-md shadow-[#7fee00]/10'
                      : 'text-slate-300 hover:text-white hover:bg-[#0b3d46]/60'
                  }`}
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Reports</span>
                </Link>

                {/* Gate Scanner */}
                <Link
                  href="/admin/checkin"
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive('/admin/checkin')
                      ? 'bg-[#7fee00]/15 text-[#7fee00] border border-[#7fee00]/30 shadow-md shadow-[#7fee00]/10'
                      : 'text-slate-300 hover:text-white hover:bg-[#0b3d46]/60'
                  }`}
                >
                  <QrCode className="w-4 h-4 text-[#7fee00]" />
                  <span>Gate Scanner</span>
                </Link>

                {/* Gate Management */}
                <Link
                  href="/admin/gates"
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive('/admin/gates')
                      ? 'bg-[#7fee00]/15 text-[#7fee00] border border-[#7fee00]/30 shadow-md shadow-[#7fee00]/10'
                      : 'text-slate-300 hover:text-white hover:bg-[#0b3d46]/60'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Gate Management</span>
                </Link>

                {/* Staff Users */}
                <Link
                  href="/admin/users"
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive('/admin/users')
                      ? 'bg-[#7fee00]/15 text-[#7fee00] border border-[#7fee00]/30 shadow-md shadow-[#7fee00]/10'
                      : 'text-slate-300 hover:text-white hover:bg-[#0b3d46]/60'
                  }`}
                >
                  <Users className="w-4 h-4 text-cyan-400" />
                  <span>Staff & Gatekeepers</span>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* USER FOOTER */}
        <div className="p-4 border-t border-[#0b3d46] bg-[#03151a] flex items-center justify-between">
          <div className="truncate">
            <span className="text-xs font-bold text-white block truncate">{user?.name || 'Masters Admin'}</span>
            <span className="text-[10px] text-slate-400 block truncate">{user?.email || 'Founder'}</span>
          </div>
          <button
            onClick={logout}
            title="Logout"
            className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT CONTAINER */}
      <div className="flex-1 min-w-0 flex flex-col w-full max-w-full overflow-x-hidden">
        {/* TOP SUB-HEADER BAR */}
        <header className="sticky top-0 z-30 bg-[#072228]/95 border-b border-[#0b3d46] backdrop-blur-xl px-4 sm:px-6 md:px-8 py-3.5 flex items-center justify-between w-full max-w-full overflow-hidden">
          <div className="flex items-center gap-2.5 text-xs font-bold text-slate-400 truncate">
            <span className="text-slate-200 font-extrabold tracking-wide shrink-0">EXPO26 ADMIN</span>
            <span className="text-slate-600">/</span>
            <span className="text-[#7fee00] font-extrabold capitalize truncate">
              {pathname.split('/').filter(Boolean).pop()?.replace('-', ' ') || 'Dashboard'}
            </span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#7fee00]/10 border border-[#7fee00]/25 text-[#7fee00] text-[11px] font-extrabold">
              <span className="w-2 h-2 rounded-full bg-[#7fee00] animate-pulse shrink-0" />
              <span className="hidden sm:inline">Masters System Online</span>
              <span className="sm:hidden">Online</span>
            </div>
          </div>
        </header>

        {/* CONTENT AREA */}
        <div className="flex-1 p-4 sm:p-6 md:p-8 bg-[#03151a] w-full max-w-full overflow-x-hidden">{children}</div>
      </div>
    </div>
  );
}
