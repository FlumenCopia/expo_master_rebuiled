import { Request, Response, NextFunction } from 'express';

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const cache = new Map<string, RateLimitRecord>();

setInterval(() => {
  const now = Date.now();
  for (const [key, record] of cache.entries()) {
    if (now > record.resetAt) cache.delete(key);
  }
}, 5 * 60 * 1000);

export function createRateLimiter(limit = 500, windowMs = 60 * 1000, customMessage?: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const rawIp = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const ip = rawIp.split(',')[0].trim();
    const key = `${req.path}-${ip}`;
    const now = Date.now();
    const record = cache.get(key);

    if (!record || now > record.resetAt) {
      cache.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (record.count >= limit) {
      const retryAfterSec = Math.ceil((record.resetAt - now) / 1000);
      res.setHeader('Retry-After', retryAfterSec);
      res.status(429).json({
        error: customMessage || `Too many requests. Please wait ${Math.ceil(windowMs / 60000)} minute(s) before trying again.`,
      });
      return;
    }

    record.count += 1;
    next();
  };
}

// Tailored Security Limiters
export const authLimiter = createRateLimiter(
  5,
  15 * 60 * 1000,
  'Too many failed login attempts. Account temporarily locked for 15 minutes.'
);

export const gateLimiter = createRateLimiter(
  60,
  60 * 1000,
  'Gate scanning rate limit exceeded. Please slow down QR code scanning.'
);

export const registrationLimiter = createRateLimiter(
  5,
  60 * 1000,
  'Registration rate limit exceeded. Please wait 1 minute before submitting again.'
);

