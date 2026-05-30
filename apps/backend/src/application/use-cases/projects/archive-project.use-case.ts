import type { ProjectRepository } from '../../../domain/repositories/project.repository.js'
import { ProjectNotFoundError } from '../../../domain/errors/project-not-found.error.js'
import { isProjectArchived } from '../../../domain/entities/project.entity.js'
import { toProjectOutput, type ProjectOutput } from '../../dtos/project.dto.js'

export class ArchiveProjectUseCase {
  constructor(private readonly projectRepository: ProjectRepository) {}

  async execute(input: { projectId: string }): Promise<ProjectOutput> {
    const project = await this.projectRepository.findById(input.projectId)

    if (project === null) {
      throw new ProjectNotFoundError(input.projectId)
    }

    if (isProjectArchived(project)) {
      return toProjectOutput(project)
    }

    const archived = await this.projectRepository.archive(input.projectId)

    return toProjectOutput(archived)
  }
}
