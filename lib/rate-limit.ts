/**
 * Lightweight in-process rate limiter (sliding window, per IP).
 * Works across serverless invocations only within the same cold-start instance.
 * For true cross-instance limiting, swap the Map for Redis.
 */

interface Window {
  count: number
  resetAt: number
}

const store = new Map<string, Window>()

export interface RateLimitOptions {
  /** Max requests in the window */
  limit: number
  /** Window size in seconds */
  windowSec: number
}

/**
 * Returns null if allowed, or an object with the retry-after seconds if blocked.
 */
export function checkRateLimit(
  key: string,
  { limit, windowSec }: RateLimitOptions
): { retryAfter: number } | null {
  const now = Date.now()
  const w = store.get(key)

  if (!w || now >= w.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowSec * 1000 })
    return null
  }

  if (w.count >= limit) {
    return { retryAfter: Math.ceil((w.resetAt - now) / 1000) }
  }

  w.count++
  return null
}

/**
 * Extract the best client IP from Next.js request headers.
 */
export function getClientIp(headers: Headers): string {
  return (
    headers.get('x-forwarded-for')?.split(',')[0].trim() || headers.get('x-real-ip') || 'unknown'
  )
}

// Pre-configured limiters for each route class
export const LIMITS = {
  predict: { limit: 20, windowSec: 60 }, // 20 req/min
  paymentCreate: { limit: 5, windowSec: 60 }, // 5 orders/min
  paymentVerify: { limit: 10, windowSec: 60 }, // 10 verifies/min
  auth: { limit: 10, windowSec: 60 }, // 10 login attempts/min
} satisfies Record<string, RateLimitOptions>
