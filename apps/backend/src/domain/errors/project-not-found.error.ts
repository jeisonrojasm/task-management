import { DomainError } from './domain.error.js';

export class ProjectNotFoundError extends DomainError {
  constructor(id: string) {
    super(`Project with id '${id}' was not found.`, 'PROJECT_NOT_FOUND');
  }
}
