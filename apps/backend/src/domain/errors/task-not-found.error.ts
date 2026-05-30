import { DomainError } from './domain.error.js';

export class TaskNotFoundError extends DomainError {
  constructor(id: string) {
    super(`Task with id '${id}' was not found.`, 'TASK_NOT_FOUND');
  }
}
