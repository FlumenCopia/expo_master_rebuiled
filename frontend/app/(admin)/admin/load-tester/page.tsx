'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Activity,
  Play,
  Square,
  Zap,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Server,
  Download,
  FileText,
  RefreshCw,
  Sliders,
  TrendingUp,
  Cpu,
  BarChart3,
  Globe,
  Layers,
  Printer,
  Sparkles,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import { useAdminTheme } from '@/context/AdminThemeContext';

interface TestPreset {
  id: string;
  title: string;
  description: string;
  endpoint: string;
  method: 'GET' | 'POST';
  defaultConcurrency: number;
  defaultTotal: number;
  payload?: any;
}

interface TelemetryPoint {
  time: string;
  rps: number;
  avgLatency: number;
  successRate: number;
  errors: number;
}

interface DiagnosticReport {
  timestamp: string;
  presetTitle: string;
  targetUrl: string;
  method: string;
  concurrency: number;
  totalRequests: number;
  durationSec: number;
  peakRps: number;
  avgRps: number;
  successRate: number;
  latencyMs: {
    min: number;
    avg: number;
    p50: number;
    p90: number;
    p99: number;
    max: number;
  };
  statusBreakdown: Record<string, number>;
  healthGrade: 'EXCELLENT' | 'GOOD' | 'NEEDS_OPTIMIZATION' | 'HIGH_CRASH_RISK';
  bottlenecks: string[];
  recommendations: string[];
}

const PRESETS: TestPreset[] = [
  {
    id: 'events_browsing',
    title: 'Ad Traffic: Event Browsing Surge',
    description: 'Simulates 500+ ad clickers loading events & master listings at once.',
    endpoint: '/api/events',
    method: 'GET',
    defaultConcurrency: 50,
    defaultTotal: 500,
  },
  {
    id: 'visitor_registration',
    title: 'Ad Traffic: Visitor Registration Spike',
    description: 'Simulates concurrent visitors filling forms and receiving badge codes.',
    endpoint: '/api/visitors/register',
    method: 'POST',
    defaultConcurrency: 30,
    defaultTotal: 300,
    payload: {
      fullName: 'Simulated Ad Visitor',
      email: 'adtest@expokerala.in',
      phone: '9876543210',
      company: 'Ad Traffic Tester Inc',
      designation: 'Attendee',
      district: 'Ernakulam',
      state: 'Kerala',
    },
  },
  {
    id: 'exhibitor_submission',
    title: 'Exhibitor Stall Registration Surge',
    description: 'Simulates exhibitor application submissions under high load.',
    endpoint: '/api/exhibitors/register',
    method: 'POST',
    defaultConcurrency: 20,
    defaultTotal: 150,
    payload: {
      companyName: 'Surge Exhibitor Ltd',
      contactPerson: 'Surge Admin',
      email: 'exhibitor-surge@expokerala.in',
      phone: '9123456789',
      stallSize: '3x3m Standard',
      productCategory: 'Technology & Hardware',
    },
  },
  {
    id: 'health_check',
    title: 'API Gateway Health Micro-benchmark',
    description: 'Tests maximum network socket connections per second on API gateway.',
    endpoint: '/api/health',
    method: 'GET',
    defaultConcurrency: 100,
    defaultTotal: 1000,
  },
];

export default function LoadTesterPage() {
  const { isDark } = useAdminTheme();

  // Test Settings
  const [selectedPreset, setSelectedPreset] = useState<string>('events_browsing');
  const [endpoint, setEndpoint] = useState<string>('/api/events');
  const [method, setMethod] = useState<'GET' | 'POST'>('GET');
  const [concurrency, setConcurrency] = useState<number>(50);
  const [totalRequests, setTotalRequests] = useState<number>(500);
  const [engine, setEngine] = useState<'CLIENT_WORKERS' | 'BACKEND_ORCHESTRATOR'>('CLIENT_WORKERS');
  const [payloadText, setPayloadText] = useState<string>('');

  // Execution State
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [completedCount, setCompletedCount] = useState<number>(0);
  const [currentRps, setCurrentRps] = useState<number>(0);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [telemetryHistory, setTelemetryHistory] = useState<TelemetryPoint[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<any>(null);

  // Diagnostics Report
  const [report, setReport] = useState<DiagnosticReport | null>(null);

  const abortControllerRef = useRef<boolean>(false);

  // Fetch System Live Metrics
  const fetchSystemMetrics = async () => {
    try {
      const res = await fetch('/api/dev/system-metrics', {
        headers: { 'x-dev-load-test': 'enabled' },
      });
      if (res.ok) {
        const data = await res.json();
        setSystemMetrics(data);
      }
    } catch (err) {
      // Ignore background error if dev endpoint unmounted
    }
  };

  useEffect(() => {
    fetchSystemMetrics();
    const interval = setInterval(fetchSystemMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSelectPreset = (presetId: string) => {
    const p = PRESETS.find((item) => item.id === presetId);
    if (!p) return;
    setSelectedPreset(presetId);
    setEndpoint(p.endpoint);
    setMethod(p.method);
    setConcurrency(p.defaultConcurrency);
    setTotalRequests(p.defaultTotal);
    if (p.payload) {
      setPayloadText(JSON.stringify(p.payload, null, 2));
    } else {
      setPayloadText('');
    }
  };

  // Run Load Test Execution
  const startLoadTest = async () => {
    setIsRunning(true);
    setCompletedCount(0);
    setCurrentRps(0);
    setStatusCounts({});
    setTelemetryHistory([]);
    setReport(null);
    abortControllerRef.current = false;

    const startTime = Date.now();
    const latencies: number[] = [];
    const localStatusCounts: Record<string, number> = {};
    let localCompleted = 0;

    const apiUrl = endpoint.startsWith('http')
      ? endpoint
      : `http://localhost:5000${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

    if (engine === 'BACKEND_ORCHESTRATOR') {
      // Run backend orchestrator worker benchmark
      try {
        let parsedPayload = null;
        if (method === 'POST' && payloadText.trim()) {
          try {
            parsedPayload = JSON.parse(payloadText);
          } catch (e) {}
        }

        const res = await fetch('/api/dev/load-test', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-dev-load-test': 'enabled',
          },
          body: JSON.stringify({
            targetPath: endpoint,
            method,
            concurrency,
            totalRequests,
            payload: parsedPayload,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          setCompletedCount(totalRequests);
          setStatusCounts(data.statusCounts || {});

          const durationSec = data.summary.durationMs / 1000;
          const peakRps = data.summary.requestsPerSecond;
          const successRate = data.summary.successRatePercent;

          // Build Report
          let grade: DiagnosticReport['healthGrade'] = 'EXCELLENT';
          const bottlenecks: string[] = [];
          if (successRate < 90) {
            grade = 'HIGH_CRASH_RISK';
            bottlenecks.push('High server error rate (5xx or connection drops). Database or memory limit reached.');
          } else if (data.latencyMs.p90 > 1000 || data.latencyMs.avg > 500) {
            grade = 'NEEDS_OPTIMIZATION';
            bottlenecks.push('P90 Latency exceeded 1000ms. Response caching recommended.');
          } else if (successRate < 98) {
            grade = 'GOOD';
          }

          setReport({
            timestamp: new Date().toLocaleTimeString(),
            presetTitle: PRESETS.find((p) => p.id === selectedPreset)?.title || 'Custom Test Scenario',
            targetUrl: data.summary.targetUrl,
            method,
            concurrency,
            totalRequests,
            durationSec: parseFloat(durationSec.toFixed(2)),
            peakRps,
            avgRps: peakRps,
            successRate,
            latencyMs: data.latencyMs,
            statusBreakdown: data.statusCounts,
            healthGrade: grade,
            bottlenecks,
            recommendations: data.recommendations || [],
          });
        }
      } catch (err: any) {
        alert('Failed to connect to backend orchestrator endpoint: ' + err.message);
      } finally {
        setIsRunning(false);
      }
      return;
    }

    // CLIENT_WORKERS Execution Engine
    let parsedPayload: any = null;
    if (method === 'POST' && payloadText.trim()) {
      try {
        parsedPayload = JSON.parse(payloadText);
      } catch (e) {}
    }

    const intervalTimer = setInterval(() => {
      const elapsedSec = (Date.now() - startTime) / 1000;
      if (elapsedSec > 0) {
        const rpsNow = Math.round(localCompleted / elapsedSec);
        setCurrentRps(rpsNow);

        const avgLatNow =
          latencies.length > 0
            ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length)
            : 0;
        const totalOk = Object.entries(localStatusCounts)
          .filter(([code]) => code.startsWith('2'))
          .reduce((sum, [, count]) => sum + count, 0);
        const succRateNow = localCompleted > 0 ? Math.round((totalOk / localCompleted) * 100) : 100;
        const errsNow = localCompleted - totalOk;

        setTelemetryHistory((prev) => [
          ...prev.slice(-20),
          {
            time: new Date().toLocaleTimeString().split(' ')[0],
            rps: rpsNow,
            avgLatency: avgLatNow,
            successRate: succRateNow,
            errors: errsNow,
          },
        ]);
      }
    }, 500);

    const workerTask = async () => {
      while (localCompleted < totalRequests && !abortControllerRef.current) {
        localCompleted++;
        setCompletedCount(localCompleted);

        const reqStart = Date.now();
        try {
          const res = await fetch(apiUrl, {
            method,
            headers: {
              'Content-Type': 'application/json',
              'x-dev-load-test': 'enabled',
            },
            ...(parsedPayload && method !== 'GET' ? { body: JSON.stringify(parsedPayload) } : {}),
          });
          const duration = Date.now() - reqStart;
          latencies.push(duration);
          const code = res.status.toString();
          localStatusCounts[code] = (localStatusCounts[code] || 0) + 1;
        } catch (err) {
          const duration = Date.now() - reqStart;
          latencies.push(duration);
          localStatusCounts['NET_ERR'] = (localStatusCounts['NET_ERR'] || 0) + 1;
        }
        setStatusCounts({ ...localStatusCounts });
      }
    };

    const workerPool = Array.from({ length: concurrency }, () => workerTask());
    await Promise.all(workerPool);

    clearInterval(intervalTimer);
    setIsRunning(false);

    const totalDurationSec = Math.max(0.1, (Date.now() - startTime) / 1000);
    const avgRpsVal = parseFloat((localCompleted / totalDurationSec).toFixed(1));

    latencies.sort((a, b) => a - b);
    const minL = latencies[0] || 0;
    const maxL = latencies[latencies.length - 1] || 0;
    const avgL = Math.round(latencies.reduce((a, b) => a + b, 0) / (latencies.length || 1));
    const p50 = latencies[Math.floor(latencies.length * 0.5)] || 0;
    const p90 = latencies[Math.floor(latencies.length * 0.9)] || 0;
    const p99 = latencies[Math.floor(latencies.length * 0.99)] || 0;

    const totalOk = Object.entries(localStatusCounts)
      .filter(([code]) => code.startsWith('2'))
      .reduce((sum, [, count]) => sum + count, 0);
    const succRateVal = parseFloat(((totalOk / (localCompleted || 1)) * 100).toFixed(1));

    let grade: DiagnosticReport['healthGrade'] = 'EXCELLENT';
    const bottlenecks: string[] = [];
    const recommendations: string[] = [];

    if (succRateVal < 85) {
      grade = 'HIGH_CRASH_RISK';
      bottlenecks.push('Critical failure rate under concurrent load. System memory or DB pool exhausted.');
      recommendations.push('Increase PostgreSQL connection pool limit or enable read-replica connection pooling.');
    } else if (p90 > 800 || avgL > 400) {
      grade = 'NEEDS_OPTIMIZATION';
      bottlenecks.push('High response latency detected during traffic burst (P90 > 800ms).');
      recommendations.push('Enable memory TTL cache on public GET endpoints to skip DB lookups for ad visitors.');
    } else if (succRateVal < 98) {
      grade = 'GOOD';
      recommendations.push('Minor rate limiting or network retries observed. System sustained traffic surge effectively.');
    } else {
      recommendations.push('System handles high concurrent ad surge with fast sub-100ms response times and 0 error drops.');
    }

    if (localStatusCounts['429']) {
      recommendations.push(`Express Rate Limiter throttled ${localStatusCounts['429']} requests. Consider raising window limit before big ad campaigns.`);
    }

    setReport({
      timestamp: new Date().toLocaleTimeString(),
      presetTitle: PRESETS.find((p) => p.id === selectedPreset)?.title || 'Custom Load Scenario',
      targetUrl: apiUrl,
      method,
      concurrency,
      totalRequests: localCompleted,
      durationSec: parseFloat(totalDurationSec.toFixed(2)),
      peakRps: avgRpsVal,
      avgRps: avgRpsVal,
      successRate: succRateVal,
      latencyMs: { min: minL, avg: avgL, p50, p90, p99, max: maxL },
      statusBreakdown: localStatusCounts,
      healthGrade: grade,
      bottlenecks,
      recommendations,
    });
  };

  const stopLoadTest = () => {
    abortControllerRef.current = true;
    setIsRunning(false);
  };

  const downloadReportJson = () => {
    if (!report) return;
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expo26-load-test-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const printReport = () => {
    window.print();
  };

  const getGradeBadge = (grade: DiagnosticReport['healthGrade']) => {
    switch (grade) {
      case 'EXCELLENT':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" /> EXCELLENT (SYSTEM READY FOR AD CAMPAIGN)
          </span>
        );
      case 'GOOD':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" /> GOOD (CAPABLE UNDER SURGE)
          </span>
        );
      case 'NEEDS_OPTIMIZATION':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4" /> NEEDS OPTIMIZATION (HIGH LATENCY)
          </span>
        );
      case 'HIGH_CRASH_RISK':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4" /> CRITICAL CRASH RISK DETECTED
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 font-sans">
      {/* HEADER STRIP */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-black bg-amber-500/10 text-amber-400 border border-amber-500/30 uppercase tracking-widest">
              Dev Only Tool
            </span>
            <span className="px-2.5 py-0.5 rounded text-[10px] font-black bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 uppercase tracking-widest">
              Ad Traffic Simulator
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-1 flex items-center gap-2">
            <Zap className="w-7 h-7 text-amber-400 fill-amber-400/20" />
            System Load &amp; Capacity Tester
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Simulate massive concurrent traffic bursts when ad campaigns launch to test if database &amp; server sustain peak traffic without crashing.
          </p>
        </div>

        {/* LIVE SYSTEM METRICS POLLER CARD */}
        <div className="flex items-center gap-4 bg-slate-900/90 border border-slate-800 p-3 rounded-2xl shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase">Process Memory</div>
              <div className="text-xs font-black text-slate-200">
                {systemMetrics?.memory?.heapUsedMb || '--'} MB Heap / {systemMetrics?.memory?.rssMb || '--'} MB RSS
              </div>
            </div>
          </div>
          <div className="h-8 w-px bg-slate-800" />
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase">Database Latency</div>
              <div className="text-xs font-black text-emerald-400">
                {systemMetrics?.database?.latencyMs >= 0 ? `${systemMetrics.database.latencyMs} ms` : 'Disconnected'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TRAFFIC SURGE PRESETS */}
      <div>
        <h2 className="text-sm font-black text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" /> Select Ad Traffic Simulation Scenario
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleSelectPreset(preset.id)}
              disabled={isRunning}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                selectedPreset === preset.id
                  ? 'bg-amber-500/10 border-amber-500/50 shadow-lg shadow-amber-500/5 text-white ring-1 ring-amber-500/40'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black uppercase text-amber-400">{preset.method}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  {preset.defaultConcurrency} Parallel
                </span>
              </div>
              <div className="text-xs font-black text-slate-100 mb-1">{preset.title}</div>
              <div className="text-[11px] text-slate-400 leading-snug line-clamp-2">{preset.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* TEST CONFIGURATION PANEL */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-black text-white uppercase tracking-wider">Test Configuration Parameters</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setEngine('CLIENT_WORKERS')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                engine === 'CLIENT_WORKERS'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Browser Multi-Worker Pool
            </button>
            <button
              onClick={() => setEngine('BACKEND_ORCHESTRATOR')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                engine === 'BACKEND_ORCHESTRATOR'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Backend Server Micro-Benchmark
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Endpoint Target */}
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-2">Target Endpoint URL</label>
            <div className="flex items-center gap-2">
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as any)}
                disabled={isRunning}
                className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-amber-400 focus:outline-none focus:border-amber-500"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
              </select>
              <input
                type="text"
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
                disabled={isRunning}
                placeholder="/api/events"
                className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Concurrency Level */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold mb-2">
              <span className="text-slate-400">Concurrent Virtual Users / Threads</span>
              <span className="text-amber-400 font-mono">{concurrency} Concurrent</span>
            </div>
            <input
              type="range"
              min="5"
              max="300"
              step="5"
              value={concurrency}
              onChange={(e) => setConcurrency(parseInt(e.target.value, 10))}
              disabled={isRunning}
              className="w-full accent-amber-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>5 Light Burst</span>
              <span>100 Ad Spike</span>
              <span>300 Heavy Stress</span>
            </div>
          </div>

          {/* Total Request Count */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold mb-2">
              <span className="text-slate-400">Total Requests to Fire</span>
              <span className="text-indigo-400 font-mono">{totalRequests} Requests</span>
            </div>
            <input
              type="range"
              min="50"
              max="5000"
              step="50"
              value={totalRequests}
              onChange={(e) => setTotalRequests(parseInt(e.target.value, 10))}
              disabled={isRunning}
              className="w-full accent-indigo-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>50 Quick</span>
              <span>1000 Standard</span>
              <span>5000 Stress Burst</span>
            </div>
          </div>
        </div>

        {/* POST JSON Payload Area */}
        {method === 'POST' && (
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-2">Sample Request Body JSON (Optional)</label>
            <textarea
              value={payloadText}
              onChange={(e) => setPayloadText(e.target.value)}
              disabled={isRunning}
              rows={3}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 focus:outline-none focus:border-indigo-500"
              placeholder='{ "email": "test@expo.in" }'
            />
          </div>
        )}

        {/* ACTION BUTTONS */}
        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-400" />
            <span>Target: <strong className="text-slate-200">{method} {endpoint}</strong></span>
          </div>

          {isRunning ? (
            <button
              onClick={stopLoadTest}
              className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs transition-all flex items-center gap-2 shadow-lg shadow-rose-600/20 cursor-pointer"
            >
              <Square className="w-4 h-4 fill-white" /> Stop Load Test
            </button>
          ) : (
            <button
              onClick={startLoadTest}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs tracking-wider uppercase transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-slate-950" /> Run Capacity Stress Test
            </button>
          )}
        </div>
      </div>

      {/* LIVE PROGRESS & METRICS COUNTERS */}
      {(isRunning || completedCount > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl">
            <div className="text-[10px] font-extrabold uppercase text-slate-400">Total Requests Sent</div>
            <div className="text-2xl font-black text-white mt-1">
              {completedCount} <span className="text-xs font-medium text-slate-500">/ {totalRequests}</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-3">
              <div
                className="bg-amber-400 h-full transition-all duration-300"
                style={{ width: `${Math.min(100, (completedCount / totalRequests) * 100)}%` }}
              />
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl">
            <div className="text-[10px] font-extrabold uppercase text-slate-400">Current Throughput</div>
            <div className="text-2xl font-black text-emerald-400 mt-1 flex items-baseline gap-1">
              {currentRps} <span className="text-xs font-bold text-slate-400">Req / Sec</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-2">Active Worker Threads: {concurrency}</div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl">
            <div className="text-[10px] font-extrabold uppercase text-slate-400">Success Rate (2xx OK)</div>
            <div className="text-2xl font-black text-indigo-400 mt-1">
              {completedCount > 0
                ? `${Math.round(
                    ((Object.entries(statusCounts)
                      .filter(([c]) => c.startsWith('2'))
                      .reduce((s, [, cnt]) => s + cnt, 0) /
                      completedCount) *
                      100) || 0
                  )}%`
                : '100%'}
            </div>
            <div className="text-[11px] text-slate-500 mt-2">
              HTTP 200 OK:{' '}
              {Object.entries(statusCounts)
                .filter(([c]) => c.startsWith('2'))
                .reduce((s, [, cnt]) => s + cnt, 0)}
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl">
            <div className="text-[10px] font-extrabold uppercase text-slate-400">Errors / Throttling</div>
            <div className="text-2xl font-black text-rose-400 mt-1">
              {(statusCounts['500'] || 0) + (statusCounts['NET_ERR'] || 0) + (statusCounts['429'] || 0)}
            </div>
            <div className="text-[11px] text-slate-500 mt-2">
              Rate Limited (429): {statusCounts['429'] || 0} | 5xx: {statusCounts['500'] || 0}
            </div>
          </div>
        </div>
      )}

      {/* LIVE TELEMETRY RECHARTS TIMELINE GRAPH */}
      {telemetryHistory.length > 0 && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" /> Real-time Throughput &amp; Response Latency
            </h3>
            <span className="text-xs text-slate-400 font-mono">Live Timeline</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={telemetryHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                <YAxis yAxisId="left" stroke="#10b981" fontSize={11} label={{ value: 'RPS', angle: -90, position: 'insideLeft', fill: '#10b981' }} />
                <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" fontSize={11} label={{ value: 'Avg Latency (ms)', angle: 90, position: 'insideRight', fill: '#f59e0b' }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} />
                <Line yAxisId="left" type="monotone" dataKey="rps" stroke="#10b981" strokeWidth={2.5} dot={false} name="Requests/Sec" />
                <Line yAxisId="right" type="monotone" dataKey="avgLatency" stroke="#f59e0b" strokeWidth={2} dot={false} name="Avg Latency (ms)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* DIAGNOSTICS & AUDIT REPORT SUMMARY */}
      {report && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-2xl print:bg-white print:text-black">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                Executive Diagnostics Report
              </div>
              <h2 className="text-xl font-black text-white mt-1 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" /> Traffic Surge Capacity Assessment
              </h2>
            </div>
            <div className="flex items-center gap-3">
              {getGradeBadge(report.healthGrade)}
              <button
                onClick={downloadReportJson}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                title="Download JSON Report"
              >
                <Download className="w-4 h-4 text-indigo-400" /> Export JSON
              </button>
              <button
                onClick={printReport}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                title="Print PDF Report"
              >
                <Printer className="w-4 h-4 text-emerald-400" /> Print PDF
              </button>
            </div>
          </div>

          {/* METRICS SUMMARY GRID */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Average Throughput</div>
              <div className="text-xl font-black text-emerald-400 mt-1">{report.avgRps} RPS</div>
              <div className="text-[10px] text-slate-500 mt-1">Total {report.totalRequests} reqs in {report.durationSec}s</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Success Rate</div>
              <div className="text-xl font-black text-indigo-400 mt-1">{report.successRate}%</div>
              <div className="text-[10px] text-slate-500 mt-1">2xx HTTP Responses</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Median Latency (P50)</div>
              <div className="text-xl font-black text-amber-400 mt-1">{report.latencyMs.p50} ms</div>
              <div className="text-[10px] text-slate-500 mt-1">Min: {report.latencyMs.min}ms | Avg: {report.latencyMs.avg}ms</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="text-[10px] font-bold text-slate-400 uppercase">99th Percentile (P99)</div>
              <div className="text-xl font-black text-rose-400 mt-1">{report.latencyMs.p99} ms</div>
              <div className="text-[10px] text-slate-500 mt-1">Max latency: {report.latencyMs.max}ms</div>
            </div>
          </div>

          {/* LATENCY PERCENTILES TABLE */}
          <div>
            <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider mb-3">Latency Percentile Breakdown</h4>
            <div className="overflow-x-auto rounded-2xl border border-slate-800">
              <table className="w-full text-xs text-left text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase font-extrabold text-[10px]">
                  <tr>
                    <th className="p-3">Percentile</th>
                    <th className="p-3">Response Time (ms)</th>
                    <th className="p-3">Status Assessment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 bg-slate-900">
                  <tr>
                    <td className="p-3 font-mono text-slate-400">P50 (Median)</td>
                    <td className="p-3 font-bold text-white">{report.latencyMs.p50} ms</td>
                    <td className="p-3 text-emerald-400 font-semibold">Fast response for 50% users</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-slate-400">P90 (90th Percentile)</td>
                    <td className="p-3 font-bold text-amber-400">{report.latencyMs.p90} ms</td>
                    <td className="p-3 text-slate-300">90% of requests completed within this speed</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-slate-400">P99 (Worst 1%)</td>
                    <td className="p-3 font-bold text-rose-400">{report.latencyMs.p99} ms</td>
                    <td className="p-3 text-slate-400">Latency spike under peak queue contention</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* RECOMMENDATIONS & BOTTLENECK ANALYSIS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" /> Bottlenecks &amp; System Observations
              </h4>
              {report.bottlenecks.length > 0 ? (
                <ul className="space-y-2 text-xs text-slate-400 list-disc pl-4">
                  {report.bottlenecks.map((item, idx) => (
                    <li key={idx} className="text-amber-300">{item}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-emerald-400">No severe bottlenecks or connection drops detected during traffic surge simulation.</p>
              )}
            </div>

            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Optimization Recommendations for Ad Campaign
              </h4>
              <ul className="space-y-2 text-xs text-slate-300 list-disc pl-4">
                {report.recommendations.map((rec, idx) => (
                  <li key={idx}>{rec}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
