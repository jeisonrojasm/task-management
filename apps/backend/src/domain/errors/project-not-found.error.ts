import { DomainError, ERROR_CODE } from './domain.error.js'

export class ProjectNotFoundError extends DomainError {
  constructor(id: string) {
    super(`Project with id '${id}' was not found.`, ERROR_CODE.PROJECT_NOT_FOUND)
  }
}
