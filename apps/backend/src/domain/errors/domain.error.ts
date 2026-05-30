export const ERROR_CODE = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  PROJECT_NOT_FOUND: 'PROJECT_NOT_FOUND',
  TASK_NOT_FOUND: 'TASK_NOT_FOUND',
  INVALID_TASK_STATUS_TRANSITION: 'INVALID_TASK_STATUS_TRANSITION',
  PROJECT_ARCHIVED: 'PROJECT_ARCHIVED',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
} as const

export type ErrorCode = (typeof ERROR_CODE)[keyof typeof ERROR_CODE]

export class DomainError extends Error {
  public readonly code: ErrorCode

  constructor(message: string, code: ErrorCode) {
    super(message)
    this.code = code
    this.name = 'DomainError'
  }
}
