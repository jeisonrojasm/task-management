import { DomainError } from './domain.error.js';

export class ProjectArchivedError extends DomainError {
  constructor(id: string) {
    super(
      `Project '${id}' is archived and cannot accept new tasks.`,
      'PROJECT_ARCHIVED',
    );
  }
}
