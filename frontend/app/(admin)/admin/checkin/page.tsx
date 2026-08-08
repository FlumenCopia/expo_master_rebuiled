'use client';

import { useState, useEffect, useRef } from 'react';
import {
  QrCode, CheckCircle2, AlertTriangle, XCircle, Search,
  ShieldCheck, Camera, RefreshCw, Zap, Clock, UserCheck,
  History, ArrowRight, UserPlus, X, Sparkles,
} from 'lucide-react';
import { fetchApi } from '@/lib/api-client';
import { useAdminTheme } from '@/context/AdminThemeContext';

interface ScanHistoryItem {
  id: string;
  badgeCode: string;
  name: string;
  category: string;
  timestamp: string;
  status: 'VERIFIED' | 'ALREADY_CHECKED_IN' | 'ERROR';
}

export default function AdminCheckinPage() {
  const { isDark } = useAdminTheme();
  const [manualCode, setManualCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameras, setCameras] = useState<any[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [history, setHistory] = useState<ScanHistoryItem[]>([]);

  const [mode, setMode] = useState<'IN' | 'OUT'>('IN');
  const [selectedGate, setSelectedGate] = useState<string>('');
  const [gateOptions, setGateOptions] = useState<string[]>([]);

  // On-Spot Gate Pass Registration
  const [showQuickRegister, setShowQuickRegister] = useState(false);
  const [quickRegForm, setQuickRegForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    category: 'VISITOR',
    company: '',
  });
  const [quickRegSubmitting, setQuickRegSubmitting] = useState(false);
  const [quickRegError, setQuickRegError] = useState('');

  const modeRef = useRef<'IN' | 'OUT'>('IN');
  const selectedGateRef = useRef<string>('');
  const html5QrCodeRef = useRef<any>(null);
  const lastScannedCodeRef = useRef<{ code: string; time: number }>({ code: '', time: 0 });
  const loadingRef = useRef(false);

  const changeMode = (newMode: 'IN' | 'OUT') => {
    modeRef.current = newMode;
    setMode(newMode);
    setScanResult(null);
    lastScannedCodeRef.current = { code: '', time: 0 };
  };

  useEffect(() => {
    selectedGateRef.current = selectedGate;
  }, [selectedGate]);

  // Load gates dynamically from DB
  useEffect(() => {
    fetchApi<any>('/api/admin/gates')
      .then((res) => {
        if (res?.gates?.length > 0) {
          const names: string[] = res.gates.map((g: any) => g.name || g.gateName).filter(Boolean);
          setGateOptions(names);
          setSelectedGate(names[0]);
        } else {
          setGateOptions([]);
          setSelectedGate('');
        }
      })
      .catch(() => {
        setGateOptions([]);
        setSelectedGate('');
      });
  }, []);

  const playSound = (type: 'success' | 'warning' | 'error') => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      if (type === 'success') {
        if (navigator.vibrate) navigator.vibrate([60]);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        osc.start(); osc.stop(ctx.currentTime + 0.15);
      } else if (type === 'warning') {
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
        osc.type = 'square';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.setValueAtTime(330, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.start(); osc.stop(ctx.currentTime + 0.25);
      } else {
        if (navigator.vibrate) navigator.vibrate([200]);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.setValueAtTime(160, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start(); osc.stop(ctx.currentTime + 0.3);
      }
    } catch {
      // Audio not supported
    }
  };

  const [selectedSubEvent, setSelectedSubEvent] = useState<string>('General Entry');
  const [subEvents, setSubEvents] = useState<string[]>(['General Entry']);
  const selectedSubEventRef = useRef<string>('General Entry');
  const [offlineCount, setOfflineCount] = useState<number>(0);

  useEffect(() => {
    selectedSubEventRef.current = selectedSubEvent;
  }, [selectedSubEvent]);

  // Load sub-events dynamically for room session verification
  useEffect(() => {
    fetchApi<any>('/api/sub-events')
      .then((res) => {
        if (res?.data?.length > 0) {
          const titles = res.data.map((s: any) => s.title).filter(Boolean);
          setSubEvents(['General Entry', ...titles]);
        }
      })
      .catch(() => {});

    // Check offline queue count
    try {
      const q = JSON.parse(localStorage.getItem('offlineScanQueue') || '[]');
      setOfflineCount(q.length);
    } catch {}

    // Online event listener to auto-sync offline scans
    const handleOnline = async () => {
      try {
        const q = JSON.parse(localStorage.getItem('offlineScanQueue') || '[]');
        if (q.length > 0) {
          for (const item of q) {
            await fetchApi<any>('/api/checkin/verify', {
              method: 'POST',
              body: JSON.stringify(item),
            }).catch(() => {});
          }
          localStorage.removeItem('offlineScanQueue');
          setOfflineCount(0);
        }
      } catch {}
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  const verifyBadge = async (codeStr: string) => {
    const cleanCode = codeStr.trim().toUpperCase();
    if (!cleanCode || loadingRef.current) return;

    const now = Date.now();
    const scanKey = `${modeRef.current}::${cleanCode}`;
    if (lastScannedCodeRef.current.code === scanKey && now - lastScannedCodeRef.current.time < 3000) return;
    lastScannedCodeRef.current = { code: scanKey, time: now };

    loadingRef.current = true;
    setLoading(true);
    setScanResult(null);

    const payload = {
      badgeCode: cleanCode,
      gateName: selectedGateRef.current || selectedGate,
      mode: modeRef.current || mode,
      subEventTitle: selectedSubEventRef.current || selectedSubEvent,
    };

    // Offline mode handling
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      try {
        const q = JSON.parse(localStorage.getItem('offlineScanQueue') || '[]');
        q.push({ ...payload, queuedAt: new Date().toISOString() });
        localStorage.setItem('offlineScanQueue', JSON.stringify(q));
        setOfflineCount(q.length);

        playSound('success');
        setScanResult({
          success: true,
          code: 'OFFLINE_QUEUED',
          message: `📡 OFFLINE SCAN QUEUED! ${cleanCode} saved locally. Will auto-sync when online.`,
        });
        addHistoryItem(cleanCode, 'Offline Scan', 'PASS', 'VERIFIED');
      } catch {}
      loadingRef.current = false;
      setLoading(false);
      setManualCode('');
      return;
    }

    try {
      const data = await fetchApi<any>('/api/checkin/verify', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      setScanResult(data);

      if (data.success) {
        playSound('success');
        addHistoryItem(cleanCode, data.visitor?.fullName || 'Visitor', data.visitor?.category || 'PASS', 'VERIFIED');
      } else if (data.code === 'ALREADY_CHECKED_IN' || data.code === 'NOT_CHECKED_IN') {
        playSound('warning');
        addHistoryItem(cleanCode, data.visitor?.fullName || 'Visitor', data.visitor?.category || 'PASS', 'ALREADY_CHECKED_IN');
      } else {
        playSound('error');
        addHistoryItem(cleanCode, 'Unknown Visitor', 'N/A', 'ERROR');
      }
      setManualCode('');
    } catch (err: any) {
      // Fallback to offline queue on network drop
      try {
        const q = JSON.parse(localStorage.getItem('offlineScanQueue') || '[]');
        q.push({ ...payload, queuedAt: new Date().toISOString() });
        localStorage.setItem('offlineScanQueue', JSON.stringify(q));
        setOfflineCount(q.length);
        playSound('success');
        setScanResult({
          success: true,
          code: 'OFFLINE_QUEUED',
          message: `⚡ Network Lagged: Scan for ${cleanCode} buffered locally and queued for auto-sync!`,
        });
        addHistoryItem(cleanCode, 'Buffered Scan', 'PASS', 'VERIFIED');
      } catch {
        playSound('error');
        setScanResult({ success: false, code: 'ERROR', message: `❌ ${err.message || 'Invalid badge or server error'}` });
        addHistoryItem(cleanCode, 'Invalid Badge', 'N/A', 'ERROR');
      }
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  };

  const handleQuickRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickRegForm.fullName.trim() || !quickRegForm.phone.trim()) {
      setQuickRegError('Full Name and Phone Number are required.');
      return;
    }
    setQuickRegSubmitting(true);
    setQuickRegError('');

    try {
      const phoneDigits = quickRegForm.phone.replace(/\D/g, '');
      const res = await fetchApi<any>('/api/register/visitor', {
        method: 'POST',
        body: JSON.stringify({
          fullName: quickRegForm.fullName.trim(),
          phone: quickRegForm.phone.trim(),
          email: quickRegForm.email.trim().toLowerCase() || `${phoneDigits}@gate.expo26.in`,
          category: quickRegForm.category,
          company: quickRegForm.company.trim() || undefined,
          city: 'Ernakulam',
          countryCode: '91',
        }),
      });

      const badgeCode = res?.badgeCode || res?.visitor?.badgeCode;
      if (res?.success && badgeCode) {
        setShowQuickRegister(false);
        setQuickRegForm({ fullName: '', phone: '', email: '', category: 'VISITOR', company: '' });
        setQuickRegError('');
        setTimeout(() => verifyBadge(badgeCode), 300);
      } else {
        setQuickRegError(res?.message || res?.error || 'Failed to create instant gate pass.');
      }
    } catch (err: any) {
      setQuickRegError(err.message || 'Failed to register visitor at gate.');
    } finally {
      setQuickRegSubmitting(false);
    }
  };

  const addHistoryItem = (badgeCode: string, name: string, category: string, status: 'VERIFIED' | 'ALREADY_CHECKED_IN' | 'ERROR') => {
    setHistory((prev) => [
      {
        id: Math.random().toString(),
        badgeCode,
        name,
        category,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        status,
      },
      ...prev.slice(0, 7),
    ]);
  };

  useEffect(() => {
    import('html5-qrcode').then(({ Html5Qrcode }) => {
      Html5Qrcode.getCameras()
        .then((deviceList) => {
          if (deviceList?.length > 0) {
            setCameras(deviceList);
            const backCam = deviceList.find((c) =>
              c.label.toLowerCase().includes('back') || c.label.toLowerCase().includes('environment')
            );
            setSelectedCameraId(backCam ? backCam.id : deviceList[0].id);
            setCameraActive(true);
          }
        })
        .catch(() => {});
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!cameraActive || !selectedCameraId) return;
    let timeoutId: ReturnType<typeof setTimeout>;

    timeoutId = setTimeout(() => {
      const el = document.getElementById('qr-camera-viewport');
      if (!el) return;

      import('html5-qrcode').then(({ Html5Qrcode }) => {
        const qr = new Html5Qrcode('qr-camera-viewport', { verbose: false } as any);
        html5QrCodeRef.current = qr;
        qr.start(
          { deviceId: { exact: selectedCameraId } },
          { fps: 10, qrbox: { width: 200, height: 200 } },
          (decodedText) => verifyBadge(decodedText),
          () => {}
        ).catch(() => {});
      }).catch(() => {});
    }, 150);

    return () => {
      clearTimeout(timeoutId);
      const instance = html5QrCodeRef.current;
      if (instance) {
        instance.stop().catch(() => {}).finally(() => instance.clear());
        html5QrCodeRef.current = null;
      }
    };
  }, [cameraActive, selectedCameraId]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto w-full">
      {/* Top Header */}
      <div className={`flex flex-col md:flex-row md:items-center justify-between border p-5 rounded-3xl gap-4 transition-colors ${
        isDark ? 'bg-[#131B2A] border-slate-800 text-white shadow-xl' : 'bg-white border-slate-200 text-slate-900 shadow-sm'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center font-bold transition-all ${
            mode === 'IN'
              ? isDark ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-[#01A64E]'
              : isDark ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' : 'bg-rose-50 border-rose-200 text-rose-600'
          }`}>
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <h1 className={`font-extrabold text-lg sm:text-xl flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Gate Scanner —{' '}
              <span className={mode === 'IN' ? 'text-[#01A64E]' : 'text-rose-500'}>
                {mode === 'IN' ? 'CHECK-IN (ENTRY)' : 'FINAL EXIT'}
              </span>
            </h1>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Scan QR codes on attendee badges for instant entry/exit validation</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Sub-Event / Room Session Selector */}
          <select
            value={selectedSubEvent}
            onChange={(e) => setSelectedSubEvent(e.target.value)}
            className={`border text-xs font-extrabold rounded-xl px-3.5 py-2 focus:outline-none focus:border-[#01A64E] max-w-[180px] truncate ${
              isDark ? 'bg-[#090D16] border-slate-700 text-purple-400' : 'bg-white border-slate-300 text-purple-600'
            }`}
            title="Select session or room to validate session-specific access"
          >
            {subEvents.map((title) => (
              <option key={title} value={title}>
                {title === 'General Entry' ? '🏛️ General Venue Entry' : `🎤 ${title}`}
              </option>
            ))}
          </select>

          {gateOptions.length > 0 ? (
            <select
              value={selectedGate}
              onChange={(e) => setSelectedGate(e.target.value)}
              className={`border text-xs font-extrabold rounded-xl px-3.5 py-2 focus:outline-none focus:border-[#01A64E] ${
                isDark ? 'bg-[#090D16] border-slate-700 text-emerald-400' : 'bg-white border-slate-300 text-[#01A64E]'
              }`}
            >
              {gateOptions.map((gate) => (
                <option key={gate} value={gate}>{gate}</option>
              ))}
            </select>
          ) : (
            <a
              href="/admin/gates"
              className={`px-3.5 py-2 rounded-xl border font-bold text-xs flex items-center gap-1.5 ${
                isDark ? 'bg-rose-500/20 border-rose-500/40 text-rose-300' : 'bg-rose-50 border-rose-200 text-rose-700'
              }`}
            >
              ⚠️ No Gates — Add Gates First
            </a>
          )}

          <button
            onClick={() => { setShowQuickRegister(true); setQuickRegError(''); }}
            className="px-3.5 py-2 rounded-xl bg-[#01A64E] hover:bg-[#79C143] text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>On-Spot Gate Pass</span>
          </button>
        </div>
      </div>

      {/* Offline Queue Warning Banner */}
      {offlineCount > 0 && (
        <div className="bg-amber-500/15 border border-amber-500/40 text-amber-300 px-4 py-2.5 rounded-2xl flex items-center justify-between text-xs font-bold shadow-md">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-amber-400 animate-spin" />
            <span>Offline Resilience Active: {offlineCount} scan(s) saved locally. Auto-syncing when online...</span>
          </div>
        </div>
      )}

      {/* Gate Mode Selector */}
      <div className={`border p-2 rounded-2xl flex items-center justify-between gap-2 shadow-xs flex-wrap sm:flex-nowrap ${
        isDark ? 'bg-[#131B2A] border-slate-800' : 'bg-white border-slate-200'
      }`}>
        {([
          { key: 'IN',  label: '🟢 ENTRY MODE', icon: Zap,        active: 'bg-[#01A64E] text-white shadow-xs', idle: isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100' },
          { key: 'OUT', label: '🔴 EXIT MODE',  icon: ArrowRight, active: 'bg-rose-600 text-white shadow-xs', idle: isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100' },
        ] as const).map(({ key, label, icon: Icon, active, idle }) => (
          <button
            key={key}
            onClick={() => changeMode(key)}
            className={`flex-1 py-3 px-4 rounded-xl font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 transition-all cursor-pointer ${mode === key ? `${active} scale-[1.01]` : idle}`}
          >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Scan Result Alert Banner */}
      {scanResult && (
        <div className={`p-6 rounded-3xl border text-center shadow-lg animate-in fade-in duration-200 ${
          scanResult.code === 'VERIFIED' || scanResult.code === 'CHECKED_OUT'
            ? isDark ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-200' : 'bg-emerald-50 border-emerald-200 text-emerald-900'
            : isDark ? 'bg-rose-500/20 border-rose-500/40 text-rose-200' : 'bg-rose-50 border-rose-200 text-rose-900'
        }`}>
          <div className="flex items-center justify-center mb-3">
            {scanResult.code === 'VERIFIED' || scanResult.code === 'CHECKED_OUT' ? (
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-full bg-rose-500/20 border-2 border-rose-500 flex items-center justify-center">
                <XCircle className="w-10 h-10 text-rose-400" />
              </div>
            )}
          </div>

          <h2 className={`text-xl sm:text-2xl font-black mb-1 tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{scanResult.message}</h2>

          {scanResult.visitor && (
            <div className={`mt-4 p-4 rounded-2xl border text-left text-xs sm:text-sm space-y-2 max-w-md mx-auto shadow-xs ${
              isDark ? 'bg-[#090D16] border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-900'
            }`}>
              <div className={`flex justify-between items-center border-b pb-1.5 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Attendee Name:</span>
                <span className={`font-extrabold text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>{scanResult.visitor.fullName}</span>
              </div>
              <div className={`flex justify-between items-center border-b pb-1.5 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Badge Pass:</span>
                <span className="font-bold text-[#01A64E]">{scanResult.visitor.category}</span>
              </div>
              <div className={`flex justify-between items-center border-b pb-1.5 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Badge ID:</span>
                <span className={`font-mono font-bold ${isDark ? 'text-emerald-400' : 'text-slate-800'}`}>{scanResult.visitor.badgeCode}</span>
              </div>
              {scanResult.visitor.company && (
                <div className="flex justify-between items-center">
                  <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Company:</span>
                  <span className={`font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{scanResult.visitor.company}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Main Grid: Camera Scanner & Manual Search */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Camera Viewport Box */}
        <div className={`border p-5 rounded-3xl text-center shadow-sm flex flex-col items-center justify-center relative min-h-[340px] ${
          isDark ? 'bg-[#131B2A] border-slate-800 shadow-xl' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="w-full flex items-center justify-between mb-3 text-xs text-slate-500 px-2">
            <span className="flex items-center gap-1.5 font-semibold text-[#01A64E]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#01A64E] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#01A64E]"></span>
              </span>
              Camera Live
            </span>
            <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Point at Badge QR Code</span>
          </div>

          {cameraActive ? (
            <div className={`relative w-full max-w-[320px] aspect-square rounded-2xl overflow-hidden border-2 bg-slate-900 shadow-inner ${
              mode === 'IN' ? 'border-[#01A64E]/40' : 'border-rose-500/40'
            }`}>
              <style>{`
                #qr-camera-viewport video { width:100%!important; height:100%!important; object-fit:cover!important; display:block!important; }
                #qr-camera-viewport { width:100%!important; height:100%!important; }
              `}</style>
              <div id="qr-camera-viewport" className="w-full h-full" />
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6">
                <div className="w-full h-full border-2 border-dashed border-[#01A64E]/80 rounded-xl flex items-center justify-center">
                  <span className="text-[10px] font-bold text-white bg-slate-900/90 px-2.5 py-1 rounded-full border border-white/20">
                    Align QR Code Within Box
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className={`w-full max-w-[280px] aspect-square rounded-2xl border border-dashed flex flex-col items-center justify-center p-6 ${
              isDark ? 'bg-[#090D16] border-slate-700 text-slate-400' : 'bg-slate-50 border-slate-300 text-slate-500'
            }`}>
              <Camera className="w-12 h-12 mb-3 text-slate-400" />
              <p className={`text-xs text-center font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Camera scanner is paused</p>
              <button
                onClick={() => setCameraActive(true)}
                className={`mt-3 px-4 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 cursor-pointer ${
                  isDark ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <RefreshCw className="w-3.5 h-3.5" /> Resume Scanner
              </button>
            </div>
          )}
        </div>

        {/* Manual Barcode & Search Box */}
        <div className={`border p-6 rounded-3xl flex flex-col justify-between ${
          isDark ? 'bg-[#131B2A] border-slate-800 shadow-xl' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Search className="w-5 h-5 text-[#01A64E]" />
              <h3 className={`text-base font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>Manual / Barcode Gun Entry</h3>
            </div>
            <p className={`text-xs mb-5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Type EXPO26-XXXXX or scan badge with a USB barcode gun</p>

            <form onSubmit={(e) => { e.preventDefault(); verifyBadge(manualCode); }} className="space-y-4">
              <input
                type="text"
                placeholder="EXPO26-QFGHX"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                className={`w-full px-4 py-3.5 rounded-2xl border font-mono text-base tracking-wider focus:outline-none focus:border-[#01A64E] uppercase transition-colors ${
                  isDark ? 'bg-[#090D16] border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                }`}
                autoFocus
                required
              />
              <button
                type="submit"
                disabled={loading || !manualCode.trim()}
                className="w-full py-3.5 rounded-2xl bg-[#01A64E] hover:bg-[#79C143] text-white font-black text-sm transition-all flex items-center justify-center gap-2 shadow-sm shadow-[#01A64E]/20 disabled:opacity-50 cursor-pointer"
              >
                {loading ? <span>Verifying...</span> : <><ShieldCheck className="w-5 h-5" /><span>Verify Gate Pass</span></>}
              </button>
            </form>
          </div>

          <div className={`mt-6 pt-4 border-t flex items-center justify-between text-xs ${
            isDark ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-500'
          }`}>
            <span className="flex items-center gap-1.5 font-medium">
              <UserCheck className="w-4 h-4 text-[#01A64E]" /> Active Gate:
            </span>
            <span className="font-extrabold text-[#01A64E]">{selectedGate || 'Main Entrance'}</span>
          </div>
        </div>
      </div>

      {/* Recent Activity Log */}
      {history.length > 0 && (
        <div className={`border p-6 rounded-3xl ${isDark ? 'bg-[#131B2A] border-slate-800 shadow-xl' : 'bg-white border-slate-200 shadow-sm'}`}>
          <h3 className={`text-sm font-extrabold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <History className="w-4 h-4 text-slate-400" /> Recent Gate Scan Activity
          </h3>
          <div className="space-y-2">
            {history.map((item) => (
              <div key={item.id} className={`flex items-center justify-between p-3 rounded-2xl border text-xs transition-all ${
                isDark ? 'bg-[#090D16] border-slate-800 hover:bg-slate-800/50' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
              }`}>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded-md font-mono font-bold text-[10px] border ${
                    item.status === 'VERIFIED'
                      ? isDark ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : item.status === 'ALREADY_CHECKED_IN'
                      ? isDark ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-amber-50 text-amber-700 border-amber-200'
                      : isDark ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}>{item.badgeCode}</span>
                  <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.name}</span>
                  <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>({item.category})</span>
                </div>
                <div className={`flex items-center gap-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  <span className="font-mono text-[11px]">{item.timestamp}</span>
                  {item.status === 'VERIFIED' ? (
                    <span className="text-[#01A64E] font-bold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Approved</span>
                  ) : item.status === 'ALREADY_CHECKED_IN' ? (
                    <span className="text-amber-500 font-bold flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" /> Re-scan</span>
                  ) : (
                    <span className="text-rose-500 font-bold flex items-center gap-1"><XCircle className="w-3.5 h-3.5" /> Denied</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ON-SPOT GATE PASS REGISTRATION MODAL */}
      {showQuickRegister && (
        <div className={`fixed inset-0 z-50 backdrop-blur-sm flex items-center justify-center p-4 ${isDark ? 'bg-black/70' : 'bg-slate-900/60'}`}>
          <div className={`border w-full max-w-lg rounded-3xl p-6 shadow-xl space-y-5 animate-in fade-in duration-200 ${
            isDark ? 'bg-[#131B2A] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className={`flex items-center justify-between border-b pb-4 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <div className="flex items-center gap-2.5">
                <div className={`p-2.5 rounded-xl border ${isDark ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-amber-50 border-amber-200 text-amber-600'}`}>
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-lg">On-Spot Gate Registration</h3>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Register walk-in visitors &amp; issue instant entry badge</p>
                </div>
              </div>
              <button
                onClick={() => setShowQuickRegister(false)}
                className={`p-2 rounded-xl border transition-all cursor-pointer ${
                  isDark ? 'bg-[#090D16] border-slate-700 text-slate-400 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-500 hover:text-slate-900'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {quickRegError && (
              <div className={`p-3.5 rounded-2xl border text-xs font-bold flex items-center gap-2 ${
                isDark ? 'bg-rose-500/20 border-rose-500/40 text-rose-300' : 'bg-rose-50 border-rose-200 text-rose-700'
              }`}>
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{quickRegError}</span>
              </div>
            )}

            <form onSubmit={handleQuickRegisterSubmit} className="space-y-4">
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={quickRegForm.fullName}
                  onChange={(e) => setQuickRegForm({ ...quickRegForm, fullName: e.target.value })}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium focus:outline-none focus:border-[#01A64E] ${
                    isDark ? 'bg-[#090D16] border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                  }`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 9876543210"
                    value={quickRegForm.phone}
                    onChange={(e) => setQuickRegForm({ ...quickRegForm, phone: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium focus:outline-none focus:border-[#01A64E] ${
                      isDark ? 'bg-[#090D16] border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Badge Category</label>
                  <select
                    value={quickRegForm.category}
                    onChange={(e) => setQuickRegForm({ ...quickRegForm, category: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-bold focus:outline-none focus:border-[#01A64E] ${
                      isDark ? 'bg-[#090D16] border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  >
                    <option value="VISITOR">Visitor Pass</option>
                    <option value="DELEGATE">Delegate Pass</option>
                    <option value="VIP">VIP Pass</option>
                    <option value="PRESS">Press Pass</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Company / Organization</label>
                <input
                  type="text"
                  placeholder="e.g. Renewable Energy Tech Corp"
                  value={quickRegForm.company}
                  onChange={(e) => setQuickRegForm({ ...quickRegForm, company: e.target.value })}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium focus:outline-none focus:border-[#01A64E] ${
                    isDark ? 'bg-[#090D16] border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                  }`}
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowQuickRegister(false)}
                  className={`px-4 py-2.5 rounded-xl border font-bold text-xs cursor-pointer ${
                    isDark ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={quickRegSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-[#01A64E] hover:bg-[#79C143] text-white font-extrabold text-xs transition-all shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{quickRegSubmitting ? 'Registering...' : 'Register & Check In'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
