'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, LogIn, ArrowLeft, Lock, Mail, Sun, Moon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useAdminTheme } from '@/context/AdminThemeContext';
import { useToast } from '@/context/ToastContext';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { isDark, toggleTheme } = useAdminTheme();
  const { error: toastError, success: toastSuccess } = useToast();

  const [email, setEmail] = useState('mastersassociationmedia@gmail.com');
  const [password, setPassword] = useState('123456');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const role = await login(email, password);
      toastSuccess('Welcome to MASTERS EXPO26 Portal!', 'Authenticated Successfully');
      // Gate officers go directly to the scanner — no admin panel
      if (role === 'GATE_OFFICER') {
        router.replace('/admin/checkin');
      } else {
        router.replace('/admin/dashboard');
      }
    } catch (err: any) {
      const errMsg = err.message || 'Invalid username or password';
      setError(errMsg);
      toastError(errMsg, 'Authentication Failed');
    } finally {
      setLoading(false);
    }
  };

  const logoSrc = isDark ? '/assets/logo/logo3.png' : '/assets/logo/logoblc.png';

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-3 sm:p-6 font-sans relative transition-colors duration-200 selection:bg-[#01A64E] selection:text-white ${
      isDark ? 'bg-[#090D16] text-slate-100' : 'bg-[#F8FAFC] text-slate-900'
    }`}>
      {/* TOP BAR THEME TOGGLE */}
      <div className="absolute top-3 right-3 sm:top-5 sm:right-5 z-20">
        <button
          onClick={toggleTheme}
          type="button"
          className={`p-2 sm:p-2.5 rounded-xl sm:rounded-2xl border transition-all cursor-pointer shadow-sm ${
            isDark
              ? 'bg-[#131B2A] border-slate-800 text-amber-400 hover:bg-slate-800'
              : 'bg-white border-slate-200 text-indigo-600 hover:bg-slate-100'
          }`}
          title="Toggle Admin Theme"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>

      {/* BACKGROUND DECORATIVE GLOW */}
      <div className={`absolute top-1/4 left-1/2 -translate-x-1/2 w-72 sm:w-96 h-72 sm:h-96 blur-[100px] sm:blur-[120px] rounded-full pointer-events-none ${
        isDark ? 'bg-[#01A64E]/10' : 'bg-[#01A64E]/15'
      }`} />

      <div className="max-w-md w-full space-y-4 sm:space-y-6 relative z-10 my-auto">
        {/* LOGO & BRANDING */}
        <div className="text-center space-y-2 sm:space-y-3">
          <Link href="/" className="inline-block hover:opacity-90 transition-opacity">
            <img
              src={logoSrc}
              alt="Masters Expo Logo"
              className="h-11 sm:h-16 mx-auto object-contain max-w-[240px] sm:max-w-none"
            />
          </Link>
          <div>
            <h1 className={`text-lg sm:text-2xl font-black tracking-tight ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              Event Management Portal
            </h1>
            <div className={`inline-flex items-center justify-center gap-1.5 px-3 py-0.5 sm:py-1 mt-1.5 rounded-full border text-[10px] sm:text-[11px] font-black uppercase tracking-wider max-w-full ${
              isDark
                ? 'bg-[#01A64E]/15 border-[#01A64E]/30 text-[#79C143]'
                : 'bg-emerald-50 border-emerald-200 text-emerald-700'
            }`}>
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">MASTERS EXPO26 ADMIN PORTAL</span>
            </div>
          </div>
        </div>

        {/* LOGIN CARD */}
        <div className={`border rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-2xl backdrop-blur-xl transition-colors ${
          isDark
            ? 'bg-[#131B2A] border-slate-800 shadow-black/50'
            : 'bg-white border-slate-200 shadow-slate-200/60'
        }`}>
          {error && (
            <div className="bg-rose-500/15 border border-rose-500/30 text-rose-400 px-3 py-2.5 rounded-xl text-xs font-semibold mb-4 text-center animate-in fade-in">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5">
            <div>
              <label className={`block text-[11px] sm:text-xs font-bold uppercase tracking-wider mb-1.5 ${
                isDark ? 'text-slate-400' : 'text-slate-600'
              }`}>
                Username / Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400 pointer-events-none" />
                <input
                  type="email"
                  required
                  placeholder="admin@expokerala.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-10 pr-3 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl border text-xs sm:text-sm font-medium focus:outline-none focus:border-[#01A64E] transition-colors truncate ${
                    isDark
                      ? 'bg-[#090D16] border-slate-700 text-white placeholder-slate-500'
                      : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className={`block text-[11px] sm:text-xs font-bold uppercase tracking-wider mb-1.5 ${
                isDark ? 'text-slate-400' : 'text-slate-600'
              }`}>
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400 pointer-events-none" />
                <input
                  type="password"
                  required
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-10 pr-3 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl border text-xs sm:text-sm font-medium focus:outline-none focus:border-[#01A64E] transition-colors ${
                    isDark
                      ? 'bg-[#090D16] border-slate-700 text-white placeholder-slate-500'
                      : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                  }`}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 sm:py-3.5 px-4 rounded-xl sm:rounded-2xl bg-[#01A64E] hover:bg-[#79C143] text-white font-black text-xs sm:text-sm tracking-wide transition-all shadow-md shadow-[#01A64E]/20 hover:shadow-lg hover:shadow-[#01A64E]/30 active:scale-[0.99] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <LogIn className="w-4 h-4 shrink-0" />
                  <span>Login to Event Management</span>
                </>
              )}
            </button>
          </form>

          <div className={`mt-5 pt-4 border-t text-center ${
            isDark ? 'border-slate-800' : 'border-slate-100'
          }`}>
            <Link
              href="/"
              className={`text-xs font-bold transition-colors inline-flex items-center gap-1.5 ${
                isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Return to Public Website
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
