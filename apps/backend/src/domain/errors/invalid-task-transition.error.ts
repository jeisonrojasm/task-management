import { DomainError, ERROR_CODE } from './domain.error.js'

import type { TaskStatus } from '../value-objects/task-status.js'

export class InvalidTaskTransitionError extends DomainError {
  constructor(from: TaskStatus, to: TaskStatus) {
    super(
      `No es posible cambiar el estado de la tarea de '${from}' a '${to}'.`,
      ERROR_CODE.INVALID_TASK_STATUS_TRANSITION,
    )
  }
}
