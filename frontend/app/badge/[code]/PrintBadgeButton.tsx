'use client';

import React from 'react';
import { Printer } from 'lucide-react';

export default function PrintBadgeButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/25 cursor-pointer active:scale-95"
    >
      <Printer className="w-4 h-4" />
      <span>Print / Save Badge Pass</span>
    </button>
  );
}
