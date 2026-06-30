const rateLimits = new Map();

export function checkRateLimit(userId, action, maxRequests = 10, windowMs = 60000) {
  const key = `${userId}:${action}`;
  const now = Date.now();
  
  if (!rateLimits.has(key)) {
    rateLimits.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1 };
  }
  
  const limit = rateLimits.get(key);
  
  if (now > limit.resetAt) {
    rateLimits.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1 };
  }
  
  if (limit.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetAt: limit.resetAt };
  }
  
  limit.count++;
  return { allowed: true, remaining: maxRequests - limit.count, resetAt: limit.resetAt };
}

export function getRateLimitInfo(userId, action) {
  const key = `${userId}:${action}`;
  return rateLimits.get(key) || null;
}