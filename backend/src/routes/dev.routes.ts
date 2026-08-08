import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { authenticateJWT, requireRoles } from '../middleware/auth';
import http from 'http';
import https from 'https';

const router = Router();

// Middleware to ensure load test runner is only executable in dev or by authorized Super Admin in production
const devOnlyGuard = (req: Request, res: Response, next: NextFunction) => {
  const isDev = process.env.NODE_ENV !== 'production';
  if (isDev) {
    return next();
  }
  // In production, strictly require Super Admin JWT authentication
  return authenticateJWT(req, res, () => {
    requireRoles('SUPER_ADMIN')(req, res, next);
  });
};

router.use(devOnlyGuard);

/**
 * GET /api/dev/system-metrics
 * System process health and database responsiveness metrics
 */
router.get('/system-metrics', async (req: Request, res: Response) => {
  const mem = process.memoryUsage();
  const startTime = Date.now();
  let dbLatencyMs = -1;
  let dbConnected = false;

  try {
    await prisma.$queryRaw`SELECT 1`;
    dbLatencyMs = Date.now() - startTime;
    dbConnected = true;
  } catch (err: any) {
    dbConnected = false;
  }

  res.json({
    status: 'ok',
    uptimeSeconds: Math.floor(process.uptime()),
    memory: {
      rssMb: (mem.rss / 1024 / 1024).toFixed(2),
      heapTotalMb: (mem.heapTotal / 1024 / 1024).toFixed(2),
      heapUsedMb: (mem.heapUsed / 1024 / 1024).toFixed(2),
      externalMb: (mem.external / 1024 / 1024).toFixed(2),
    },
    database: {
      connected: dbConnected,
      latencyMs: dbLatencyMs,
    },
    timestamp: new Date().toISOString(),
  });
});

/**
 * POST /api/dev/load-test
 * Backend-orchestrated high-concurrency micro-benchmark runner
 */
router.post('/load-test', async (req: Request, res: Response) => {
  const {
    targetPath = '/api/health',
    method = 'GET',
    concurrency = 20,
    totalRequests = 200,
    payload = null,
  } = req.body;

  const validConcurrency = Math.min(500, Math.max(1, parseInt(String(concurrency), 10)));
  const validTotalRequests = Math.min(10000, Math.max(10, parseInt(String(totalRequests), 10)));
  const httpMethod = (method || 'GET').toUpperCase();

  const port = process.env.PORT || 5000;
  const baseUrl = `http://localhost:${port}`;
  const fullUrl = targetPath.startsWith('http') ? targetPath : `${baseUrl}${targetPath.startsWith('/') ? '' : '/'}${targetPath}`;

  const latencies: number[] = [];
  const statusCounts: Record<string, number> = {};
  let completed = 0;
  let errorCount = 0;

  const testStartTime = Date.now();
  const memBefore = process.memoryUsage().heapUsed;

  // Worker task queue runner
  const runWorker = async () => {
    while (completed < validTotalRequests) {
      completed++;
      const reqStart = Date.now();

      try {
        const response = await fetch(fullUrl, {
          method: httpMethod,
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Expo26-LoadTester-Bot/1.0',
          },
          ...(payload && httpMethod !== 'GET' ? { body: JSON.stringify(payload) } : {}),
        });

        const duration = Date.now() - reqStart;
        latencies.push(duration);
        const code = response.status.toString();
        statusCounts[code] = (statusCounts[code] || 0) + 1;
      } catch (err: any) {
        const duration = Date.now() - reqStart;
        latencies.push(duration);
        errorCount++;
        statusCounts['500_ERR'] = (statusCounts['500_ERR'] || 0) + 1;
      }
    }
  };

  // Run concurrency workers in parallel
  const workers = Array.from({ length: validConcurrency }, () => runWorker());
  await Promise.all(workers);

  const testEndTime = Date.now();
  const totalDurationMs = Math.max(1, testEndTime - testStartTime);
  const memAfter = process.memoryUsage().heapUsed;

  // Statistical calculations
  latencies.sort((a, b) => a - b);
  const minLatency = latencies[0] || 0;
  const maxLatency = latencies[latencies.length - 1] || 0;
  const avgLatency = latencies.length > 0 ? latencies.reduce((sum, l) => sum + l, 0) / latencies.length : 0;
  
  const p50Index = Math.floor(latencies.length * 0.5);
  const p90Index = Math.floor(latencies.length * 0.9);
  const p99Index = Math.floor(latencies.length * 0.99);

  const p50 = latencies[p50Index] || 0;
  const p90 = latencies[p90Index] || 0;
  const p99 = latencies[p99Index] || 0;

  const rps = (validTotalRequests / (totalDurationMs / 1000)).toFixed(2);
  const successCount = Object.entries(statusCounts)
    .filter(([code]) => code.startsWith('2'))
    .reduce((sum, [, count]) => sum + count, 0);
  const successRate = ((successCount / validTotalRequests) * 100).toFixed(1);

  // Diagnostic health evaluation
  let systemStatus: 'STABLE' | 'DEGRADED' | 'CRITICAL' = 'STABLE';
  const recommendations: string[] = [];

  if (parseFloat(successRate) < 95) {
    systemStatus = 'CRITICAL';
    recommendations.push('High failure rate detected. Check database connection pool limits or backend error logs.');
  } else if (p90 > 1000 || avgLatency > 500) {
    systemStatus = 'DEGRADED';
    recommendations.push('Average latency is above 500ms under load. Consider adding response caching or DB query indexing.');
  }

  if (statusCounts['429']) {
    recommendations.push(`Rate Limiting triggered (${statusCounts['429']} requests throttled). Increase rate limiter threshold for public ad campaigns if needed.`);
  }

  if (recommendations.length === 0) {
    recommendations.push('System responded with high throughput and low latency. Connection pool and event loop handled the surge well.');
  }

  res.json({
    summary: {
      targetUrl: fullUrl,
      method: httpMethod,
      concurrency: validConcurrency,
      totalRequests: validTotalRequests,
      durationMs: totalDurationMs,
      requestsPerSecond: parseFloat(rps),
      successRatePercent: parseFloat(successRate),
      systemStatus,
    },
    latencyMs: {
      min: minLatency,
      max: maxLatency,
      avg: Math.round(avgLatency),
      p50,
      p90,
      p99,
    },
    statusCounts,
    memoryDeltaMb: ((memAfter - memBefore) / 1024 / 1024).toFixed(2),
    recommendations,
    timestamp: new Date().toISOString(),
  });
});

export default router;
