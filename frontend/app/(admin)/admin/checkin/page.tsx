'use client';

import { useState, useEffect, useRef } from 'react';
import { QrCode, CheckCircle2, AlertTriangle, XCircle, Search, ShieldCheck, Camera, RefreshCw, Zap, Clock, UserCheck, History, ArrowRight } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
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
  const [cameraActive, setCameraActive] = useState(false); // start false until a camera ID is resolved
  const [cameras, setCameras] = useState<any[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [history, setHistory] = useState<ScanHistoryItem[]>([]);

  // Multi-mode Check-In / Break / Check-Out state
  const [mode, setMode] = useState<'IN' | 'BREAK' | 'OUT'>('IN');
  const [selectedGate, setSelectedGate] = useState<string>('Main Entrance Gate 1');
  const [gateOptions, setGateOptions] = useState<string[]>([
    'Main Entrance Gate 1',
    'South Exit Gate 2',
    'VIP Entrance Gate 3',
    'Exhibitor Hall Gate 4',
  ]);

  // React Refs to prevent stale closure inside html5-qrcode callback
  // We keep mode ONLY in a ref so camera callback always reads the live value
  const modeRef = useRef<'IN' | 'BREAK' | 'OUT'>('IN');
  const selectedGateRef = useRef<string>('Main Entrance Gate 1');

  // Helper: update both the state (for UI re-render) AND the ref (for camera callback)
  const changeMode = (newMode: 'IN' | 'BREAK' | 'OUT') => {
    modeRef.current = newMode;
    setMode(newMode);
    setScanResult(null);
    // Clear debounce so the same badge can be re-scanned immediately in new mode
    lastScannedCodeRef.current = { code: '', time: 0 };
  };

  useEffect(() => {
    selectedGateRef.current = selectedGate;
  }, [selectedGate]);

  // Dynamic Gate Loader
  useEffect(() => {
    fetchApi<any>('/api/admin/gates')
      .then((res) => {
        if (res && res.gates && res.gates.length > 0) {
          const names = res.gates.map((g: any) => g.name);
          setGateOptions(names);
          if (!names.includes(selectedGateRef.current)) {
            setSelectedGate(names[0]);
          }
        }
      })
      .catch(() => {});
  }, []);

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const lastScannedCodeRef = useRef<{ code: string; time: number }>({ code: '', time: 0 });
  // Use a ref for loading so the html5-qrcode callback always sees the latest value (avoids stale closure)
  const loadingRef = useRef(false);

  // Web Audio Synthesizer Beeps
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
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
        osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } else if (type === 'warning') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      } else {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch {
      // Audio context blocked or unsupported
    }
  };

  const verifyBadge = async (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode || loadingRef.current) return;

    // Prevent double scanning same code+mode combo within 3 seconds
    // Using mode+code as key so same badge CAN be scanned in a different mode immediately
    const now = Date.now();
    const scanKey = `${modeRef.current}::${cleanCode}`;
    if (lastScannedCodeRef.current.code === scanKey && now - lastScannedCodeRef.current.time < 3000) {
      return;
    }
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
        addHistoryItem(
          cleanCode,
          data.visitor?.fullName || 'Visitor',
          data.visitor?.category || 'PASS',
          'VERIFIED'
        );
      } else if (data.code === 'ALREADY_CHECKED_IN' || data.code === 'NOT_CHECKED_IN') {
        playSound('warning');
        addHistoryItem(
          cleanCode,
          data.visitor?.fullName || 'Visitor',
          data.visitor?.category || 'PASS',
          'ALREADY_CHECKED_IN'
        );
      } else {
        playSound('error');
        addHistoryItem(cleanCode, 'Unknown Visitor', 'N/A', 'ERROR');
      }
    } catch (err: any) {
      playSound('error');
      setScanResult({
        success: false,
        code: 'ERROR',
        message: `❌ ${err.message || 'Invalid badge or server error'}`,
      });
      addHistoryItem(cleanCode, 'Invalid Badge', 'N/A', 'ERROR');
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  };

  const addHistoryItem = (badgeCode: string, name: string, category: string, status: 'VERIFIED' | 'ALREADY_CHECKED_IN' | 'ERROR') => {
    const newItem: ScanHistoryItem = {
      id: Math.random().toString(),
      badgeCode,
      name,
      category,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      status,
    };
    setHistory((prev) => [newItem, ...prev.slice(0, 7)]);
  };

  // Get list of available video cameras, then auto-start once a real ID is resolved
  useEffect(() => {
    Html5Qrcode.getCameras()
      .then((deviceList) => {
        if (deviceList && deviceList.length > 0) {
          setCameras(deviceList);
          // Prefer back camera if available
          const backCam = deviceList.find((c) => c.label.toLowerCase().includes('back') || c.label.toLowerCase().includes('environment'));
          const chosenId = backCam ? backCam.id : deviceList[0].id;
          setSelectedCameraId(chosenId);
          setCameraActive(true); // only start after we have a real camera ID
        }
      })
      .catch(() => {});
  }, []);

  // Initialize and control camera scanner
  useEffect(() => {
    // Only start if camera is toggled on AND we have a real camera ID
    if (!cameraActive || !selectedCameraId) return;

    let timeoutId: ReturnType<typeof setTimeout>;

    // Small delay: prevents React Strict Mode double-effect from racing with the library
    timeoutId = setTimeout(() => {
      const qrReaderElement = document.getElementById('qr-camera-viewport');
      if (!qrReaderElement) return;

      const html5QrCode = new Html5Qrcode('qr-camera-viewport', { verbose: false } as any);
      html5QrCodeRef.current = html5QrCode;

      const config = { fps: 10, qrbox: { width: 200, height: 200 } };

      html5QrCode
        .start(
          { deviceId: { exact: selectedCameraId } },
          config,
          (decodedText) => {
            verifyBadge(decodedText);
          },
          () => {}
        )
        .catch(() => {
          // Camera permission denied or device busy — silent fail
        });
    }, 150);

    return () => {
      clearTimeout(timeoutId);
      const instance = html5QrCodeRef.current;
      if (instance) {
        // Always attempt stop + clear; swallow "not running" errors gracefully
        instance
          .stop()
          .catch(() => {})
          .finally(() => {
            instance.clear();
          });
        html5QrCodeRef.current = null;
      }
    };
  }, [cameraActive, selectedCameraId]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950 flex flex-col">
      {/* UNIFIED ADMIN NAVBAR */}
      <AdminNavbar />

      <main className="max-w-4xl mx-auto w-full px-4 py-6 flex-1 flex flex-col space-y-6">
        {/* Top Header Card */}
        <div className="flex flex-col md:flex-row md:items-center justify-between bg-slate-900/80 border border-slate-800 p-5 rounded-3xl backdrop-blur-xl shadow-xl gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center font-bold transition-all ${
              mode === 'IN' 
                ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' 
                : 'bg-amber-500/20 border-amber-500/30 text-amber-400'
            }`}>
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-extrabold text-white text-lg sm:text-xl flex items-center gap-2">
                Gate Scanner — <span className={
                  mode === 'IN' ? 'text-emerald-400' : mode === 'BREAK' ? 'text-amber-400' : 'text-rose-400'
                }>{
                  mode === 'IN' ? 'CHECK-IN (ENTRY)' : mode === 'BREAK' ? 'PASS-OUT (BREAK)' : 'FINAL EXIT'
                }</span>
              </h1>
              <p className="text-xs text-slate-400">Scan QR codes on attendee badges for instant entry/exit validation</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Gate Location Selector */}
            <select
              value={selectedGate}
              onChange={(e) => setSelectedGate(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-xl px-3 py-2 focus:outline-none"
            >
              {gateOptions.map((gate) => (
                <option key={gate} value={gate}>{gate}</option>
              ))}
            </select>

            {/* Camera Selector */}
            {cameras.length > 1 && (
              <select
                value={selectedCameraId}
                onChange={(e) => setSelectedCameraId(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-xl px-3 py-2 focus:outline-none"
              >
                {cameras.map((cam) => (
                  <option key={cam.id} value={cam.id}>
                    {cam.label || `Camera ${cam.id.slice(0, 4)}`}
                  </option>
                ))}
              </select>
            )}

            {/* Camera Toggle Button */}
            <button
              onClick={() => setCameraActive(!cameraActive)}
              className={`px-3.5 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-2 shadow-lg ${
                cameraActive
                  ? 'bg-rose-500/20 border border-rose-500/40 text-rose-400 hover:bg-rose-500/30'
                  : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-emerald-500/20'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>{cameraActive ? 'Pause Camera' : 'Start Camera'}</span>
            </button>
          </div>
        </div>

        {/* Mode Switcher Banner (ENTRY vs BREAK vs EXIT) */}
        <div className="bg-slate-900/60 border border-slate-800/80 p-2 rounded-2xl flex items-center justify-between gap-2 shadow-inner flex-wrap sm:flex-nowrap">
          <button
            onClick={() => changeMode('IN')}
            className={`flex-1 py-2.5 px-3 rounded-xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all min-w-[120px] ${
              mode === 'IN'
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/25 scale-[1.01]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>🟢 ENTRY MODE</span>
          </button>

          <button
            onClick={() => changeMode('BREAK')}
            className={`flex-1 py-2.5 px-3 rounded-xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all min-w-[120px] ${
              mode === 'BREAK'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/25 scale-[1.01]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>☕ PASS-OUT (BREAK)</span>
          </button>

          <button
            onClick={() => changeMode('OUT')}
            className={`flex-1 py-2.5 px-3 rounded-xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all min-w-[120px] ${
              mode === 'OUT'
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/25 scale-[1.01]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <ArrowRight className="w-4 h-4" />
            <span>🔴 FINAL EXIT</span>
          </button>
        </div>

        {/* Verification Result Notification Card */}
        {scanResult && (
          <div
            className={`p-6 rounded-3xl border text-center shadow-2xl transition-all animate-in fade-in duration-200 ${
              scanResult.code === 'VERIFIED'
                ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-200'
                : scanResult.code === 'ON_BREAK'
                ? 'bg-amber-950/80 border-amber-500/60 text-amber-200'
                : scanResult.code === 'CHECKED_OUT'
                ? 'bg-rose-950/80 border-rose-500/60 text-rose-200'
                : scanResult.code === 'ALREADY_CHECKED_IN' || scanResult.code === 'NOT_CHECKED_IN' || scanResult.code === 'NOT_INSIDE'
                ? 'bg-amber-950/70 border-amber-500/60 text-amber-200'
                : 'bg-rose-950/70 border-rose-500/60 text-rose-200'
            }`}
          >
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Live Camera Scanner Viewport */}
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
              <div className={`relative w-full max-w-[320px] aspect-square rounded-2xl overflow-hidden border-2 bg-black shadow-inner group ${
                mode === 'IN' ? 'border-emerald-500/40' : mode === 'BREAK' ? 'border-amber-500/40' : 'border-rose-500/40'
              }`}>
                {/* html5-qrcode injects its own <video> — force it to fill this container */}
                <style>{`
                  #qr-camera-viewport video {
                    width: 100% !important;
                    height: 100% !important;
                    object-fit: cover !important;
                    display: block !important;
                  }
                  #qr-camera-viewport {
                    width: 100% !important;
                    height: 100% !important;
                  }
                `}</style>

                {/* HTML5 QR Camera Video Target */}
                <div id="qr-camera-viewport" className="w-full h-full" />

                {/* Animated HUD Target Reticle */}
                <div className="absolute inset-0 pointer-events-none border-[3px] border-slate-500/20 rounded-2xl flex items-center justify-center">
                  {/* Top-Left Corner */}
                  <div className={`absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 rounded-tl-md ${
                    mode === 'IN' ? 'border-emerald-400' : mode === 'BREAK' ? 'border-amber-400' : 'border-rose-400'
                  }`} />
                  {/* Top-Right Corner */}
                  <div className={`absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 rounded-tr-md ${
                    mode === 'IN' ? 'border-emerald-400' : mode === 'BREAK' ? 'border-amber-400' : 'border-rose-400'
                  }`} />
                  {/* Bottom-Left Corner */}
                  <div className={`absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 rounded-bl-md ${
                    mode === 'IN' ? 'border-emerald-400' : mode === 'BREAK' ? 'border-amber-400' : 'border-rose-400'
                  }`} />
                  {/* Bottom-Right Corner */}
                  <div className={`absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 rounded-br-md ${
                    mode === 'IN' ? 'border-emerald-400' : mode === 'BREAK' ? 'border-amber-400' : 'border-rose-400'
                  }`} />

                  {/* Scanning Laser Beam Line */}
                  <div className={`w-3/4 h-0.5 bg-gradient-to-r from-transparent via-current to-transparent animate-pulse ${
                    mode === 'IN' ? 'text-emerald-400 shadow-[0_0_12px_#10b981]' : mode === 'BREAK' ? 'text-amber-400 shadow-[0_0_12px_#f59e0b]' : 'text-rose-400 shadow-[0_0_12px_#f43f5e]'
                  }`} />
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

          {/* Manual Badge Code Entry */}
          <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-3xl shadow-xl backdrop-blur-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Search className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-extrabold text-white">Manual / Barcode Gun Entry</h3>
              </div>
              <p className="text-xs text-slate-400 mb-5">
                Type EXPO26-XXXXX or scan badge with a USB barcode gun
              </p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  verifyBadge(manualCode);
                }}
                className="space-y-4"
              >
                <div className="relative">
                  <input
                    type="text"
                    placeholder="EXPO26-QFGHX"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                    className="w-full px-4 py-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-white font-mono text-base tracking-wider focus:outline-none focus:border-emerald-500 transition-colors uppercase shadow-inner"
                    autoFocus
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !manualCode.trim()}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-sm hover:from-emerald-400 hover:to-teal-400 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50 cursor-pointer active:scale-98"
                >
                  {loading ? (
                    <span>Verifying...</span>
                  ) : (
                    <>
                      <ShieldCheck className="w-4.5 h-4.5" />
                      <span>Verify Gate Pass</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Quick Gate Stats */}
            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 font-medium">
                <UserCheck className="w-4 h-4 text-emerald-400" /> Live Gate Gatekeeper
              </span>
              <span className="font-mono text-slate-500">EXPO26-GATE1</span>
            </div>
          </div>
        </div>

        {/* Live Gate Scans Activity History */}
        {history.length > 0 && (
          <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-3xl shadow-xl backdrop-blur-xl">
            <h3 className="text-sm font-extrabold text-white mb-4 flex items-center gap-2">
              <History className="w-4 h-4 text-slate-400" /> Recent Gate Scan Activity
            </h3>

            <div className="space-y-2">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs transition-all hover:bg-slate-950"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2 py-0.5 rounded-md font-mono font-bold text-[10px] ${
                        item.status === 'VERIFIED'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : item.status === 'ALREADY_CHECKED_IN'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {item.badgeCode}
                    </span>
                    <span className="font-bold text-white">{item.name}</span>
                    <span className="text-slate-400 font-medium">({item.category})</span>
                  </div>

                  <div className="flex items-center gap-3 text-slate-500">
                    <span className="text-[11px] font-mono">{item.timestamp}</span>
                    {item.status === 'VERIFIED' ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                      </span>
                    ) : item.status === 'ALREADY_CHECKED_IN' ? (
                      <span className="text-amber-400 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> Re-scan
                      </span>
                    ) : (
                      <span className="text-rose-400 font-bold flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" /> Denied
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
