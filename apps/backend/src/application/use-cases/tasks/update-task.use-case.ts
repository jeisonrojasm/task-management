import { TaskNotFoundError } from '../../../domain/errors/task-not-found.error.js'
import { isValidPriority } from '../../../domain/value-objects/priority.js'
import { DomainError, ERROR_CODE } from '../../../domain/errors/domain.error.js'
import { toTaskOutput, type UpdateTaskInput, type TaskOutput } from '../../dtos/task.dto.js'

import type { TaskRepository } from '../../../domain/repositories/task.repository.js'

export class UpdateTaskUseCase {
  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(input: { taskId: string } & UpdateTaskInput): Promise<TaskOutput> {
    if (input.title.trim().length === 0) {
      throw new DomainError('Task title cannot be empty.', ERROR_CODE.VALIDATION_ERROR)
    }

    const task = await this.taskRepository.findById(input.taskId)

    if (task === null) {
      throw new TaskNotFoundError(input.taskId)
    }

    if (!isValidPriority(input.priority)) {
      throw new DomainError(
        `Invalid priority value: '${input.priority}'.`,
        ERROR_CODE.VALIDATION_ERROR,
      )
    }

    const dueDate = input.dueDate !== null ? new Date(input.dueDate) : null

    const updated = await this.taskRepository.update(input.taskId, {
      title: input.title,
      description: input.description,
      priority: input.priority,
      dueDate,
    })

    return toTaskOutput(updated)
  }
}
