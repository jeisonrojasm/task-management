import { logger } from '../../../infrastructure/config/logger.js'

import type { Request, Response, NextFunction } from 'express'

export function requestLoggerMiddleware(req: Request, res: Response, next: NextFunction): void {
  const start = process.hrtime.bigint()

  logger.info(
    { correlationId: req.correlationId, method: req.method, path: req.path },
    'Request received',
  )

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - start) / 1_000_000
    const { statusCode } = res
    const logData = {
      correlationId: req.correlationId,
      method: req.method,
      path: req.path,
      statusCode,
      durationMs,
    }

    if (statusCode >= 500) {
      logger.error(logData, 'Request completed')
    } else if (statusCode >= 400) {
      logger.warn(logData, 'Request completed')
    } else {
      logger.info(logData, 'Request completed')
    }
  })

  next()
}
