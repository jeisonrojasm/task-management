import { ProjectNotFoundError } from '../../../domain/errors/project-not-found.error.js'
import { ProjectArchivedError } from '../../../domain/errors/project-archived.error.js'
import { isProjectArchived } from '../../../domain/entities/project.entity.js'
import {
  toProjectOutput,
  type UpdateProjectInput,
  type ProjectOutput,
} from '../../dtos/project.dto.js'

import type { ProjectRepository } from '../../../domain/repositories/project.repository.js'

export class UpdateProjectUseCase {
  constructor(private readonly projectRepository: ProjectRepository) {}

  async execute(input: { projectId: string } & UpdateProjectInput): Promise<ProjectOutput> {
    const project = await this.projectRepository.findById(input.projectId)

    if (project === null) {
      throw new ProjectNotFoundError(input.projectId)
    }

    if (isProjectArchived(project)) {
      throw new ProjectArchivedError(input.projectId)
    }

    const updated = await this.projectRepository.update(input.projectId, {
      name: input.name,
      description: input.description,
    })

    return toProjectOutput(updated)
  }
}
