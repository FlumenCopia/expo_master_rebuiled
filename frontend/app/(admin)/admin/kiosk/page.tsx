'use client';

import React, { useState, useEffect } from 'react';
import { Search, Printer, CheckCircle2, UserPlus, Phone, Mail, Building2, BadgeAlert, Sparkles, RefreshCw } from 'lucide-react';
import { useAdminTheme } from '@/context/AdminThemeContext';
import { useToast } from '@/context/ToastContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { fetchApi } from '@/lib/api-client';

export default function RegistrationKioskPage() {
  const { isDark } = useAdminTheme();
  const { showToast } = useToast();

  const [query, setQuery] = useState('');
  const [visitors, setVisitors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [printingId, setPrintingId] = useState<string | null>(null);

  // Spot registration modal state
  const [showSpotModal, setShowSpotModal] = useState(false);
  const [spotForm, setSpotForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    company: '',
    category: 'VISITOR',
  });
  const [submittingSpot, setSubmittingSpot] = useState(false);

  // Search visitors dynamically
  useEffect(() => {
    if (query.trim().length < 2) {
      setVisitors([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await fetchApi<any>(`/api/admin/visitors?search=${encodeURIComponent(query)}&limit=10`);
        if (data.success || data.visitors) {
          setVisitors(data.data || data.visitors || []);
        }
      } catch (err) {
        console.error('Kiosk Search Error:', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  // Handle Print Badge & Check In
  const handlePrintAndCheckIn = async (visitor: any) => {
    setPrintingId(visitor.id);
    try {
      // Mark checked in
      await fetchApi<any>('/api/checkin/verify', {
        method: 'POST',
        body: JSON.stringify({
          badgeCode: visitor.badgeCode,
          gateName: 'Registration Kiosk Counter',
          mode: 'IN',
        }),
      });

      showToast(`🖨️ Printing badge for ${visitor.fullName} (${visitor.badgeCode})`, 'success');

      // Open badge page with print trigger
      window.open(`/badge/${visitor.badgeCode}?print=true`, '_blank');
    } catch (err) {
      showToast('Failed to check in visitor for print', 'error');
    } finally {
      setPrintingId(null);
    }
  };

  // Submit spot registration
  const handleSpotRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!spotForm.fullName || !spotForm.phone) {
      showToast('Please enter at least Name and Phone number', 'error');
      return;
    }

    setSubmittingSpot(true);
    try {
      const data = await fetchApi<any>('/api/register/visitor', {
        method: 'POST',
        body: JSON.stringify(spotForm),
      });

      const badgeCode = data?.badgeCode || data?.visitor?.badgeCode;

      if (data.success && badgeCode) {
        showToast(`✅ Spot Registration Complete! Badge: ${badgeCode}`, 'success');
        setShowSpotModal(false);
        setSpotForm({ fullName: '', phone: '', email: '', company: '', category: 'VISITOR' });
        // Auto print badge
        window.open(`/badge/${badgeCode}?print=true`, '_blank');
      } else {
        showToast(data.message || data.error || 'Spot registration failed', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Network error during spot registration', 'error');
    } finally {
      setSubmittingSpot(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'EVENT_MANAGER', 'GATE_OFFICER']}>
      <div className={`p-4 md:p-8 min-h-screen transition-colors duration-200 ${isDark ? 'bg-[#090D16] text-slate-100' : 'bg-[#F8FAFC] text-slate-800'}`}>
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <Printer className="w-7 h-7 text-[#01A64E]" />
              <h1 className="text-2xl md:text-3xl font-black tracking-tight">On-Site Badge Kiosk</h1>
            </div>
            <p className={`text-xs md:text-sm mt-1 font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Fast lookup, 1-click thermal badge printing, and instant check-in for attendees.
            </p>
          </div>

          <button
            onClick={() => setShowSpotModal(true)}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#01A64E] to-[#79C143] hover:brightness-110 text-white font-extrabold flex items-center gap-2 shadow-lg shadow-[#01A64E]/25 cursor-pointer transition-all shrink-0"
          >
            <UserPlus className="w-5 h-5" />
            <span>New Spot Registration</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="max-w-3xl mb-4">
          <div className="relative">
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search attendee by Phone, Email, Name, or Badge Code (e.g., EXPO26-X89A1)..."
              className={`w-full pl-13 pr-10 py-4 rounded-2xl text-base md:text-lg font-bold outline-none border transition-all ${
                isDark
                  ? 'bg-[#131B2A] border-slate-800 text-white placeholder:text-slate-500 focus:border-[#01A64E] focus:ring-4 focus:ring-[#01A64E]/10'
                  : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-[#01A64E] focus:ring-4 focus:ring-[#01A64E]/10'
              }`}
              autoFocus
            />
            {loading && (
              <RefreshCw className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#01A64E] animate-spin" />
            )}
          </div>
        </div>

        {/* Touchscreen Quick Keypad Row */}
        <div className="max-w-3xl flex items-center gap-1.5 mb-8 overflow-x-auto pb-1">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => setQuery((prev) => prev + digit)}
              className={`px-4 py-2 rounded-xl text-sm font-black border transition-all cursor-pointer ${
                isDark
                  ? 'bg-[#131B2A] border-slate-800 text-slate-200 hover:bg-slate-800'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 shadow-xs'
              }`}
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setQuery('')}
            className="px-4 py-2 rounded-xl text-xs font-black bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 transition-all cursor-pointer"
          >
            Clear
          </button>
        </div>

        {/* Search Results List */}
        {visitors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl">
            {visitors.map((visitor) => (
              <div
                key={visitor.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                  isDark
                    ? 'bg-[#131B2A] border-slate-800 hover:border-[#01A64E]/40'
                    : 'bg-white border-slate-200 hover:border-[#01A64E]/40 shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <h3 className="text-lg font-black">{visitor.fullName}</h3>
                      <span className="font-mono text-xs font-extrabold text-[#79C143] tracking-wide">{visitor.badgeCode}</span>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider ${
                        visitor.category === 'VIP'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          : visitor.category === 'EXHIBITOR'
                          ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                          : 'bg-[#01A64E]/10 text-[#79C143] border border-[#01A64E]/30'
                      }`}
                    >
                      {visitor.category}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs font-medium text-slate-400 mb-4">
                    {visitor.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span>{visitor.phone}</span>
                      </div>
                    )}
                    {visitor.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="truncate">{visitor.email}</span>
                      </div>
                    )}
                    {visitor.company && (
                      <div className="flex items-center gap-2">
                        <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="truncate">{visitor.company} ({visitor.designation || 'Attendee'})</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/50 flex items-center justify-between gap-3">
                  <span
                    className={`text-[11px] font-extrabold px-2.5 py-1 rounded-md ${
                      visitor.status === 'CHECKED_IN'
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-slate-700/30 text-slate-400'
                    }`}
                  >
                    Status: {visitor.status}
                  </span>

                  <button
                    onClick={() => handlePrintAndCheckIn(visitor)}
                    disabled={printingId === visitor.id}
                    className="px-4 py-2 rounded-xl bg-[#01A64E] hover:bg-[#79C143] text-white text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-[#01A64E]/20 disabled:opacity-50"
                  >
                    <Printer className="w-4 h-4" />
                    <span>{printingId === visitor.id ? 'Printing...' : 'Print Badge & Entry'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : query.trim().length >= 2 && !loading ? (
          <div className={`p-8 text-center max-w-xl rounded-2xl border ${isDark ? 'bg-[#131B2A] border-slate-800' : 'bg-white border-slate-200'}`}>
            <BadgeAlert className="w-12 h-12 text-amber-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold">No registered attendee found for "{query}"</h3>
            <p className="text-xs text-slate-400 mt-1 mb-4">You can quickly register them as a spot visitor below.</p>
            <button
              onClick={() => {
                setSpotForm((prev) => ({ ...prev, fullName: query }));
                setShowSpotModal(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-[#01A64E] text-white text-xs font-bold inline-flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Register "{query}" Now</span>
            </button>
          </div>
        ) : (
          <div className="text-xs font-semibold text-slate-500">
            Type an attendee's phone, email, or badge code above to search.
          </div>
        )}

        {/* Spot Registration Modal */}
        {showSpotModal && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className={`w-full max-w-md p-6 rounded-3xl border shadow-2xl ${isDark ? 'bg-[#131B2A] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-[#01A64E]" />
                  <h2 className="text-lg font-black">Spot Registration</h2>
                </div>
                <button onClick={() => setShowSpotModal(false)} className="text-slate-400 hover:text-white font-bold text-lg">×</button>
              </div>

              <form onSubmit={handleSpotRegistration} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={spotForm.fullName}
                    onChange={(e) => setSpotForm({ ...spotForm, fullName: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none ${isDark ? 'bg-[#090D16] border-slate-700 text-white' : 'bg-slate-50 border-slate-300'}`}
                    placeholder="Enter visitor's full name"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={spotForm.phone}
                    onChange={(e) => setSpotForm({ ...spotForm, phone: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none ${isDark ? 'bg-[#090D16] border-slate-700 text-white' : 'bg-slate-50 border-slate-300'}`}
                    placeholder="Mobile number"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={spotForm.email}
                    onChange={(e) => setSpotForm({ ...spotForm, email: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none ${isDark ? 'bg-[#090D16] border-slate-700 text-white' : 'bg-slate-50 border-slate-300'}`}
                    placeholder="email@example.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Company / Organization</label>
                  <input
                    type="text"
                    value={spotForm.company}
                    onChange={(e) => setSpotForm({ ...spotForm, company: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none ${isDark ? 'bg-[#090D16] border-slate-700 text-white' : 'bg-slate-50 border-slate-300'}`}
                    placeholder="Company name"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Pass Category</label>
                  <select
                    value={spotForm.category}
                    onChange={(e) => setSpotForm({ ...spotForm, category: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none ${isDark ? 'bg-[#090D16] border-slate-700 text-white' : 'bg-slate-50 border-slate-300'}`}
                  >
                    <option value="VISITOR">VISITOR PASS</option>
                    <option value="DELEGATE">DELEGATE PASS</option>
                    <option value="VIP">VIP PASS</option>
                    <option value="PRESS">PRESS PASS</option>
                  </select>
                </div>

                <div className="pt-4 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowSpotModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-700 text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingSpot}
                    className="px-5 py-2 rounded-xl bg-[#01A64E] hover:bg-[#79C143] text-white text-xs font-extrabold flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Printer className="w-4 h-4" />
                    <span>{submittingSpot ? 'Registering...' : 'Register & Print Badge'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
