'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useAdminTheme } from '@/context/AdminThemeContext';

export default function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles?: string[];
}) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { isDark } = useAdminTheme();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        if (pathname !== '/admin/login') {
          router.replace('/admin/login');
        }
      } else {
        // Role-based routing guard
        if (user?.role === 'GATE_OFFICER') {
          // Gate officers are restricted to the Gate Scanner
          if (pathname !== '/admin/checkin') {
            router.replace('/admin/checkin');
          }
        } else {
          // Admins & Managers
          if (pathname === '/admin/login') {
            router.replace('/admin/dashboard');
          }
        }
      }
    }
  }, [user, isAuthenticated, isLoading, pathname, router]);

  if (isLoading) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-6 font-sans transition-colors duration-200 ${
        isDark ? 'bg-[#090D16] text-slate-100' : 'bg-[#F8FAFC] text-slate-800'
      }`}>
        <div className="text-center space-y-4 max-w-sm">
          <div className="relative w-14 h-14 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-[#01A64E]/20 animate-ping" />
            <div className="w-12 h-12 rounded-full border-3 border-[#01A64E]/20 border-t-[#79C143] animate-spin" />
          </div>
          <div>
            <h2 className={`text-base font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Verifying Credentials
            </h2>
            <p className={`text-xs mt-1 font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              MASTERS EXPO26 Event Management Portal
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Prevent flash of protected content before redirect
  if (!isAuthenticated && pathname !== '/admin/login') {
    return null;
  }

  if (isAuthenticated && pathname === '/admin/login') {
    return null;
  }

  return <>{children}</>;
}
