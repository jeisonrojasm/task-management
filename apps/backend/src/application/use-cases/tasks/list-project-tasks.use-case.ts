import { ProjectNotFoundError } from '../../../domain/errors/project-not-found.error.js'
import { isValidTaskStatus, type TaskStatus } from '../../../domain/value-objects/task-status.js'
import { isValidPriority, type Priority } from '../../../domain/value-objects/priority.js'
import { DomainError, ERROR_CODE } from '../../../domain/errors/domain.error.js'
import { toTaskOutput, type ListProjectTasksInput, type TaskOutput } from '../../dtos/task.dto.js'

import type { TaskRepository } from '../../../domain/repositories/task.repository.js'
import type { ProjectRepository } from '../../../domain/repositories/project.repository.js'
import type { PaginatedResult } from '../../../domain/shared-types.js'

const MAX_LIMIT = 100

export class ListProjectTasksUseCase {
  constructor(
    private readonly projectRepository: ProjectRepository,
    private readonly taskRepository: TaskRepository,
  ) {}

  async execute(input: ListProjectTasksInput): Promise<PaginatedResult<TaskOutput>> {
    const project = await this.projectRepository.findById(input.projectId)

    if (project === null) {
      throw new ProjectNotFoundError(input.projectId)
    }

    const page = input.page ?? 1
    const limit = input.limit ?? 20
    const sort = input.sort ?? 'createdAt'
    const order: 'asc' | 'desc' = input.order === 'asc' ? 'asc' : 'desc'

    if (limit > MAX_LIMIT) {
      throw new DomainError(`El límite no puede superar ${MAX_LIMIT}.`, ERROR_CODE.VALIDATION_ERROR)
    }

    let status: TaskStatus | undefined
    if (input.status !== undefined) {
      if (!isValidTaskStatus(input.status)) {
        throw new DomainError(
          `Estado de tarea no válido: '${input.status}'.`,
          ERROR_CODE.VALIDATION_ERROR,
        )
      }
      status = input.status
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

    const result = await this.taskRepository.findByProjectId(
      input.projectId,
      {
        ...(status !== undefined ? { status } : {}),
        ...(priority !== undefined ? { priority } : {}),
      },
      { page, limit },
      { sort, order },
    )

    return {
      data: result.data.map(toTaskOutput),
      pagination: result.pagination,
    }
  }
}
