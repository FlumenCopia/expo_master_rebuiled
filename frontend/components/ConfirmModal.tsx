'use client';

import React from 'react';
import { AlertTriangle, Trash2, X, RefreshCw } from 'lucide-react';
import { useAdminTheme } from '@/context/AdminThemeContext';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'Yes, Delete',
  cancelText = 'Cancel',
  variant = 'danger',
  loading = false,
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  const { isDark } = useAdminTheme();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className={`w-full max-w-md p-6 rounded-3xl border shadow-2xl relative transition-all transform scale-100 ${
          isDark ? 'bg-[#0D1527] border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-4">
          <div
            className={`p-3 rounded-2xl shrink-0 ${
              variant === 'danger'
                ? 'bg-rose-500/15 text-rose-500 border border-rose-500/30'
                : variant === 'warning'
                ? 'bg-amber-500/15 text-amber-500 border border-amber-500/30'
                : 'bg-blue-500/15 text-blue-500 border border-blue-500/30'
            }`}
          >
            {variant === 'danger' ? <Trash2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
          </div>

          <div className="flex-1 min-w-0 pr-4">
            <h3 className="text-lg font-black tracking-tight mb-1">{title}</h3>
            <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{message}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-6 mt-6 border-t border-slate-800/60">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
              isDark
                ? 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
            }`}
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow-lg cursor-pointer ${
              variant === 'danger'
                ? 'bg-rose-600 hover:bg-rose-500 text-white border border-rose-500 shadow-rose-950/40'
                : variant === 'warning'
                ? 'bg-amber-600 hover:bg-amber-500 text-white border border-amber-500 shadow-amber-950/40'
                : 'bg-blue-600 hover:bg-blue-500 text-white border border-blue-500'
            }`}
          >
            {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
