'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAdminTheme } from '@/context/AdminThemeContext';

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ page, totalPages, total, limit, onPageChange }: PaginationProps) {
  const { isDark } = useAdminTheme();

  if (totalPages <= 1) return null;

  const from = Math.min((page - 1) * limit + 1, total);
  const to = Math.min(page * limit, total);

  const getPageNumbers = () => {
    const pages: (number | '...')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push('...');
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
        pages.push(i);
      }
      if (page < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  const btnBase = `inline-flex items-center justify-center h-8 min-w-[32px] px-2 rounded-lg text-xs font-bold transition-all cursor-pointer border`;
  const activeBtn = `bg-[#01A64E] border-[#01A64E] text-white shadow-sm shadow-[#01A64E]/20`;
  const inactiveBtn = isDark
    ? `bg-[#131B2A] border-slate-700 text-slate-400 hover:text-white hover:border-slate-600`
    : `bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300`;
  const disabledBtn = isDark
    ? `bg-[#131B2A] border-slate-800 text-slate-600 cursor-not-allowed`
    : `bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed`;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1 py-1">
      <span className={`text-[11px] font-semibold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
        Showing{' '}
        <span className={`font-black ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{from}–{to}</span>
        {' '}of{' '}
        <span className={`font-black ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{total.toLocaleString()}</span>
        {' '}results
      </span>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className={`${btnBase} ${page <= 1 ? disabledBtn : inactiveBtn}`}
          aria-label="Previous page"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        {getPageNumbers().map((p, i) =>
          p === '...' ? (
            <span key={`el-${i}`} className={`text-xs px-1 ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p as number)}
              className={`${btnBase} ${p === page ? activeBtn : inactiveBtn}`}
              aria-label={`Page ${p}`}
              aria-current={p === page ? 'page' : undefined}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className={`${btnBase} ${page >= totalPages ? disabledBtn : inactiveBtn}`}
          aria-label="Next page"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
