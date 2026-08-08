import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { generateQRCodeDataUrl } from '@/lib/qrcode';
import PrintBadgeButton from './PrintBadgeButton';
import { ShieldCheck, Zap, ArrowLeft, Building2, MapPin, Briefcase, User, Calendar } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function BadgePage({ params }: { params: Promise<{ code: string }> }) {
  let visitor = null;
  let qrCodeUrl = '';

  try {
    const { code } = await params;
    if (!code) return notFound();

    visitor = await prisma.visitor.findUnique({
      where: { badgeCode: code.toUpperCase() },
    });

    if (!visitor) {
      const emp = await prisma.companyEmployee.findFirst({
        where: { badgeCode: code.toUpperCase() },
      });

      if (emp) {
        visitor = {
          badgeCode: emp.badgeCode,
          fullName: emp.fullName,
          email: emp.email,
          phone: emp.phone,
          company: emp.companyName,
          designation: emp.designation || 'Exhibitor Staff',
          category: 'EXHIBITOR STAFF',
          subEvents: [],
          city: '',
          state: '',
        } as any;
      }
    }

    if (!visitor) {
      notFound();
    }

    qrCodeUrl = await generateQRCodeDataUrl(visitor.badgeCode);
  } catch (err) {
    console.error('BadgePage Server Component Error:', err);
    notFound();
  }

  const profileName = visitor.subEvents?.[1] || visitor.category || 'Visitor';

  const googleCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent('Masters EXPO26')}&details=${encodeURIComponent('Official Entry Pass: ' + visitor.badgeCode)}&location=${encodeURIComponent('Main Exhibition Centre, Kochi, Kerala')}&dates=20260915T090000Z/20260917T180000Z`;

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 flex flex-col items-center justify-start sm:justify-center py-8 px-4 selection:bg-[#01A64E] selection:text-white font-sans">
      {/* Non-printable Top Navigation Bar */}
      <div className="no-print mb-6 flex items-center justify-center gap-3 flex-wrap z-10 shrink-0">
        <Link
          href="/"
          className="px-4 py-2.5 rounded-xl bg-[#131B2A] border border-slate-800 text-slate-200 hover:text-white text-sm font-semibold flex items-center gap-2 transition-all hover:bg-slate-800 shadow-md"
        >
          <ArrowLeft className="w-4 h-4 text-slate-400" />
          <span>Home</span>
        </Link>
        <a
          href={googleCalUrl}
          target="_blank"
          rel="noreferrer"
          className="px-4 py-2.5 rounded-xl bg-[#01A64E] hover:bg-[#79C143] text-white text-sm font-extrabold flex items-center gap-2 transition-all shadow-md shadow-[#01A64E]/20"
        >
          <Calendar className="w-4 h-4" />
          <span>Add to Calendar</span>
        </a>
        <PrintBadgeButton />
      </div>

      {/* Printable Visitor ID Badge Card */}
      <div className="badge-card w-full max-w-md bg-[#131B2A] border-2 border-[#01A64E]/50 rounded-3xl p-6 sm:p-7 shadow-2xl relative overflow-hidden text-center flex flex-col items-center my-auto">
        {/* Top Decorative Gradient Accent */}
        <div className="absolute top-0 left-0 w-full h-2.5 bg-gradient-to-r from-[#01A64E] via-[#79C143] to-[#01A64E]" />

        {/* Badge Header */}
        <div className="flex items-center justify-center gap-2.5 mt-1 mb-3">
          <div className="w-8 h-8 rounded-xl bg-[#01A64E]/20 border border-[#01A64E]/30 text-[#79C143] flex items-center justify-center font-bold shadow-sm">
            <Zap className="w-4.5 h-4.5" />
          </div>
          <div className="text-left">
            <div className="text-lg font-black tracking-tight text-white leading-none">MASTERS EXPO26</div>
            <div className="text-[10px] text-[#79C143] uppercase tracking-widest font-extrabold mt-0.5">Renewable Energy Exhibition</div>
          </div>
        </div>

        {/* Category Badge Pill */}
        <div className="inline-flex items-center px-4 py-1 rounded-full bg-[#01A64E]/15 border border-[#01A64E]/40 text-[#79C143] text-[11px] font-black uppercase tracking-widest mb-4">
          {visitor.category} PASS
        </div>

        {/* Visitor Details Section */}
        <div className="w-full text-left bg-[#090D16] p-4 rounded-2xl border border-slate-800 mb-4 text-xs sm:text-sm space-y-2.5">
          <div className="flex items-start justify-between border-b border-slate-800 pb-2">
            <span className="text-slate-300 text-xs font-extrabold flex items-center gap-1.5 min-w-[95px]">
              <User className="w-3.5 h-3.5 text-[#79C143] shrink-0" /> Name:
            </span>
            <span className="font-black text-white text-right leading-snug text-sm sm:text-base">{visitor.fullName}</span>
          </div>

          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-slate-300 text-xs font-extrabold flex items-center gap-1.5 min-w-[95px]">
              <Zap className="w-3.5 h-3.5 text-[#79C143] shrink-0" /> Profile:
            </span>
            <span className="font-extrabold text-[#79C143] text-right">{profileName}</span>
          </div>

          {visitor.designation && (
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-300 text-xs font-extrabold flex items-center gap-1.5 min-w-[95px]">
                <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" /> Designation:
              </span>
              <span className="text-white font-bold text-right">{visitor.designation}</span>
            </div>
          )}

          {visitor.company && (
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-300 text-xs font-extrabold flex items-center gap-1.5 min-w-[95px]">
                <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" /> Company:
              </span>
              <span className="text-white font-bold text-right">{visitor.company}</span>
            </div>
          )}

          {(visitor.city || (visitor as any).district || visitor.state) && (
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-300 text-xs font-extrabold flex items-center gap-1.5 min-w-[95px]">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" /> Location:
              </span>
              <span className="text-slate-200 font-medium text-right">{[visitor.city, (visitor as any).district, visitor.state].filter(Boolean).join(', ')}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-0.5">
            <span className="text-slate-300 text-xs font-extrabold">Badge ID:</span>
            <span className="font-mono font-black text-[#79C143] tracking-wide text-xs sm:text-sm">{visitor.badgeCode}</span>
          </div>
        </div>

        {/* QR Code Container */}
        <div className="bg-white p-2.5 rounded-2xl inline-block shadow-lg mb-3 border-2 border-[#01A64E]/40">
          {/* eslint-disable-next-html-element-for-jsx */}
          <img src={qrCodeUrl} alt={`QR Code ${visitor.badgeCode}`} className="w-36 h-36 object-contain block" />
        </div>

        {/* Notice Message */}
        <div className="w-full bg-amber-500/10 border border-amber-500/30 rounded-xl px-3 py-1.5 mb-3 text-[11px] text-amber-300 font-bold leading-tight">
          Note: Show this badge pass at the entrance of the exhibition
        </div>

        {/* Footer info */}
        <div className="w-full border-t border-slate-800 pt-2.5 flex items-center justify-between text-[11px] text-slate-400 font-medium">
          <span>Sept 25 - 27, 2026</span>
          <span className="flex items-center gap-1 text-[#79C143] font-extrabold">
            <ShieldCheck className="w-3.5 h-3.5" /> Verified Pass
          </span>
          <span>Lulu Mall, TVM</span>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          @page {
            size: 4in 3in;
            margin: 0;
          }
          .no-print { display: none !important; }
          html, body {
            background: white !important;
            color: black !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 4in !important;
            height: 3in !important;
            overflow: hidden !important;
          }
          .badge-card {
            width: 3.8in !important;
            height: 2.8in !important;
            border: 2px solid #000 !important;
            box-shadow: none !important;
            background: #ffffff !important;
            color: #000000 !important;
            margin: 0 auto !important;
            padding: 10px !important;
            border-radius: 8px !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            page-break-after: always;
          }
          .badge-card * {
            color: #000000 !important;
          }
          .badge-card .bg-\\[\\#090D16\\] {
            background: #f8fafc !important;
            border-color: #cbd5e1 !important;
          }
        }
      `}</style>
    </div>
  );
}
