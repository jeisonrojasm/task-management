import { DomainError, ERROR_CODE, type ErrorCode } from '../../../domain/errors/domain.error.js'
import { logger } from '../../../infrastructure/config/logger.js'

import type { Request, Response, NextFunction } from 'express'

const HTTP_STATUS_MAP: Partial<Record<ErrorCode, number>> = {
  [ERROR_CODE.VALIDATION_ERROR]: 400,
  [ERROR_CODE.PROJECT_NOT_FOUND]: 404,
  [ERROR_CODE.TASK_NOT_FOUND]: 404,
  [ERROR_CODE.INVALID_TASK_STATUS_TRANSITION]: 422,
  [ERROR_CODE.PROJECT_ARCHIVED]: 422,
}

export function errorHandlerMiddleware(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const correlationId = req.correlationId

  if (err instanceof DomainError) {
    const statusCode = HTTP_STATUS_MAP[err.code] ?? 400
    logger.warn({ correlationId, errorCode: err.code, message: err.message })
    res.status(statusCode).json({
      error: { code: err.code, message: err.message, details: err.details },
    })
    return
  }

  if (err instanceof SyntaxError) {
    logger.warn({ correlationId, errorCode: 'INVALID_JSON', message: err.message })
    res.status(400).json({
      error: { code: 'INVALID_JSON', message: 'Invalid JSON in request body.', details: null },
    })
    return
  }

  const isProduction = process.env['NODE_ENV'] === 'production'
  const logData: Record<string, unknown> = { correlationId }
  if (!isProduction && err instanceof Error) {
    logData['stack'] = err.stack
  }
  logger.error(logData, 'Unexpected error')

  res.status(500).json({
    error: {
      code: ERROR_CODE.INTERNAL_SERVER_ERROR,
      message: 'An unexpected error occurred.',
      details: null,
    },
  })
}
