import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { generateQRCodeDataUrl } from '@/lib/qrcode';
import PrintBadgeButton from './PrintBadgeButton';
import { ShieldCheck, Zap, ArrowLeft, Building2, MapPin, Briefcase, User } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function BadgePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;

  const visitor = await prisma.visitor.findUnique({
    where: { badgeCode: code.toUpperCase() },
  });

  if (!visitor) {
    notFound();
  }

  // Generate QR Code data URL containing badge code
  const qrCodeUrl = await generateQRCodeDataUrl(visitor.badgeCode);
  const profileName = visitor.subEvents?.[1] || visitor.category || 'Visitor';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-start sm:justify-center py-8 px-4 selection:bg-emerald-500 selection:text-white">
      {/* Non-printable Top Navigation Bar */}
      <div className="no-print mb-6 flex items-center justify-center gap-3 flex-wrap z-10 shrink-0">
        <Link
          href="/"
          className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-sm font-semibold flex items-center gap-2 transition-all hover:bg-slate-800 shadow-md"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Home</span>
        </Link>
        <PrintBadgeButton />
      </div>

      {/* Printable Visitor ID Badge Card */}
      <div className="badge-card w-full max-w-md bg-slate-900 border-2 border-emerald-500/40 rounded-3xl p-6 sm:p-7 shadow-2xl relative overflow-hidden text-center flex flex-col items-center my-auto">
        {/* Top Decorative Gradient Accent */}
        <div className="absolute top-0 left-0 w-full h-2.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500" />

        {/* Badge Header */}
        <div className="flex items-center justify-center gap-2.5 mt-1 mb-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold shadow-sm">
            <Zap className="w-4.5 h-4.5" />
          </div>
          <div className="text-left">
            <div className="text-lg font-black tracking-tight text-white leading-none">MASTERS EXPO26</div>
            <div className="text-[10px] text-emerald-400 uppercase tracking-widest font-extrabold mt-0.5">Renewable Energy Exhibition</div>
          </div>
        </div>

        {/* Category Badge Pill */}
        <div className="inline-flex items-center px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-black uppercase tracking-widest mb-4">
          {visitor.category} PASS
        </div>

        {/* Visitor Details Section */}
        <div className="w-full text-left bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800/80 mb-4 text-xs sm:text-sm space-y-2">
          <div className="flex items-start justify-between border-b border-slate-800/60 pb-1.5">
            <span className="text-slate-400 text-xs font-medium flex items-center gap-1.5 min-w-[85px]">
              <User className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Name:
            </span>
            <span className="font-bold text-white text-right leading-snug">{visitor.fullName}</span>
          </div>

          <div className="flex items-center justify-between border-b border-slate-800/60 pb-1.5">
            <span className="text-slate-400 text-xs font-medium flex items-center gap-1.5 min-w-[85px]">
              <Zap className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Profile:
            </span>
            <span className="font-semibold text-emerald-400 text-right">{profileName}</span>
          </div>

          {visitor.designation && (
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-1.5">
              <span className="text-slate-400 text-xs font-medium flex items-center gap-1.5 min-w-[85px]">
                <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" /> Designation:
              </span>
              <span className="text-slate-200 text-right">{visitor.designation}</span>
            </div>
          )}

          {visitor.company && (
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-1.5">
              <span className="text-slate-400 text-xs font-medium flex items-center gap-1.5 min-w-[85px]">
                <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" /> Company:
              </span>
              <span className="text-slate-200 text-right font-medium">{visitor.company}</span>
            </div>
          )}

          {(visitor.city || (visitor as any).district || visitor.state) && (
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-1.5">
              <span className="text-slate-400 text-xs font-medium flex items-center gap-1.5 min-w-[85px]">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" /> Location:
              </span>
              <span className="text-slate-200 text-right">{[visitor.city, (visitor as any).district, visitor.state].filter(Boolean).join(', ')}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-0.5">
            <span className="text-slate-400 text-xs font-medium">Badge ID:</span>
            <span className="font-mono font-bold text-emerald-400 tracking-wide text-xs sm:text-sm">{visitor.badgeCode}</span>
          </div>
        </div>

        {/* QR Code Container */}
        <div className="bg-white p-2.5 rounded-2xl inline-block shadow-lg mb-3 border-2 border-emerald-500/30">
          {/* eslint-disable-next-html-element-for-jsx */}
          <img src={qrCodeUrl} alt={`QR Code ${visitor.badgeCode}`} className="w-36 h-36 object-contain block" />
        </div>

        {/* Notice Message */}
        <p className="text-[11px] text-amber-400/90 font-semibold mb-3 leading-tight">
          Note: Show this badge pass at the entrance of the exhibition
        </p>

        {/* Footer info */}
        <div className="w-full border-t border-slate-800 pt-2.5 flex items-center justify-between text-[11px] text-slate-400 font-medium">
          <span>Sept 25 - 27, 2026</span>
          <span className="flex items-center gap-1 text-emerald-400 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" /> Verified Pass
          </span>
          <span>Lulu Mall, TVM</span>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body {
            background: white !important;
            color: black !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .badge-card {
            border: 2px solid #059669 !important;
            box-shadow: none !important;
            background: #0f172a !important;
            color: white !important;
            margin: 0 auto !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
    </div>
  );
}
