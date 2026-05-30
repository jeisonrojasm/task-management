import type { PaginatedResult } from '../../../domain/shared-types.js'
import type { ProjectRepository } from '../../../domain/repositories/project.repository.js'
import type { ProjectStatus } from '../../../domain/value-objects/project-status.js'
import { DomainError } from '../../../domain/errors/domain.error.js'
import { toProjectWithStatsOutput, type ListProjectsInput, type ProjectWithStatsOutput } from '../../dtos/project.dto.js'

const MAX_LIMIT = 100

export class ListProjectsUseCase {
  constructor(private readonly projectRepository: ProjectRepository) {}

  async execute(input: ListProjectsInput): Promise<PaginatedResult<ProjectWithStatsOutput>> {
    const page = input.page ?? 1
    const limit = input.limit ?? 20
    const sort = input.sort ?? 'createdAt'

    if (limit > MAX_LIMIT) {
      throw new DomainError(`Limit cannot exceed ${MAX_LIMIT}.`, 'VALIDATION_ERROR')
    }

    const status: ProjectStatus = input.status === 'ARCHIVED' ? 'ARCHIVED' : 'ACTIVE'
    const order: 'asc' | 'desc' = input.order === 'asc' ? 'asc' : 'desc'

    const result = await this.projectRepository.findAllWithTaskCount(
      { status },
      { page, limit },
      { sort, order },
    )

    return {
      data: result.data.map(toProjectWithStatsOutput),
      pagination: result.pagination,
    }
  }
}
