import { DomainError, ERROR_CODE } from './domain.error.js'

export class ProjectNotFoundError extends DomainError {
  constructor(id: string) {
    super(`No se encontró un proyecto con el ID '${id}'.`, ERROR_CODE.PROJECT_NOT_FOUND)
  }
}
