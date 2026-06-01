import { InMemoryProjectRepository } from '../__fakes__/in-memory-project.repository.js'

import { ArchiveProjectUseCase } from './archive-project.use-case.js'

import type { Project } from '../../../domain/entities/project.entity.js'

function buildProject(overrides: Partial<Project> = {}): Project {
  return {
    id: crypto.randomUUID(),
    name: 'Test Project',
    description: null,
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

let projectRepo: InMemoryProjectRepository
let useCase: ArchiveProjectUseCase

beforeEach(() => {
  projectRepo = new InMemoryProjectRepository()
  useCase = new ArchiveProjectUseCase(projectRepo)
})

describe('ArchiveProjectUseCase', () => {
  it('archives an active project and returns it with status ARCHIVED', async () => {
    const project = buildProject({ status: 'ACTIVE' })
    projectRepo.seed(project)

    const result = await useCase.execute({ projectId: project.id })

    expect(result.status).toBe('ARCHIVED')
  })

  it('is idempotent: archiving an already archived project returns it without error', async () => {
    const project = buildProject({ status: 'ARCHIVED' })
    projectRepo.seed(project)

    const result = await useCase.execute({ projectId: project.id })

    expect(result.status).toBe('ARCHIVED')
  })

  it('throws DomainError with code PROJECT_NOT_FOUND when project does not exist', async () => {
    await expect(useCase.execute({ projectId: 'non-existent-id' })).rejects.toMatchObject({
      code: 'PROJECT_NOT_FOUND',
    })
  })
})
