'use client';

import React from 'react';
import { Printer } from 'lucide-react';

export default function PrintBadgeButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="px-5 py-2.5 rounded-xl bg-[#01A64E] hover:bg-[#79C143] text-white font-extrabold text-sm transition-all flex items-center gap-2 shadow-lg shadow-[#01A64E]/25 cursor-pointer active:scale-95"
    >
      <Printer className="w-4 h-4" />
      <span>Print / Save Badge Pass</span>
    </button>
  );
}
