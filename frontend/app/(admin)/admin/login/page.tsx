'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('mastersassociationmedia@gmail.com');
  const [password, setPassword] = useState('123456');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
      router.replace('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at top center, #0b3d46 0%, #03151a 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        fontFamily: "'Manrope', sans-serif, system-ui",
      }}
    >
      <div style={{ maxWidth: '440px', width: '100%' }}>
        {/* LOGO & BRANDING */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <Link href="/">
            {/* eslint-disable-next-html-element-for-jsx */}
            <img
              src="/assets/logo/logo3.png"
              alt="Masters Expo Logo"
              style={{ height: '64px', margin: '0 auto 16px', objectFit: 'contain' }}
            />
          </Link>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#ffffff', margin: '0 0 6px' }}>
            Event Management System
          </h1>
          <p style={{ fontSize: '13px', fontWeight: 700, color: '#79C143', letterSpacing: '0.5px', margin: 0 }}>
            MASTERS KERALA RE 2.0 EXPO26 • SECURE ADMIN PORTAL
          </p>
        </div>

        {/* CARD CONTAINER */}
        <div
          style={{
            background: 'rgba(7, 34, 40, 0.95)',
            border: '1.5px solid rgba(1, 166, 78, 0.45)',
            borderRadius: '20px',
            padding: '32px 28px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
            backdropFilter: 'blur(12px)',
          }}
        >
          {error && (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#fca5a5',
                padding: '12px 14px',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 600,
                marginBottom: '20px',
                textAlign: 'center',
              }}
            >
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.8px',
                  color: '#94a3b8',
                  marginBottom: '8px',
                }}
              >
                Username / Email Address
              </label>
              <input
                type="email"
                required
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '13px 16px',
                  borderRadius: '10px',
                  background: '#ffffff',
                  border: '1.5px solid #cbd5e1',
                  color: '#0f172a',
                  fontSize: '14px',
                  fontWeight: 600,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.8px',
                  color: '#94a3b8',
                  marginBottom: '8px',
                }}
              >
                Password
              </label>
              <input
                type="password"
                required
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '13px 16px',
                  borderRadius: '10px',
                  background: '#ffffff',
                  border: '1.5px solid #cbd5e1',
                  color: '#0f172a',
                  fontSize: '14px',
                  fontWeight: 600,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '15px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #01A64E, #79C143)',
                border: 'none',
                color: '#ffffff',
                fontSize: '15px',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 6px 20px rgba(1, 166, 78, 0.4)',
                marginTop: '10px',
                transition: 'all 0.25s ease',
              }}
            >
              {loading ? 'Authenticating...' : '➜ Login to Event Management'}
            </button>
          </form>

          <div style={{ marginTop: '24px', textAlign: 'center', paddingTop: '18px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <Link
              href="/"
              style={{
                fontSize: '13px',
                color: '#94a3b8',
                textDecoration: 'none',
                fontWeight: 600,
                transition: 'color 0.2s',
              }}
            >
              ← Return to Main Website
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
