import { DomainError, ERROR_CODE } from './domain.error.js'

export class ProjectArchivedError extends DomainError {
  constructor(id: string) {
    super(
      `El proyecto '${id}' está archivado y no puede recibir nuevas tareas.`,
      ERROR_CODE.PROJECT_ARCHIVED,
    )
  }
}
