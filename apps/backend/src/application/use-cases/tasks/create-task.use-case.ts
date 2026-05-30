import { ProjectNotFoundError } from '../../../domain/errors/project-not-found.error.js'
import { ProjectArchivedError } from '../../../domain/errors/project-archived.error.js'
import { isProjectArchived } from '../../../domain/entities/project.entity.js'
import { isValidPriority, type Priority } from '../../../domain/value-objects/priority.js'
import { DomainError, ERROR_CODE } from '../../../domain/errors/domain.error.js'
import { toTaskOutput, type CreateTaskInput, type TaskOutput } from '../../dtos/task.dto.js'

import type { TaskRepository } from '../../../domain/repositories/task.repository.js'
import type { ProjectRepository } from '../../../domain/repositories/project.repository.js'

export class CreateTaskUseCase {
  constructor(
    private readonly projectRepository: ProjectRepository,
    private readonly taskRepository: TaskRepository,
  ) {}

  async execute(input: CreateTaskInput): Promise<TaskOutput> {
    if (input.title.trim().length === 0) {
      throw new DomainError(
        'El título de la tarea no puede estar vacío.',
        ERROR_CODE.VALIDATION_ERROR,
      )
    }

    const project = await this.projectRepository.findById(input.projectId)

    if (project === null) {
      throw new ProjectNotFoundError(input.projectId)
    }

    if (isProjectArchived(project)) {
      throw new ProjectArchivedError(input.projectId)
    }

    let priority: Priority | undefined
    if (input.priority !== undefined) {
      if (!isValidPriority(input.priority)) {
        throw new DomainError(
          `Valor de prioridad no válido: '${input.priority}'.`,
          ERROR_CODE.VALIDATION_ERROR,
        )
      }
      priority = input.priority
    }

    const dueDate = input.dueDate !== undefined ? new Date(input.dueDate) : undefined

    const task = await this.taskRepository.create({
      projectId: input.projectId,
      title: input.title,
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(priority !== undefined ? { priority } : {}),
      ...(dueDate !== undefined ? { dueDate } : {}),
    })

    return toTaskOutput(task)
  }
}
