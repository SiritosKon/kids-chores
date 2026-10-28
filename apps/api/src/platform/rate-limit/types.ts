export type RateLimitBucket = 'ip' | 'auth' | 'session';

export interface RateLimit {
  limit: number;
  windowSeconds: number;
}

export interface RateLimitCheck {
  bucket: RateLimitBucket;
  subject: string;
}
