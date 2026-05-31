import type { Request, Response, NextFunction } from 'express'

export function correlationIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const incomingId = req.headers['x-correlation-id']
  const correlationId = typeof incomingId === 'string' ? incomingId : crypto.randomUUID()
  req.correlationId = correlationId
  res.setHeader('X-Correlation-ID', correlationId)
  next()
}
