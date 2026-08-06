'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Building2,
  Calendar,
  QrCode,
  LogOut,
  ExternalLink,
  Menu,
  X,
  RefreshCw,
  ShieldCheck,
  DoorOpen,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface AdminNavbarProps {
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export default function AdminNavbar({ onRefresh, isRefreshing }: AdminNavbarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const allNavLinks = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard, roles: ['SUPER_ADMIN', 'EVENT_MANAGER'] },
    { name: 'Visitors (75k+)', href: '/admin/visitors', icon: Users, roles: ['SUPER_ADMIN', 'EVENT_MANAGER'] },
    { name: 'Exhibitors', href: '/admin/exhibitors', icon: Building2, roles: ['SUPER_ADMIN', 'EVENT_MANAGER'] },
    { name: 'Gate Scanner', href: '/admin/checkin', icon: QrCode, roles: ['SUPER_ADMIN', 'EVENT_MANAGER', 'GATE_OFFICER'] },
    { name: 'Gates', href: '/admin/gates', icon: DoorOpen, roles: ['SUPER_ADMIN', 'EVENT_MANAGER'] },
    { name: 'Staff Users', href: '/admin/users', icon: UserCheck, roles: ['SUPER_ADMIN', 'EVENT_MANAGER'] },
  ];

  const navLinks = allNavLinks.filter((link) =>
    !user?.role || link.roles.includes(user.role)
  );

  const isActive = (path: string) => {
    if (path === '/admin/dashboard') {
      return pathname === '/admin/dashboard';
    }
    return pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-900/95 border-b border-slate-800/80 backdrop-blur-xl w-full">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="h-16 flex items-center justify-between gap-2 sm:gap-4"
          style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
        >
          {/* LEFT: LOGO & BRAND TITLE */}
          <div className="flex items-center gap-3 shrink-0" style={{ display: 'flex', alignItems: 'center' }}>
            <Link href="/admin/dashboard" className="flex items-center gap-3 group" style={{ display: 'flex', alignItems: 'center' }}>
              {/* eslint-disable-next-html-element-for-jsx */}
              <img
                src="/assets/logo/logo3.png"
                alt="Masters Expo Logo"
                className="h-8 sm:h-9 object-contain group-hover:scale-105 transition-transform"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="border-l border-slate-800 pl-3">
                <span className="font-black text-white text-xs sm:text-sm leading-tight block tracking-tight whitespace-nowrap">
                  Event Management System
                </span>
                <span className="text-[10px] font-bold text-emerald-400 tracking-wide flex items-center gap-1 whitespace-nowrap">
                  <ShieldCheck className="w-3 h-3 text-emerald-400 inline shrink-0" />
                  Masters Kerala RE 2.0 EXPO26
                </span>
              </div>
            </Link>
          </div>

          {/* MIDDLE: DESKTOP NAVIGATION TABS (PROPERLY SPACED PILLS) */}
          <nav
            className="hidden md:flex items-center bg-slate-950/80 rounded-2xl border border-slate-800 shrink-0"
            style={{
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'nowrap',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 8px',
            }}
          >
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    display: 'inline-flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    whiteSpace: 'nowrap',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: '10px',
                    fontSize: '12px',
                    fontWeight: 700,
                    textDecoration: 'none',
                    transition: 'all 0.2s ease',
                    background: active ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                    border: active ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid transparent',
                    color: active ? '#34d399' : '#94a3b8',
                  }}
                  className="hover:text-slate-200 hover:bg-slate-800/60"
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${active ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* RIGHT: ACTIONS & USER PROFILE */}
          <div
            className="hidden sm:flex items-center gap-2 shrink-0"
            style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}
          >
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={isRefreshing}
                title="Refresh Analytics Data"
                className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-300 hover:text-white hover:bg-slate-700/80 transition-all disabled:opacity-50 shrink-0"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
              </button>
            )}

            <Link
              href="/"
              target="_blank"
              style={{ display: 'inline-flex', flexDirection: 'row', alignItems: 'center', gap: '4px' }}
              className="px-3 py-1.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-300 hover:text-white hover:bg-slate-700/80 text-xs font-semibold transition-all shrink-0"
            >
              <span>Website</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </Link>

            <div className="h-4 w-px bg-slate-800 mx-0.5" />

            {/* USER BADGE & LOGOUT */}
            <div
              className="flex items-center gap-2 bg-slate-950/80 border border-slate-800 px-2.5 py-1 rounded-xl shrink-0"
              style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}
            >
              <div className="text-right">
                <span className="text-[11px] font-extrabold text-white block leading-none truncate max-w-[120px]">
                  {user?.name || 'Admin'}
                </span>
                <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider block">
                  {user?.role || 'SUPER_ADMIN'}
                </span>
              </div>
              <button
                onClick={logout}
                title="Logout"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* MOBILE HAMBURGER BUTTON */}
          <div className="flex md:hidden items-center gap-2">
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={isRefreshing}
                className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE DROPDOWN MENU */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 pt-3 pb-4 space-y-2">
          <div className="grid grid-cols-1 gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 ${
                    active
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">{user?.email || 'admin@expokerala.com'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/"
                target="_blank"
                className="px-2.5 py-1 rounded-lg bg-slate-800 text-xs font-semibold text-slate-300 flex items-center gap-1"
              >
                <span>Site</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
              <button
                onClick={logout}
                className="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-bold flex items-center gap-1"
              >
                <LogOut className="w-3 h-3" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
