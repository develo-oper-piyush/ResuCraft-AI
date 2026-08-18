interface RateLimitRecord {
  timestamps: number[];
}

class SecurityGuardManager {
  private ipRecords = new Map<string, RateLimitRecord>();

  /**
   * Sliding window rate limiter: Allows maxRequests per windowMs
   */
  public checkRateLimit(ip: string, maxRequests: number = 15, windowMs: number = 60000): { allowed: boolean; remaining: number } {
    const now = Date.now();
    const record = this.ipRecords.get(ip) || { timestamps: [] };

    // Filter timestamps within window
    const validTimestamps = record.timestamps.filter((ts) => now - ts < windowMs);

    if (validTimestamps.length >= maxRequests) {
      return { allowed: false, remaining: 0 };
    }

    validTimestamps.push(now);
    this.ipRecords.set(ip, { timestamps: validTimestamps });

    return {
      allowed: true,
      remaining: maxRequests - validTimestamps.length,
    };
  }

  /**
   * Sanitizes prompt input to prevent prompt injection and oversized payloads
   */
  public sanitizePrompt(input: string, maxChars: number = 6000): string {
    if (!input) return '';

    let cleaned = input.slice(0, maxChars);

    // Neutralize prompt injection attempts
    const injectionPatterns = [
      /ignore\s+previous\s+instructions/gi,
      /disregard\s+all\s+prior/gi,
      /system\s+prompt:/gi,
      /reveal\s+internal\s+key/gi,
      /override\s+system\s+rules/gi,
    ];

    injectionPatterns.forEach((pattern) => {
      cleaned = cleaned.replace(pattern, '[FILTERED_SECURITY_GUARD]');
    });

    return cleaned.trim();
  }
}

export const securityGuard = new SecurityGuardManager();
