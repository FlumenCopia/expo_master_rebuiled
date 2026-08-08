'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { AuthProvider } from '@/context/AuthContext';
import { AdminThemeProvider } from '@/context/AdminThemeContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminSidebar from '@/components/AdminSidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';

  if (isLoginPage) {
    return (
      <AuthProvider>
        <AdminThemeProvider>
          <ProtectedRoute>{children}</ProtectedRoute>
        </AdminThemeProvider>
      </AuthProvider>
    );
  }

  return (
    <AuthProvider>
      <AdminThemeProvider>
        <ProtectedRoute>
          <AdminSidebar>{children}</AdminSidebar>
        </ProtectedRoute>
      </AdminThemeProvider>
    </AuthProvider>
  );
}


