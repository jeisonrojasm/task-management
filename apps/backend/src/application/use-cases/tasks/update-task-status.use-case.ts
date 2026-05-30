import { TaskNotFoundError } from '../../../domain/errors/task-not-found.error.js'
import { InvalidTaskTransitionError } from '../../../domain/errors/invalid-task-transition.error.js'
import { canTransitionTo } from '../../../domain/entities/task.entity.js'
import { isValidTaskStatus } from '../../../domain/value-objects/task-status.js'
import { DomainError, ERROR_CODE } from '../../../domain/errors/domain.error.js'
import { toTaskOutput, type UpdateTaskStatusInput, type TaskOutput } from '../../dtos/task.dto.js'

import type { TaskRepository } from '../../../domain/repositories/task.repository.js'

export class UpdateTaskStatusUseCase {
  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(input: UpdateTaskStatusInput): Promise<TaskOutput> {
    const task = await this.taskRepository.findById(input.taskId)

    if (task === null) {
      throw new TaskNotFoundError(input.taskId)
    }

    if (!isValidTaskStatus(input.newStatus)) {
      throw new DomainError(
        `Invalid task status: '${input.newStatus}'.`,
        ERROR_CODE.VALIDATION_ERROR,
      )
    }

    const newStatus = input.newStatus

    if (!canTransitionTo(task.status, newStatus)) {
      throw new InvalidTaskTransitionError(task.status, newStatus)
    }

    const updated = await this.taskRepository.updateStatus(input.taskId, newStatus)

    return toTaskOutput(updated)
  }
}
