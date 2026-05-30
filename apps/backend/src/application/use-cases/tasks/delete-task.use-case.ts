import { TaskNotFoundError } from '../../../domain/errors/task-not-found.error.js'

import type { TaskRepository } from '../../../domain/repositories/task.repository.js'

export class DeleteTaskUseCase {
  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(input: { taskId: string }): Promise<void> {
    const task = await this.taskRepository.findById(input.taskId)

    if (task === null) {
      throw new TaskNotFoundError(input.taskId)
    }

    await this.taskRepository.delete(input.taskId)
  }
}
