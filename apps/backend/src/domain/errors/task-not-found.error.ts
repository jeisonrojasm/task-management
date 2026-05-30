import { DomainError, ERROR_CODE } from './domain.error.js'

export class TaskNotFoundError extends DomainError {
  constructor(id: string) {
    super(`Task with id '${id}' was not found.`, ERROR_CODE.TASK_NOT_FOUND)
  }
}
