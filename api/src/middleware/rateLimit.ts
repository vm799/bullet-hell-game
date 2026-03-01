/**
 * Rate Limiting Middleware
 */

import rateLimit, { RateLimitRequestHandler } from 'express-rate-limit';

const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000');

export const rateLimitMiddleware = (
  type: 'login' | 'api' = 'api'
): RateLimitRequestHandler => {
  const maxRequests =
    type === 'login'
      ? parseInt(process.env.RATE_LIMIT_LOGIN_MAX || '10')
      : parseInt(process.env.RATE_LIMIT_API_MAX || '100');

  return rateLimit({
    windowMs,
    max: maxRequests,
    message: `Too many ${type} requests, please try again later`,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
      // Use user ID if authenticated, otherwise use IP
      return req.userId || req.ip || 'unknown';
    },
  });
};
