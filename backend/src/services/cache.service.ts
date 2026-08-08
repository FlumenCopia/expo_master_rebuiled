/**
 * In-Memory Simple TTL Cache Service
 * Protects PostgreSQL database connection pool from being overwhelmed
 * during massive public traffic spikes (e.g. Ad campaign traffic surges).
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

class InMemoryCache {
  private cache = new Map<string, CacheEntry<any>>();

  /**
   * Retrieves item from cache if present and not expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.value as T;
  }

  /**
   * Stores item in cache with Time-To-Live in seconds
   */
  set<T>(key: string, value: T, ttlSeconds: number = 30): void {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.cache.set(key, { value, expiresAt });
  }

  /**
   * Invalidate specific key or clear all cache
   */
  invalidate(keyPattern?: string): void {
    if (!keyPattern) {
      this.cache.clear();
      return;
    }
    for (const key of this.cache.keys()) {
      if (key.includes(keyPattern)) {
        this.cache.delete(key);
      }
    }
  }
}

export const memoryCache = new InMemoryCache();
