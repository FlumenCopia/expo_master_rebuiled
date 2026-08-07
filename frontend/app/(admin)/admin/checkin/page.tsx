'use client';

import { useState, useEffect, useRef } from 'react';
import {
  QrCode, CheckCircle2, AlertTriangle, XCircle, Search,
  ShieldCheck, Camera, RefreshCw, Zap, Clock, UserCheck,
  History, ArrowRight, UserPlus, X, Sparkles,
} from 'lucide-react';
import { fetchApi } from '@/lib/api-client';
import AdminNavbar from '@/components/AdminNavbar';

interface ScanHistoryItem {
  id: string;
  badgeCode: string;
  name: string;
  category: string;
  timestamp: string;
  status: 'VERIFIED' | 'ALREADY_CHECKED_IN' | 'ERROR';
}

export default function AdminCheckinPage() {
  const [manualCode, setManualCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameras, setCameras] = useState<any[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [history, setHistory] = useState<ScanHistoryItem[]>([]);

  const [mode, setMode] = useState<'IN' | 'BREAK' | 'OUT'>('IN');
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

  const modeRef = useRef<'IN' | 'BREAK' | 'OUT'>('IN');
  const selectedGateRef = useRef<string>('');

  const changeMode = (newMode: 'IN' | 'BREAK' | 'OUT') => {
    modeRef.current = newMode;
    setMode(newMode);
    setScanResult(null);
    lastScannedCodeRef.current = { code: '', time: 0 };
  };

  useEffect(() => {
    selectedGateRef.current = selectedGate;
  }, [selectedGate]);

  // Load gates dynamically from DB — only gates the admin has created
  useEffect(() => {
    fetchApi<any>('/api/admin/gates')
      .then((res) => {
        if (res?.gates?.length > 0) {
          const names: string[] = res.gates.map((g: any) => g.name);
          setGateOptions(names);
          setSelectedGate(names[0]);
        } else {
          // No gates configured yet — prompt admin
          setGateOptions([]);
          setSelectedGate('');
        }
      })
      .catch(() => {
        setGateOptions([]);
        setSelectedGate('');
      });
  }, []);

  const html5QrCodeRef = useRef<any>(null);
  const lastScannedCodeRef = useRef<{ code: string; time: number }>({ code: '', time: 0 });
  const loadingRef = useRef(false);

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
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.start(); osc.stop(ctx.currentTime + 0.25);
      } else {
        if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start(); osc.stop(ctx.currentTime + 0.3);
      }
    } catch {}
  };

  const verifyBadge = async (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode || loadingRef.current) return;

    const now = Date.now();
    const scanKey = `${modeRef.current}::${cleanCode}`;
    if (lastScannedCodeRef.current.code === scanKey && now - lastScannedCodeRef.current.time < 3000) return;
    lastScannedCodeRef.current = { code: scanKey, time: now };

    loadingRef.current = true;
    setLoading(true);
    setScanResult(null);

    try {
      const data = await fetchApi<any>('/api/checkin/verify', {
        method: 'POST',
        body: JSON.stringify({
          badgeCode: cleanCode,
          gateName: selectedGateRef.current,
          mode: modeRef.current,
        }),
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
    } catch (err: any) {
      playSound('error');
      setScanResult({ success: false, code: 'ERROR', message: `❌ ${err.message || 'Invalid badge or server error'}` });
      addHistoryItem(cleanCode, 'Invalid Badge', 'N/A', 'ERROR');
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
        // Auto check-in immediately after creating the gate pass
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
    <div className="min-h-screen bg-[#03151a] text-slate-100 font-sans selection:bg-[#01A64E] selection:text-white flex flex-col">
      <AdminNavbar />

      <main className="max-w-4xl mx-auto w-full px-4 py-6 flex-1 flex flex-col space-y-6">

        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between bg-[#072228] border border-[#0b3d46] p-5 rounded-3xl shadow-xl gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center font-bold transition-all ${
              mode === 'IN' ? 'bg-[#01A64E]/15 border-[#01A64E]/30 text-[#79C143]' : 'bg-amber-500/20 border-amber-500/30 text-amber-400'
            }`}>
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-extrabold text-white text-lg sm:text-xl flex items-center gap-2">
                Gate Scanner —{' '}
                <span className={mode === 'IN' ? 'text-[#79C143]' : mode === 'BREAK' ? 'text-amber-400' : 'text-rose-400'}>
                  {mode === 'IN' ? 'CHECK-IN (ENTRY)' : mode === 'BREAK' ? 'PASS-OUT (BREAK)' : 'FINAL EXIT'}
                </span>
              </h1>
              <p className="text-xs text-slate-400">Scan QR codes on attendee badges for instant entry/exit validation</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Dynamic Gate Selector — loaded from DB */}
            {gateOptions.length > 0 ? (
              <select
                value={selectedGate}
                onChange={(e) => setSelectedGate(e.target.value)}
                className="bg-[#03151a] border border-[#0b3d46] text-xs font-extrabold text-[#79C143] rounded-xl px-3.5 py-2 focus:outline-none"
              >
                {gateOptions.map((gate) => (
                  <option key={gate} value={gate}>{gate}</option>
                ))}
              </select>
            ) : (
              <a
                href="/admin/gates"
                className="px-3.5 py-2 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 font-bold text-xs flex items-center gap-1.5"
              >
                ⚠️ No Gates — Add Gates First
              </a>
            )}

            {/* On-Spot Gate Pass Button */}
            <button
              onClick={() => { setShowQuickRegister(true); setQuickRegError(''); }}
              className="px-3.5 py-2 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 hover:bg-amber-500/25 font-bold text-xs transition-all flex items-center gap-1.5 shadow-lg"
            >
              <UserPlus className="w-4 h-4 text-amber-400" />
              <span>On-Spot Gate Pass</span>
            </button>

            {/* Camera selector */}
            {cameras.length > 1 && (
              <select
                value={selectedCameraId}
                onChange={(e) => setSelectedCameraId(e.target.value)}
                className="bg-[#03151a] border border-[#0b3d46] text-xs text-slate-300 rounded-xl px-3 py-2 focus:outline-none"
              >
                {cameras.map((cam) => (
                  <option key={cam.id} value={cam.id}>{cam.label || `Camera ${cam.id.slice(0, 4)}`}</option>
                ))}
              </select>
            )}

            {/* Camera Toggle */}
            <button
              onClick={() => setCameraActive(!cameraActive)}
              className={`px-3.5 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-2 shadow-lg ${
                cameraActive
                  ? 'bg-rose-500/20 border border-rose-500/40 text-rose-400 hover:bg-rose-500/30'
                  : 'bg-[#01A64E] text-white hover:bg-[#79C143] shadow-[#01A64E]/20'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>{cameraActive ? 'Pause Camera' : 'Start Camera'}</span>
            </button>
          </div>
        </div>

        {/* Mode Switcher */}
        <div className="bg-[#072228] border border-[#0b3d46] p-2 rounded-2xl flex items-center justify-between gap-2 shadow-inner flex-wrap sm:flex-nowrap">
          {([
            { key: 'IN',    label: '🟢 ENTRY MODE',       icon: Zap,        active: 'bg-[#01A64E] text-white shadow-lg shadow-[#01A64E]/25',       idle: 'text-slate-400 hover:text-white hover:bg-[#0b3d46]/50' },
            { key: 'BREAK', label: '☕ PASS-OUT (BREAK)',  icon: Clock,      active: 'bg-amber-500 text-[#03151a] shadow-lg shadow-amber-500/25',    idle: 'text-slate-400 hover:text-white hover:bg-[#0b3d46]/50' },
            { key: 'OUT',   label: '🔴 FINAL EXIT',        icon: ArrowRight, active: 'bg-rose-500 text-white shadow-lg shadow-rose-500/25',          idle: 'text-slate-400 hover:text-white hover:bg-[#0b3d46]/50' },
          ] as const).map(({ key, label, icon: Icon, active, idle }) => (
            <button
              key={key}
              onClick={() => changeMode(key)}
              className={`flex-1 py-2.5 px-3 rounded-xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all min-w-[120px] ${mode === key ? `${active} scale-[1.01]` : idle}`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Scan Result */}
        {scanResult && (
          <div className={`p-6 rounded-3xl border text-center shadow-2xl animate-in fade-in duration-200 ${
            scanResult.code === 'VERIFIED'       ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-200' :
            scanResult.code === 'ON_BREAK'       ? 'bg-amber-950/80 border-amber-500/60 text-amber-200' :
            scanResult.code === 'CHECKED_OUT'    ? 'bg-rose-950/80 border-rose-500/60 text-rose-200' :
            scanResult.code === 'ALREADY_CHECKED_IN' || scanResult.code === 'NOT_CHECKED_IN' || scanResult.code === 'NOT_INSIDE'
                                                 ? 'bg-amber-950/70 border-amber-500/60 text-amber-200' :
                                                   'bg-rose-950/70 border-rose-500/60 text-rose-200'
          }`}>
            <div className="flex items-center justify-center mb-3">
              {scanResult.code === 'VERIFIED' ? (
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                </div>
              ) : scanResult.code === 'ON_BREAK' ? (
                <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center">
                  <Clock className="w-10 h-10 text-amber-400" />
                </div>
              ) : scanResult.code === 'CHECKED_OUT' ? (
                <div className="w-16 h-16 rounded-full bg-rose-500/20 border-2 border-rose-400 flex items-center justify-center">
                  <ArrowRight className="w-10 h-10 text-rose-400" />
                </div>
              ) : scanResult.code === 'ALREADY_CHECKED_IN' || scanResult.code === 'NOT_CHECKED_IN' || scanResult.code === 'NOT_INSIDE' ? (
                <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center">
                  <AlertTriangle className="w-10 h-10 text-amber-400" />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full bg-rose-500/20 border-2 border-rose-400 flex items-center justify-center">
                  <XCircle className="w-10 h-10 text-rose-400" />
                </div>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white mb-1 tracking-tight">{scanResult.message}</h2>

            {scanResult.visitor && (
              <div className="mt-4 p-4 bg-slate-950/90 rounded-2xl border border-slate-800 text-left text-xs sm:text-sm space-y-2 max-w-md mx-auto shadow-lg">
                <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
                  <span className="text-slate-400 font-medium">Attendee Name:</span>
                  <span className="font-extrabold text-white text-base">{scanResult.visitor.fullName}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
                  <span className="text-slate-400 font-medium">Badge Pass:</span>
                  <span className="font-bold text-emerald-400">{scanResult.visitor.category}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
                  <span className="text-slate-400 font-medium">Badge ID:</span>
                  <span className="font-mono font-bold text-slate-200">{scanResult.visitor.badgeCode}</span>
                </div>
                {scanResult.visitor.company && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-medium">Company:</span>
                    <span className="font-medium text-slate-300">{scanResult.visitor.company}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Scanner + Manual Entry Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Camera Viewport */}
          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-3xl text-center shadow-xl backdrop-blur-xl flex flex-col items-center justify-center relative min-h-[340px]">
            <div className="w-full flex items-center justify-between mb-3 text-xs text-slate-400 px-2">
              <span className="flex items-center gap-1.5 font-semibold text-emerald-400">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Camera Live
              </span>
              <span>Point at Badge QR Code</span>
            </div>

            {cameraActive ? (
              <div className={`relative w-full max-w-[320px] aspect-square rounded-2xl overflow-hidden border-2 bg-black shadow-inner ${
                mode === 'IN' ? 'border-emerald-500/40' : mode === 'BREAK' ? 'border-amber-500/40' : 'border-rose-500/40'
              }`}>
                <style>{`
                  #qr-camera-viewport video { width:100%!important; height:100%!important; object-fit:cover!important; display:block!important; }
                  #qr-camera-viewport { width:100%!important; height:100%!important; }
                `}</style>
                <div id="qr-camera-viewport" className="w-full h-full" />
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6">
                  <div className="w-full h-full border-2 border-dashed border-[#01A64E]/50 rounded-xl flex items-center justify-center">
                    <span className="text-[10px] font-bold text-[#79C143] bg-[#03151a]/80 px-2 py-0.5 rounded-full border border-[#01A64E]/30">
                      Align QR Code Within Box
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full max-w-[280px] aspect-square rounded-2xl border border-dashed border-slate-800 bg-slate-950/50 flex flex-col items-center justify-center p-6 text-slate-500">
                <Camera className="w-12 h-12 mb-3 text-slate-600" />
                <p className="text-xs text-center font-medium">Camera scanner is paused</p>
                <button
                  onClick={() => setCameraActive(true)}
                  className="mt-3 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs hover:text-white font-semibold flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Resume Scanner
                </button>
              </div>
            )}
          </div>

          {/* Manual Entry */}
          <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-3xl shadow-xl backdrop-blur-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Search className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-extrabold text-white">Manual / Barcode Gun Entry</h3>
              </div>
              <p className="text-xs text-slate-400 mb-5">Type EXPO26-XXXXX or scan badge with a USB barcode gun</p>

              <form onSubmit={(e) => { e.preventDefault(); verifyBadge(manualCode); }} className="space-y-4">
                <input
                  type="text"
                  placeholder="EXPO26-QFGHX"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-white font-mono text-base tracking-wider focus:outline-none focus:border-emerald-500 transition-colors uppercase shadow-inner"
                  autoFocus
                  required
                />
                <button
                  type="submit"
                  disabled={loading || !manualCode.trim()}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-sm hover:from-emerald-400 hover:to-teal-400 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                >
                  {loading ? <span>Verifying...</span> : <><ShieldCheck className="w-5 h-5" /><span>Verify Gate Pass</span></>}
                </button>
              </form>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 font-medium">
                <UserCheck className="w-4 h-4 text-emerald-400" /> Active Gate:
              </span>
              <span className="font-extrabold text-[#79C143]">{selectedGate}</span>
            </div>
          </div>
        </div>

        {/* Recent Scan History */}
        {history.length > 0 && (
          <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-3xl shadow-xl backdrop-blur-xl">
            <h3 className="text-sm font-extrabold text-white mb-4 flex items-center gap-2">
              <History className="w-4 h-4 text-slate-400" /> Recent Gate Scan Activity
            </h3>
            <div className="space-y-2">
              {history.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs hover:bg-slate-950 transition-all">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded-md font-mono font-bold text-[10px] ${
                      item.status === 'VERIFIED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      item.status === 'ALREADY_CHECKED_IN' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                      'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}>{item.badgeCode}</span>
                    <span className="font-bold text-white">{item.name}</span>
                    <span className="text-slate-400">({item.category})</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-500">
                    <span className="font-mono text-[11px]">{item.timestamp}</span>
                    {item.status === 'VERIFIED' ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Approved</span>
                    ) : item.status === 'ALREADY_CHECKED_IN' ? (
                      <span className="text-amber-400 font-bold flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" /> Re-scan</span>
                    ) : (
                      <span className="text-rose-400 font-bold flex items-center gap-1"><XCircle className="w-3.5 h-3.5" /> Denied</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ─── ON-SPOT GATE PASS REGISTRATION MODAL ─── */}
      {showQuickRegister && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#072228] border border-[#0b3d46] w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-5 animate-in fade-in duration-200">

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#0b3d46] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-white text-lg">On-Spot Gate Registration</h3>
                  <p className="text-xs text-slate-400">Register walk-in visitors & issue instant entry badge</p>
                </div>
              </div>
              <button
                onClick={() => setShowQuickRegister(false)}
                className="p-2 rounded-xl bg-[#03151a] hover:bg-[#0b3d46] text-slate-400 hover:text-white transition-all border border-[#0b3d46]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Banner */}
            {quickRegError && (
              <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{quickRegError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleQuickRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Nair"
                  value={quickRegForm.fullName}
                  onChange={(e) => setQuickRegForm({ ...quickRegForm, fullName: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-[#03151a] border border-[#0b3d46] text-white text-sm focus:outline-none focus:border-[#01A64E] transition-all"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="9876543210"
                    value={quickRegForm.phone}
                    onChange={(e) => setQuickRegForm({ ...quickRegForm, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[#03151a] border border-[#0b3d46] text-white text-sm focus:outline-none focus:border-[#01A64E] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Attendee Type</label>
                  <select
                    value={quickRegForm.category}
                    onChange={(e) => setQuickRegForm({ ...quickRegForm, category: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[#03151a] border border-[#0b3d46] text-slate-200 text-sm focus:outline-none focus:border-[#01A64E] transition-all"
                  >
                    <option value="VISITOR">Visitor (General)</option>
                    <option value="VIP">VIP Guest</option>
                    <option value="DELEGATE">Delegate</option>
                    <option value="EXHIBITOR">Exhibitor Staff</option>
                    <option value="PRESS">Media / Press</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Company / Organization</label>
                  <input
                    type="text"
                    placeholder="e.g. Solar Tech India"
                    value={quickRegForm.company}
                    onChange={(e) => setQuickRegForm({ ...quickRegForm, company: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[#03151a] border border-[#0b3d46] text-white text-sm focus:outline-none focus:border-[#01A64E] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Email (Optional)</label>
                  <input
                    type="email"
                    placeholder="rahul@example.com"
                    value={quickRegForm.email}
                    onChange={(e) => setQuickRegForm({ ...quickRegForm, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[#03151a] border border-[#0b3d46] text-white text-sm focus:outline-none focus:border-[#01A64E] transition-all"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#0b3d46] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowQuickRegister(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#03151a] hover:bg-[#0b3d46] text-slate-400 hover:text-white font-bold text-xs transition-all border border-[#0b3d46]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={quickRegSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-[#01A64E] hover:bg-[#79C143] text-white font-extrabold text-sm transition-all shadow-lg shadow-[#01A64E]/20 flex items-center gap-2 disabled:opacity-50 active:scale-[0.98]"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{quickRegSubmitting ? 'Issuing Pass...' : 'Create & Check-In Now'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
