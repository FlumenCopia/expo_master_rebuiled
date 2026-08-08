'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL, getAuthHeaders } from '@/lib/api-client';
import { useAdminTheme } from '@/context/AdminThemeContext';
import Pagination from '@/components/Pagination';
import {
  Mail,
  Send,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Eye,
  RefreshCw,
  Search,
  Sparkles,
  Layers,
  Users,
  Building2,
} from 'lucide-react';

interface Campaign {
  id: string;
  title: string;
  subject: string;
  targetAudience: 'VISITORS' | 'EXHIBITORS' | 'ALL';
  templateType: 'WELCOME' | 'REMINDER' | 'ANNOUNCEMENT' | 'CUSTOM';
  content: string;
  status: 'DRAFT' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  scheduledAt?: string;
  sentAt?: string;
  totalRecipients: number;
  sentCount: number;
  failedCount: number;
  createdAt: string;
}

const TEMPLATE_PRESETS = [
  {
    type: 'WELCOME',
    label: '🎉 Welcome & Badge Pass Confirmation',
    subject: 'Pass Confirmed! Entry Pass & Badge: {{badgeCode}} - Masters EXPO26',
    content: `Dear {{fullName}},\n\nYour spot at Masters Kerala RE 2.0 EXPO26 is officially confirmed!\n\nPlease present your digital badge QR code at the entrance gate scanners for instant access.\n\nWe look forward to seeing you at the exhibition!`,
  },
  {
    type: 'REMINDER',
    label: '📅 Pre-Event Reminder (1-Day / Morning)',
    subject: 'Reminder: Masters Kerala RE 2.0 EXPO26 - Badge Pass {{badgeCode}}',
    content: `Hi {{fullName}},\n\nThis is a friendly reminder that Masters Kerala RE 2.0 EXPO26 is taking place from Sept 25 to Sept 27, 2026 at Calicut Trade Centre, Kozhikode.\n\nKeep your QR badge ready on your phone for fast entry scanning.`,
  },
  {
    type: 'ANNOUNCEMENT',
    label: '📢 Special Announcement / Broadcast',
    subject: 'Important Update regarding Masters Kerala RE 2.0 EXPO26',
    content: `Dear {{fullName}},\n\nWe are excited to share key updates for the upcoming Masters Kerala RE 2.0 EXPO26 exhibition.\n\nExplore innovative renewable energy solutions, meet top EPC suppliers, and participate in exclusive technical tracks.`,
  },
];

export default function EmailCampaignsPage() {
  const { isDark } = useAdminTheme();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewCampaign, setPreviewCampaign] = useState<Campaign | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [targetAudience, setTargetAudience] = useState<'VISITORS' | 'EXHIBITORS' | 'ALL'>('VISITORS');
  const [templateType, setTemplateType] = useState<string>('CUSTOM');
  const [content, setContent] = useState('');
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledAt, setScheduledAt] = useState('');
  const [testEmail, setTestEmail] = useState('');
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Stats
  const [stats, setStats] = useState({ totalCampaigns: 0, totalEmailsSent: 0, activeScheduled: 0 });
  const [page, setPage] = useState(1);
  const [limit] = useState(25);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({ search, page: String(page), limit: String(limit) });
      const res = await fetch(`${API_BASE_URL}/api/campaigns?${query.toString()}`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setCampaigns(data.campaigns || []);
        if (data.stats) setStats(data.stats);
        if (data.pagination) setPagination(data.pagination);
      }
    } catch (err) {
      console.error('Failed to load campaigns:', err);
    } finally {
      setLoading(false);
    }
  }, [search, page, limit]);

  useEffect(() => {
    const t = setTimeout(() => fetchCampaigns(), 300);
    return () => clearTimeout(t);
  }, [fetchCampaigns]);

  const handleSelectPreset = (presetType: string) => {
    const preset = TEMPLATE_PRESETS.find((p) => p.type === presetType);
    if (preset) {
      setTemplateType(preset.type);
      setSubject(preset.subject);
      setContent(preset.content);
      if (!title) setTitle(preset.label.replace(/[^a-zA-Z0-9 ]/g, '').trim());
    } else {
      setTemplateType('CUSTOM');
    }
  };

  const handleSendTestEmail = async () => {
    if (!testEmail || !subject || !content) {
      setMessage({ type: 'error', text: 'Please enter Test Email address, Subject, and Body Content' });
      return;
    }
    setTesting(true);
    setMessage(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/campaigns/test-send`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ testEmail, subject, content }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: `Test preview email successfully sent to ${testEmail}` });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to send test email' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Server error while sending test email' });
    } finally {
      setTesting(false);
    }
  };

  const handleSubmitCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    const payload = {
      title,
      subject,
      targetAudience,
      templateType,
      content,
      isScheduled,
      scheduledAt: isScheduled ? scheduledAt : undefined,
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/campaigns/send-now`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success) {
        setMessage({ type: 'success', text: data.message });
        setShowModal(false);
        // Reset form
        setTitle('');
        setSubject('');
        setContent('');
        setIsScheduled(false);
        setScheduledAt('');
        fetchCampaigns();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to trigger campaign' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Server communication error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    if (!confirm('Are you sure you want to delete this campaign record?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/campaigns/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        fetchCampaigns();
      }
    } catch (err) {
      console.error('Delete campaign error:', err);
    }
  };

  const filteredCampaigns = campaigns.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.subject.toLowerCase().includes(search.toLowerCase()) ||
      c.targetAudience.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* HEADER BAR */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl border transition-colors ${
        isDark ? 'bg-[#131B2A] border-slate-800 text-white shadow-xl' : 'bg-white border-slate-200 text-slate-900 shadow-sm'
      }`}>
        <div>
          <h1 className={`text-xl sm:text-2xl font-black flex items-center gap-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <Mail className="w-7 h-7 text-purple-500" />
            <span>Email Campaigns &amp; Auto-Triggers</span>
          </h1>
          <p className={`text-xs sm:text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Dispatch bulk welcome emails, reminder broadcasts, and custom templates with integrated QR badges &amp; Google Calendar invites.
          </p>
        </div>

        <button
          onClick={() => {
            setMessage(null);
            setShowModal(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#01A64E] text-white font-extrabold text-sm hover:bg-[#79C143] transition-all shadow-sm shadow-[#01A64E]/20 cursor-pointer shrink-0 self-start sm:self-auto whitespace-nowrap"
        >
          <Plus className="w-5 h-5" />
          <span>New Campaign / Trigger</span>
        </button>
      </div>

      {/* NOTIFICATION MESSAGES */}
      {message && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 text-sm font-semibold ${
            message.type === 'success'
              ? isDark ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : isDark ? 'bg-rose-500/20 border-rose-500/40 text-rose-300' : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <AlertCircle className="w-5 h-5 text-rose-500" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={`border p-5 rounded-2xl ${isDark ? 'bg-[#131B2A] border-slate-800 shadow-xl' : 'bg-white border-slate-200 shadow-xs'}`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Total Campaigns</span>
            <div className={`p-2.5 rounded-xl border ${isDark ? 'bg-purple-500/10 border-purple-500/30 text-purple-400' : 'bg-purple-50 border-purple-200 text-purple-600'}`}>
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <p className={`text-2xl font-black mt-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>{stats.totalCampaigns}</p>
        </div>

        <div className={`border p-5 rounded-2xl ${isDark ? 'bg-[#131B2A] border-slate-800 shadow-xl' : 'bg-white border-slate-200 shadow-xs'}`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Total Emails Sent</span>
            <div className={`p-2.5 rounded-xl border ${isDark ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-[#01A64E]'}`}>
              <Send className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-[#01A64E] mt-3">{stats.totalEmailsSent.toLocaleString()}</p>
        </div>

        <div className={`border p-5 rounded-2xl ${isDark ? 'bg-[#131B2A] border-slate-800 shadow-xl' : 'bg-white border-slate-200 shadow-xs'}`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Active Scheduled</span>
            <div className={`p-2.5 rounded-xl border ${isDark ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-amber-50 border-amber-200 text-amber-600'}`}>
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-500 mt-3">{stats.activeScheduled}</p>
        </div>
      </div>

      {/* FILTER & SEARCH */}
      <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl border ${
        isDark ? 'bg-[#131B2A] border-slate-800 shadow-xl' : 'bg-white border-slate-200 shadow-xs'
      }`}>
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search campaigns..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full pl-9 pr-4 py-2 border rounded-xl text-xs font-medium focus:outline-none focus:border-[#01A64E] ${
              isDark ? 'bg-[#090D16] border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
            }`}
          />
        </div>

        <button
          onClick={fetchCampaigns}
          className={`flex items-center gap-2 px-3.5 py-2 border rounded-xl text-xs font-bold transition-all cursor-pointer ${
            isDark ? 'bg-[#090D16] border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800' : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-200'
          }`}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* CAMPAIGNS AUDIT TABLE */}
      <div className={`admin-table-container custom-scrollbar border rounded-3xl overflow-hidden ${isDark ? 'bg-[#131B2A] border-slate-800 shadow-xl' : 'bg-white border-slate-200 shadow-sm'}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className={`border-b font-bold uppercase tracking-wider ${
              isDark ? 'bg-[#090D16] border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}>
              <tr>
                <th className="py-3.5 px-4">Campaign Title &amp; Subject</th>
                <th className="py-3.5 px-4">Audience</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Recipients / Sent</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-slate-800/80 bg-[#131B2A] text-slate-300' : 'divide-slate-100 bg-white text-slate-700'}`}>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#01A64E]" />
                    Loading campaigns...
                  </td>
                </tr>
              ) : filteredCampaigns.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-500">
                    No email campaigns found. Click &quot;New Campaign / Trigger&quot; to create one.
                  </td>
                </tr>
              ) : (
                filteredCampaigns.map((campaign) => (
                  <tr key={campaign.id} className={`transition-colors ${isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50/80'}`}>
                    <td className="py-3.5 px-4">
                      <div className={`font-extrabold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{campaign.title}</div>
                      <div className={`text-xs truncate max-w-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{campaign.subject}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                        isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                      }`}>
                        {campaign.targetAudience === 'VISITORS' && <Users className="w-3 h-3 text-cyan-500" />}
                        {campaign.targetAudience === 'EXHIBITORS' && <Building2 className="w-3 h-3 text-amber-500" />}
                        {campaign.targetAudience === 'ALL' && <Layers className="w-3 h-3 text-emerald-500" />}
                        {campaign.targetAudience}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${
                          campaign.status === 'COMPLETED'
                            ? isDark ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : campaign.status === 'SCHEDULED'
                            ? isDark ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-amber-50 text-amber-700 border-amber-200'
                            : campaign.status === 'IN_PROGRESS'
                            ? isDark ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30 animate-pulse' : 'bg-cyan-50 text-cyan-700 border-cyan-200 animate-pulse'
                            : isDark ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {campaign.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {campaign.sentCount} / {campaign.totalRecipients || '-'}
                      </div>
                      {campaign.failedCount > 0 && (
                        <span className="text-[10px] text-rose-500 font-semibold">({campaign.failedCount} failed)</span>
                      )}
                    </td>

                    <td className={`py-3.5 px-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {campaign.sentAt
                        ? new Date(campaign.sentAt).toLocaleString()
                        : campaign.scheduledAt
                        ? `Scheduled: ${new Date(campaign.scheduledAt).toLocaleString()}`
                        : new Date(campaign.createdAt).toLocaleDateString()}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setPreviewCampaign(campaign);
                            setShowPreviewModal(true);
                          }}
                          title="Preview Email"
                          className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                            isDark ? 'bg-[#090D16] border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800' : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-200'
                          }`}
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDeleteCampaign(campaign.id)}
                          title="Delete Campaign"
                          className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                            isDark ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20' : 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100'
                          }`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className={`p-4 border-t ${isDark ? 'bg-[#090D16] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
          <Pagination
            page={page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            limit={limit}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      </div>

      {/* CREATE & TRIGGER CAMPAIGN MODAL */}
      {showModal && (
        <div className={`fixed inset-0 z-50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto ${isDark ? 'bg-black/70' : 'bg-slate-900/60'}`}>
          <div className={`border rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-xl overflow-hidden ${
            isDark ? 'bg-[#131B2A] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            {/* Modal Header */}
            <div className={`p-5 border-b flex items-center justify-between ${
              isDark ? 'bg-[#090D16] border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <h2 className="text-lg font-black flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#01A64E]" />
                <span>Create &amp; Dispatch Email Campaign</span>
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className={`text-xl font-bold cursor-pointer ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-slate-900'}`}
              >
                &times;
              </button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleSubmitCampaign} className="p-6 space-y-5 overflow-y-auto flex-1 custom-scrollbar">
              {/* Preset Selector */}
              <div>
                <label className={`block text-xs font-bold uppercase mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Select Preset Template (Optional)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {TEMPLATE_PRESETS.map((preset) => (
                    <button
                      key={preset.type}
                      type="button"
                      onClick={() => handleSelectPreset(preset.type)}
                      className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                        templateType === preset.type
                          ? 'bg-[#01A64E]/10 border-[#01A64E] text-[#01A64E] font-bold'
                          : isDark ? 'bg-[#090D16] border-slate-700 text-slate-300 hover:border-slate-600' : 'bg-white border-slate-300 text-slate-700 hover:border-slate-400'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title & Audience */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-xs font-bold uppercase mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Campaign Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. VIP Reminder Broadcast"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={`w-full px-3.5 py-2.5 border rounded-xl text-xs font-medium focus:outline-none focus:border-[#01A64E] ${
                      isDark ? 'bg-[#090D16] border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-bold uppercase mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Target Audience *</label>
                  <select
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value as 'VISITORS' | 'EXHIBITORS' | 'ALL')}
                    className={`w-full px-3.5 py-2.5 border rounded-xl text-xs font-bold focus:outline-none focus:border-[#01A64E] ${
                      isDark ? 'bg-[#090D16] border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  >
                    <option value="VISITORS">Visitors Only</option>
                    <option value="EXHIBITORS">Exhibitors Only</option>
                    <option value="ALL">All Registered (Visitors + Exhibitors)</option>
                  </select>
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className={`block text-xs font-bold uppercase mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Subject Line *</label>
                <input
                  type="text"
                  required
                  placeholder="Subject line (Supports tags: {{fullName}}, {{badgeCode}}, {{companyName}})"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className={`w-full px-3.5 py-2.5 border rounded-xl text-xs font-medium focus:outline-none focus:border-[#01A64E] ${
                    isDark ? 'bg-[#090D16] border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                  }`}
                />
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  <span className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Available Tags:</span>
                  <code className={`text-[10px] px-1.5 py-0.5 rounded text-[#01A64E] border ${
                    isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'
                  }`}>
                    &#123;&#123;fullName&#125;&#123;
                  </code>
                  <code className={`text-[10px] px-1.5 py-0.5 rounded text-[#01A64E] border ${
                    isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'
                  }`}>
                    &#123;&#123;badgeCode&#125;&#123;
                  </code>
                  <code className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-[#01A64E] border border-slate-200">
                    &#123;&#123;companyName&#125;&#123;
                  </code>
                </div>
              </div>

              {/* Content Body */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email Body Content *</label>
                <textarea
                  required
                  rows={5}
                  placeholder="Enter email body text..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#01A64E] leading-relaxed"
                ></textarea>
              </div>

              {/* Schedule Option */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isScheduled"
                    checked={isScheduled}
                    onChange={(e) => setIsScheduled(e.target.checked)}
                    className="w-4 h-4 accent-[#01A64E]"
                  />
                  <label htmlFor="isScheduled" className="text-xs font-bold text-slate-900 cursor-pointer">
                    ⏰ Schedule for Future Date / Time
                  </label>
                </div>

                {isScheduled && (
                  <input
                    type="datetime-local"
                    required={isScheduled}
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-[#01A64E]"
                  />
                )}
              </div>

              {/* Send Test Email Preview */}
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl space-y-2">
                <label className="block text-xs font-bold text-purple-900 uppercase">
                  ✉️ Send Test Email Preview to Admin
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Enter test recipient email address"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    className="flex-1 px-3 py-2 bg-white border border-purple-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-600"
                  />
                  <button
                    type="button"
                    onClick={handleSendTestEmail}
                    disabled={testing}
                    className="px-4 py-2 bg-purple-600 text-white font-bold text-xs rounded-lg hover:bg-purple-700 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {testing ? 'Sending Test...' : 'Send Test'}
                  </button>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#01A64E] text-white font-extrabold text-xs hover:bg-[#79C143] transition-all cursor-pointer shadow-sm shadow-[#01A64E]/20 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? 'Processing...' : isScheduled ? 'Schedule Campaign' : 'Trigger Mass Campaign Now'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PREVIEW EMAIL MODAL */}
      {showPreviewModal && previewCampaign && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base">HTML Email Template Preview</h3>
              <button onClick={() => setShowPreviewModal(false)} className="text-slate-400 hover:text-slate-900 font-bold text-xl cursor-pointer">&times;</button>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl text-slate-700 space-y-4 text-xs">
              <div className="text-center border-b border-[#01A64E] pb-3">
                <h2 className="text-[#01A64E] font-extrabold text-lg m-0">Masters Kerala RE 2.0 EXPO26</h2>
                <p className="text-slate-500 text-xs mt-1">Sample Recipient Preview</p>
              </div>

              <div className="font-bold text-sm text-slate-900">{previewCampaign.subject}</div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 text-slate-700 leading-relaxed whitespace-pre-wrap">
                {previewCampaign.content}
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 text-center space-y-2">
                <span className="text-[10px] text-slate-500 uppercase tracking-widest block">Badge Code</span>
                <span className="text-[#01A64E] font-mono font-extrabold text-xl block">EXPO26-SAMPLE</span>
                <div className="pt-2">
                  <span className="bg-[#01A64E] text-white font-extrabold px-4 py-2 rounded-md text-xs inline-block">
                    💳 View &amp; Print Digital Badge Pass Page
                  </span>
                </div>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200 text-center">
                <span className="bg-[#4285F4] text-white font-bold px-4 py-2 rounded-md text-xs inline-block">
                  📅 Add to Google Calendar
                </span>
              </div>
            </div>

            <div className="text-right">
              <button onClick={() => setShowPreviewModal(false)} className="px-4 py-2 bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200 cursor-pointer">
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
