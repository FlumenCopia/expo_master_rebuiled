'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { AuthProvider } from '@/context/AuthContext';
import { AdminThemeProvider } from '@/context/AdminThemeContext';
import { ToastProvider } from '@/context/ToastContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminSidebar from '@/components/AdminSidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';

  return (
    <AuthProvider>
      <AdminThemeProvider>
        <ToastProvider>
          <ProtectedRoute>
            {isLoginPage ? children : <AdminSidebar>{children}</AdminSidebar>}
          </ProtectedRoute>
        </ToastProvider>
      </AdminThemeProvider>
    </AuthProvider>
  );
}
