import { InMemoryProjectRepository } from '../__fakes__/in-memory-project.repository.js'

import { UpdateProjectUseCase } from './update-project.use-case.js'

import type { Project } from '../../../domain/entities/project.entity.js'

function buildProject(overrides: Partial<Project> = {}): Project {
  return {
    id: crypto.randomUUID(),
    name: 'Original Name',
    description: null,
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

let projectRepo: InMemoryProjectRepository
let useCase: UpdateProjectUseCase

beforeEach(() => {
  projectRepo = new InMemoryProjectRepository()
  useCase = new UpdateProjectUseCase(projectRepo)
})

describe('UpdateProjectUseCase', () => {
  it('updates name and description of an active project', async () => {
    const project = buildProject({ status: 'ACTIVE' })
    projectRepo.seed(project)

    const result = await useCase.execute({
      projectId: project.id,
      name: 'Updated Name',
      description: 'New description',
    })

    expect(result.name).toBe('Updated Name')
    expect(result.description).toBe('New description')
  })

  it('throws DomainError with code PROJECT_NOT_FOUND when project does not exist', async () => {
    await expect(
      useCase.execute({ projectId: 'non-existent-id', name: 'Name', description: null }),
    ).rejects.toMatchObject({ code: 'PROJECT_NOT_FOUND' })
  })

  it('throws DomainError with code PROJECT_ARCHIVED when project is archived', async () => {
    const project = buildProject({ status: 'ARCHIVED' })
    projectRepo.seed(project)

    await expect(
      useCase.execute({ projectId: project.id, name: 'Name', description: null }),
    ).rejects.toMatchObject({ code: 'PROJECT_ARCHIVED' })
  })
})
