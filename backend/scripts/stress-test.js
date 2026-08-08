/**
 * CLI Load Capacity & Traffic Surge Stress Test Utility
 * Simulates high-concurrency ad traffic bursts against the Expo backend API.
 * 
 * Usage:
 *   node scripts/stress-test.js [targetPath] [concurrency] [totalRequests]
 * 
 * Example:
 *   node scripts/stress-test.js /api/health 50 1000
 *   node scripts/stress-test.js /api/dev/system-metrics 100 2000
 */

const fs = require('fs');
const path = require('path');

async function runCliStressTest() {
  const targetPath = process.argv[2] || '/api/health';
  const concurrency = parseInt(process.argv[3] || '50', 10);
  const totalRequests = parseInt(process.argv[4] || '1000', 10);

  const port = process.env.PORT || 5000;
  const baseUrl = `http://localhost:${port}`;
  const fullUrl = targetPath.startsWith('http') ? targetPath : `${baseUrl}${targetPath.startsWith('/') ? '' : '/'}${targetPath}`;

  console.log(`\n==================================================`);
  console.log(`🚀 EXPO26 AD TRAFFIC SURGE STRESS TESTER`);
  console.log(`==================================================`);
  console.log(`Target URL        : ${fullUrl}`);
  console.log(`Concurrent Workers: ${concurrency}`);
  console.log(`Total Requests    : ${totalRequests}`);
  console.log(`Starting load simulation...\n`);

  const latencies = [];
  const statusCounts = {};
  let completed = 0;
  let errorCount = 0;

  const startTime = Date.now();

  const runWorker = async (workerId) => {
    while (completed < totalRequests) {
      completed++;
      const reqStart = Date.now();
      try {
        const res = await fetch(fullUrl, {
          headers: {
            'User-Agent': 'Expo26-CLI-LoadTester/1.0',
            'x-dev-load-test': 'enabled',
          },
        });
        const duration = Date.now() - reqStart;
        latencies.push(duration);
        const code = res.status.toString();
        statusCounts[code] = (statusCounts[code] || 0) + 1;
      } catch (err) {
        const duration = Date.now() - reqStart;
        latencies.push(duration);
        errorCount++;
        statusCounts['ERR_500'] = (statusCounts['ERR_500'] || 0) + 1;
      }

      if (completed % Math.max(1, Math.floor(totalRequests / 10)) === 0) {
        const progress = Math.min(100, Math.floor((completed / totalRequests) * 100));
        process.stdout.write(` Progress: [${'=' .repeat(progress / 5)}${' '.repeat(20 - progress / 5)}] ${progress}%\r`);
      }
    }
  };

  const workers = Array.from({ length: concurrency }, (_, i) => runWorker(i));
  await Promise.all(workers);

  const endTime = Date.now();
  const totalDurationSec = Math.max(0.001, (endTime - startTime) / 1000);
  const rps = (totalRequests / totalDurationSec).toFixed(2);

  latencies.sort((a, b) => a - b);
  const minLatency = latencies[0] || 0;
  const maxLatency = latencies[latencies.length - 1] || 0;
  const avgLatency = Math.round(latencies.reduce((a, b) => a + b, 0) / (latencies.length || 1));
  const p50 = latencies[Math.floor(latencies.length * 0.5)] || 0;
  const p90 = latencies[Math.floor(latencies.length * 0.9)] || 0;
  const p99 = latencies[Math.floor(latencies.length * 0.99)] || 0;

  const successCount = Object.entries(statusCounts)
    .filter(([code]) => code.startsWith('2'))
    .reduce((sum, [, count]) => sum + count, 0);
  const successRate = ((successCount / totalRequests) * 100).toFixed(1);

  console.log(`\n\n==================================================`);
  console.log(`📊 STRESS TEST PERFORMANCE REPORT`);
  console.log(`==================================================`);
  console.log(`Total Requests Processed : ${totalRequests}`);
  console.log(`Total Execution Time     : ${totalDurationSec.toFixed(2)}s`);
  console.log(`Throughput (RPS)         : ${rps} req/sec`);
  console.log(`Success Rate             : ${successRate}% (${successCount}/${totalRequests})`);
  console.log(`--------------------------------------------------`);
  console.log(`Latency Breakdown (ms):`);
  console.log(`  Min Latency            : ${minLatency} ms`);
  console.log(`  Avg Latency            : ${avgLatency} ms`);
  console.log(`  P50 (Median)           : ${p50} ms`);
  console.log(`  P90 (90th Percentile)  : ${p90} ms`);
  console.log(`  P99 (99th Percentile)  : ${p99} ms`);
  console.log(`  Max Latency            : ${maxLatency} ms`);
  console.log(`--------------------------------------------------`);
  console.log(`HTTP Status Breakdown    :`, statusCounts);
  console.log(`==================================================\n`);

  // Diagnostics & Capacity Assessment
  let capacityStatus = 'SUCCESS - HIGH CAPACITY';
  if (parseFloat(successRate) < 95) {
    capacityStatus = 'FAILED - HIGH ERROR RATE DETECTED';
  } else if (p90 > 1000) {
    capacityStatus = 'WARNING - HIGH LATENCY UNDER SURGE';
  }

  const reportData = {
    testDate: new Date().toISOString(),
    targetUrl: fullUrl,
    concurrency,
    totalRequests,
    executionTimeSec: totalDurationSec,
    requestsPerSecond: parseFloat(rps),
    successRatePercent: parseFloat(successRate),
    capacityAssessment: capacityStatus,
    latencyMs: { min: minLatency, avg: avgLatency, p50, p90, p99, max: maxLatency },
    statusCounts,
  };

  const reportsDir = path.join(__dirname, 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const reportFileName = `load-test-report-${Date.now()}.json`;
  const reportPath = path.join(reportsDir, reportFileName);
  fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));

  console.log(`💾 Report saved to: ${reportPath}\n`);
}

runCliStressTest().catch(console.error);
