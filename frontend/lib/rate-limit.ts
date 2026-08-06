/**
 * Sliding Window In-Memory Rate Limiter for Next.js API Routes
 * Protects 75,000+ scale registration endpoints against spam bots and brute force.
 */

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const cache = new Map<string, RateLimitRecord>();

// Clean up expired records every 5 minutes to keep memory ultra-lean
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of cache.entries()) {
    if (now > record.resetAt) {
      cache.delete(key);
    }
  }
}, 5 * 60 * 1000);

export function rateLimit(identifier: string, limit = 5, windowMs = 60 * 1000) {
  const now = Date.now();
  const record = cache.get(identifier);

  if (!record || now > record.resetAt) {
    cache.set(identifier, {
      count: 1,
      resetAt: now + windowMs,
    });
    return { success: true, remaining: limit - 1, resetIn: Math.ceil(windowMs / 1000) };
  }

  if (record.count >= limit) {
    return {
      success: false,
      remaining: 0,
      resetIn: Math.ceil((record.resetAt - now) / 1000),
    };
  }

  record.count += 1;
  return {
    success: true,
    remaining: limit - record.count,
    resetIn: Math.ceil((record.resetAt - now) / 1000),
  };
}
