import rateLimit from 'express-rate-limit'

const isDevelopment = process.env['NODE_ENV'] !== 'production'

const windowMs = parseInt(process.env['RATE_LIMIT_WINDOW_MS'] ?? '900000', 10)

const rateLimitMessage = (code: string) => ({
  error: {
    code,
    message: 'Too many requests. Please try again later.',
    details: null,
  },
})

export const globalRateLimiter = rateLimit({
  windowMs,
  limit: parseInt(process.env['RATE_LIMIT_MAX_GLOBAL'] ?? (isDevelopment ? '1000' : '200'), 10),
  message: rateLimitMessage('RATE_LIMIT_EXCEEDED'),
  standardHeaders: true,
  legacyHeaders: false,
})

export const writeLimiter = rateLimit({
  windowMs,
  limit: parseInt(process.env['RATE_LIMIT_MAX_WRITE'] ?? (isDevelopment ? '100' : '50'), 10),
  message: rateLimitMessage('RATE_LIMIT_EXCEEDED'),
  standardHeaders: true,
  legacyHeaders: false,
})
