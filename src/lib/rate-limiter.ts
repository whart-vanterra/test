import { NextRequest } from 'next/server';

interface RateLimitConfig {
  windowMs: number;
  max: number;
  message: string;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting (in production, use Redis)
const rateLimitStore = new Map<string, RateLimitEntry>();

export class RateLimiter {
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  async check(request: NextRequest, key?: string): Promise<{ allowed: boolean; remaining: number; resetTime: number; message?: string }> {
    const identifier = key || this.getIdentifier(request);
    const now = Date.now();
    const windowMs = this.config.windowMs;
    
    // Clean up expired entries
    this.cleanup();
    
    const entry = rateLimitStore.get(identifier);
    
    if (!entry) {
      // First request
      rateLimitStore.set(identifier, {
        count: 1,
        resetTime: now + windowMs,
      });
      
      return {
        allowed: true,
        remaining: this.config.max - 1,
        resetTime: now + windowMs,
      };
    }
    
    if (now > entry.resetTime) {
      // Window expired, reset
      rateLimitStore.set(identifier, {
        count: 1,
        resetTime: now + windowMs,
      });
      
      return {
        allowed: true,
        remaining: this.config.max - 1,
        resetTime: now + windowMs,
      };
    }
    
    if (entry.count >= this.config.max) {
      // Rate limit exceeded
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
        message: this.config.message,
      };
    }
    
    // Increment counter
    entry.count++;
    rateLimitStore.set(identifier, entry);
    
    return {
      allowed: true,
      remaining: this.config.max - entry.count,
      resetTime: entry.resetTime,
    };
  }

  private getIdentifier(request: NextRequest): string {
    // Use IP address as default identifier
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : request.ip || 'unknown';
    
    // For admin routes, also include user agent to make it more specific
    const userAgent = request.headers.get('user-agent') || '';
    const pathname = new URL(request.url).pathname;
    
    return `${ip}-${userAgent.slice(0, 50)}-${pathname}`;
  }

  private cleanup(): void {
    const now = Date.now();
    
    for (const [key, entry] of rateLimitStore.entries()) {
      if (now > entry.resetTime) {
        rateLimitStore.delete(key);
      }
    }
  }
}

// Pre-configured rate limiters
export const reviewSubmissionRateLimit = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 requests per minute
  message: 'Too many review submissions. Please try again later.',
});

export const adminApiRateLimit = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: 'Too many API requests. Please try again later.',
});

export const loginRateLimit = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 login attempts per 15 minutes
  message: 'Too many login attempts. Please try again later.',
});

export const passwordResetRateLimit = new RateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 password reset requests per hour
  message: 'Too many password reset requests. Please try again later.',
});

// Middleware function for rate limiting
export async function rateLimitMiddleware(
  request: NextRequest,
  rateLimiter: RateLimiter,
  key?: string
): Promise<Response | null> {
  const result = await rateLimiter.check(request, key);
  
  if (!result.allowed) {
    return new Response(
      JSON.stringify({
        success: false,
        error: result.message || 'Rate limit exceeded',
        retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': rateLimiter['config'].max.toString(),
          'X-RateLimit-Remaining': result.remaining.toString(),
          'X-RateLimit-Reset': new Date(result.resetTime).toISOString(),
          'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString(),
        },
      }
    );
  }
  
  return null; // Allow request to proceed
}
