import { Injectable } from '@nestjs/common';
import { resolveAuthEnvironment } from '../environment.js';

export type LoginRateLimitPolicy = Readonly<{
  limit: number;
  windowMs: number;
}>;

@Injectable()
export class LoginRateLimiterService {
  private readonly attempts = new Map<string, number[]>();
  private readonly policy: LoginRateLimitPolicy;

  constructor(policy: LoginRateLimitPolicy = {
    limit: resolveAuthEnvironment().loginAttemptLimit,
    windowMs: resolveAuthEnvironment().loginAttemptWindowSeconds * 1000,
  }) {
    this.policy = policy;
  }

  consume(key: string, now = Date.now()): boolean {
    const earliest = now - this.policy.windowMs;
    const current = (this.attempts.get(key) ?? []).filter((attempt) => attempt > earliest);
    if (current.length >= this.policy.limit) {
      this.attempts.set(key, current);
      return false;
    }
    current.push(now);
    this.attempts.set(key, current);
    return true;
  }

  reset(key: string): void {
    this.attempts.delete(key);
  }
}
