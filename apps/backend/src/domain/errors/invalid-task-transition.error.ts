import { DomainError } from './domain.error.js';
import type { TaskStatus } from '../value-objects/task-status.js';

export class InvalidTaskTransitionError extends DomainError {
  constructor(from: TaskStatus, to: TaskStatus) {
    super(
      `Cannot transition task from '${from}' to '${to}'.`,
      'INVALID_TASK_STATUS_TRANSITION',
    );
  }
}
