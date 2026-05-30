import { TaskNotFoundError } from '../../../domain/errors/task-not-found.error.js'
import { toTaskOutput, type TaskOutput } from '../../dtos/task.dto.js'

import type { TaskRepository } from '../../../domain/repositories/task.repository.js'

export class GetTaskUseCase {
  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(input: { taskId: string }): Promise<TaskOutput> {
    const task = await this.taskRepository.findById(input.taskId)

    if (task === null) {
      throw new TaskNotFoundError(input.taskId)
    }

    return toTaskOutput(task)
  }
}
