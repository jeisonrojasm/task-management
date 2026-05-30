import { DomainError, ERROR_CODE } from './domain.error.js'

export class TaskNotFoundError extends DomainError {
  constructor(id: string) {
    super(`No se encontró una tarea con el ID '${id}'.`, ERROR_CODE.TASK_NOT_FOUND)
  }
}
