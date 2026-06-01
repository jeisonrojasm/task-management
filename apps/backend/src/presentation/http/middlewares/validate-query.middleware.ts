import { DomainError, ERROR_CODE } from '../../../domain/errors/domain.error.js'

import type { Request, Response, NextFunction } from 'express'
import type { ZodSchema } from 'zod'

export function validateQuery<T>(schema: ZodSchema<T>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query)
    if (!result.success) {
      const details: Record<string, string[]> = {}
      for (const issue of result.error.issues) {
        const path = issue.path.map(String).join('.')
        if (path === '') {
          continue
        }
        const existing = details[path]
        if (existing !== undefined) {
          existing.push(issue.message)
        } else {
          details[path] = [issue.message]
        }
      }
      next(new DomainError('Validation failed.', ERROR_CODE.VALIDATION_ERROR, details))
      return
    }
    // Zod may coerce string query params (e.g. page→number), which Express types don't reflect.
    req.query = result.data as unknown as Request['query']
    next()
  }
}
