'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function AdminRootPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        if (user?.role === 'GATE_OFFICER') {
          router.replace('/admin/checkin');
        } else {
          router.replace('/admin/dashboard');
        }
      } else {
        router.replace('/admin/login');
      }
    }
  }, [user, isAuthenticated, isLoading, router]);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at top center, #0b3d46 0%, #03151a 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ffffff',
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
          Verifying Admin Credentials...
        </p>
      </div>
    </div>
  );
}
