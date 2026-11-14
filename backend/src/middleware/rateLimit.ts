import { Request, Response, NextFunction } from 'express';

type RateLimitOptions = { windowMs: number; max: number; keyPrefix: string };
type RateLimitEntry = { count: number; resetAt: number };
const buckets = new Map<string, RateLimitEntry>();

/** Lightweight per-process limits for sensitive routes; edge WAF is still needed for volumetric DDoS. */
export const rateLimit = ({ windowMs, max, keyPrefix }: RateLimitOptions) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const now = Date.now();
    const key = `${keyPrefix}:${req.ip || req.socket.remoteAddress || 'unknown'}`;
    let entry = buckets.get(key);
    if (!entry || entry.resetAt <= now) {
      entry = { count: 0, resetAt: now + windowMs };
      buckets.set(key, entry);
    }
    entry.count += 1;
    res.setHeader('RateLimit-Limit', String(max));
    res.setHeader('RateLimit-Remaining', String(Math.max(0, max - entry.count)));
    res.setHeader('RateLimit-Reset', String(Math.ceil(entry.resetAt / 1000)));
    if (entry.count > max) {
      res.setHeader('Retry-After', String(Math.max(1, Math.ceil((entry.resetAt - now) / 1000))));
      res.status(429).json({ message: 'Too many requests. Please wait a moment and try again.' });
      return;
    }
    if (buckets.size > 10_000) {
      for (const [bucketKey, bucket] of buckets) if (bucket.resetAt <= now) buckets.delete(bucketKey);
    }
    next();
  };
