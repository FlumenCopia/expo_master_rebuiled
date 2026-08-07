'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth();
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
      <div
        style={{
          minHeight: '100vh',
          background: 'radial-gradient(circle at top center, #0b3d46 0%, #03151a 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#79C143',
          fontFamily: "'Manrope', sans-serif, system-ui",
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              border: '3px solid rgba(1,166,78,0.2)',
              borderTopColor: '#79C143',
              borderRadius: '50%',
              margin: '0 auto 16px',
              animation: 'spin 0.8s linear infinite',
            }}
          />
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          <p style={{ fontSize: '15px', fontWeight: 800, color: '#ffffff', letterSpacing: '0.5px' }}>
            Verifying Event Management Security Credentials...
          </p>
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
