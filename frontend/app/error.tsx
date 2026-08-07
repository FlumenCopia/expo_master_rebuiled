'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App Router Boundary Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl max-w-md w-full shadow-2xl space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center font-bold mx-auto">
          ⚠️
        </div>
        <h2 className="text-xl font-bold text-white">Something went wrong</h2>
        <p className="text-xs text-slate-400">
          An unexpected error occurred while loading this page.
        </p>
        {error?.message && (
          <div className="p-3 bg-rose-950/60 border border-rose-500/30 rounded-xl text-rose-300 text-[11px] font-mono break-words text-left">
            {error.message}
          </div>
        )}
        <button
          onClick={() => reset()}
          className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-emerald-500/20"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
