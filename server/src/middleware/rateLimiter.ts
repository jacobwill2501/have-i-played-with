interface RateBucket {
  limit: number;
  windowMs: number;
  tokens: number;
  lastRefill: number;
}

interface QueuedRequest {
  resolve: () => void;
}

class RiotRateLimiter {
  private buckets: RateBucket[];
  private queue: QueuedRequest[] = [];
  private processing = false;
  private retryAfterMs = 0;
  private retryAfterExpires = 0;

  constructor() {
    this.buckets = [
      { limit: 20, windowMs: 1000, tokens: 20, lastRefill: Date.now() },
      { limit: 100, windowMs: 120_000, tokens: 100, lastRefill: Date.now() },
    ];
  }

  private refillBuckets(): void {
    const now = Date.now();
    for (const bucket of this.buckets) {
      const elapsed = now - bucket.lastRefill;
      if (elapsed >= bucket.windowMs) {
        bucket.tokens = bucket.limit;
        bucket.lastRefill = now;
      }
    }
  }

  private canAcquire(): boolean {
    if (Date.now() < this.retryAfterExpires) return false;
    this.refillBuckets();
    return this.buckets.every((b) => b.tokens > 0);
  }

  private acquire(): void {
    for (const bucket of this.buckets) {
      bucket.tokens--;
    }
  }

  async waitForToken(): Promise<void> {
    return new Promise<void>((resolve) => {
      this.queue.push({ resolve });
      this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    if (this.processing) return;
    this.processing = true;

    while (this.queue.length > 0) {
      if (this.canAcquire()) {
        this.acquire();
        const next = this.queue.shift();
        next?.resolve();
      } else {
        const waitTime = this.getWaitTime();
        await this.sleep(waitTime);
      }
    }

    this.processing = false;
  }

  private getWaitTime(): number {
    const now = Date.now();
    if (now < this.retryAfterExpires) {
      return this.retryAfterExpires - now;
    }

    let minWait = Infinity;
    for (const bucket of this.buckets) {
      if (bucket.tokens <= 0) {
        const wait = bucket.windowMs - (now - bucket.lastRefill);
        minWait = Math.min(minWait, Math.max(wait, 50));
      }
    }
    return minWait === Infinity ? 50 : minWait;
  }

  handleResponseHeaders(headers: Headers): void {
    const retryAfter = headers.get("retry-after");
    if (retryAfter) {
      this.retryAfterMs = parseInt(retryAfter, 10) * 1000;
      this.retryAfterExpires = Date.now() + this.retryAfterMs;
      console.log(`[RateLimiter] Retry-After received: ${retryAfter}s`);
    }

    const rateLimitCount = headers.get("x-app-rate-limit-count");
    if (rateLimitCount) {
      const counts = rateLimitCount.split(",");
      for (let i = 0; i < counts.length && i < this.buckets.length; i++) {
        const [count] = counts[i].split(":").map(Number);
        const bucket = this.buckets[i];
        bucket.tokens = Math.max(0, bucket.limit - count);
      }
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export const rateLimiter = new RiotRateLimiter();
