'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useAdminTheme } from './AdminThemeContext';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  title?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: ToastItem[];
  showToast: (message: string, type?: ToastType, title?: string, duration?: number) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const { isDark } = useAdminTheme();

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'info', title?: string, duration = 4000) => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const newToast: ToastItem = { id, type, message, title, duration };

    setToasts((prev) => [...prev.slice(-4), newToast]); // keep max 5 active toasts

    if (duration > 0) {
      setTimeout(() => {
        dismissToast(id);
      }, duration);
    }
  }, [dismissToast]);

  const success = useCallback((message: string, title = 'Success') => {
    showToast(message, 'success', title);
  }, [showToast]);

  const error = useCallback((message: string, title = 'Error') => {
    showToast(message, 'error', title, 6000);
  }, [showToast]);

  const warning = useCallback((message: string, title = 'Warning') => {
    showToast(message, 'warning', title);
  }, [showToast]);

  const info = useCallback((message: string, title = 'Information') => {
    showToast(message, 'info', title);
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ toasts, showToast, success, error, warning, info, dismissToast }}>
      {children}
      {/* Toast Notification Container */}
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2.5 max-w-sm w-full px-4 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border shadow-xl transition-all duration-300 transform translate-y-0 animate-in slide-in-from-bottom-5 ${
              t.type === 'success'
                ? isDark ? 'bg-[#131B2A] border-emerald-500/40 text-emerald-300 shadow-emerald-950/40' : 'bg-white border-emerald-300 text-emerald-800 shadow-emerald-100'
                : t.type === 'error'
                ? isDark ? 'bg-[#131B2A] border-rose-500/40 text-rose-300 shadow-rose-950/40' : 'bg-white border-rose-300 text-rose-800 shadow-rose-100'
                : t.type === 'warning'
                ? isDark ? 'bg-[#131B2A] border-amber-500/40 text-amber-300 shadow-amber-950/40' : 'bg-white border-amber-300 text-amber-800 shadow-amber-100'
                : isDark ? 'bg-[#131B2A] border-blue-500/40 text-blue-300 shadow-blue-950/40' : 'bg-white border-blue-300 text-blue-800 shadow-blue-100'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {t.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
              {t.type === 'error' && <XCircle className="w-5 h-5 text-rose-500" />}
              {t.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-500" />}
              {t.type === 'info' && <Info className="w-5 h-5 text-blue-500" />}
            </div>

            <div className="flex-1 min-w-0">
              {t.title && <h4 className="text-xs font-black uppercase tracking-wider mb-0.5">{t.title}</h4>}
              <p className={`text-xs font-semibold leading-snug break-words ${
                isDark ? 'text-slate-200' : 'text-slate-700'
              }`}>
                {t.message}
              </p>
            </div>

            <button
              onClick={() => dismissToast(t.id)}
              className={`p-1 rounded-lg transition-colors cursor-pointer shrink-0 ${
                isDark ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-400 hover:text-slate-700'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
