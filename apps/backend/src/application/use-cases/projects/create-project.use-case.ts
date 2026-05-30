import { DomainError, ERROR_CODE } from '../../../domain/errors/domain.error.js'
import {
  toProjectOutput,
  type CreateProjectInput,
  type ProjectOutput,
} from '../../dtos/project.dto.js'

import type { ProjectRepository } from '../../../domain/repositories/project.repository.js'

export class CreateProjectUseCase {
  constructor(private readonly projectRepository: ProjectRepository) {}

  async execute(input: CreateProjectInput): Promise<ProjectOutput> {
    if (input.name.trim().length === 0) {
      throw new DomainError('Project name cannot be empty.', ERROR_CODE.VALIDATION_ERROR)
    }

    const project = await this.projectRepository.create({
      name: input.name,
      ...(input.description !== undefined ? { description: input.description } : {}),
    })

    return toProjectOutput(project)
  }
}
