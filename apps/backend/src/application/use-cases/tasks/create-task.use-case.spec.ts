import { InMemoryProjectRepository } from '../__fakes__/in-memory-project.repository.js'
import { InMemoryTaskRepository } from '../__fakes__/in-memory-task.repository.js'

import { CreateTaskUseCase } from './create-task.use-case.js'

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
let taskRepo: InMemoryTaskRepository
let useCase: CreateTaskUseCase

beforeEach(() => {
  projectRepo = new InMemoryProjectRepository()
  taskRepo = new InMemoryTaskRepository()
  useCase = new CreateTaskUseCase(projectRepo, taskRepo)
})

describe('CreateTaskUseCase', () => {
  describe('happy path', () => {
    it('creates task with all fields when project is active', async () => {
      const project = buildProject()
      projectRepo.seed(project)

      const result = await useCase.execute({
        projectId: project.id,
        title: 'My Task',
        description: 'Task description',
        priority: 'HIGH',
        dueDate: '2026-12-31',
      })

      expect(result.title).toBe('My Task')
      expect(result.description).toBe('Task description')
      expect(result.priority).toBe('HIGH')
      expect(result.projectId).toBe(project.id)
    })

    it('creates task with only required fields', async () => {
      const project = buildProject()
      projectRepo.seed(project)

      const result = await useCase.execute({ projectId: project.id, title: 'Minimal Task' })

      expect(result.title).toBe('Minimal Task')
      expect(result.description).toBeNull()
      expect(result.dueDate).toBeNull()
    })

    it('defaults priority to MEDIUM when not specified', async () => {
      const project = buildProject()
      projectRepo.seed(project)

      const result = await useCase.execute({ projectId: project.id, title: 'Task' })

      expect(result.priority).toBe('MEDIUM')
    })
  })

  describe('validation failures', () => {
    it('throws DomainError with code VALIDATION_ERROR when title is empty', async () => {
      const project = buildProject()
      projectRepo.seed(project)

      await expect(useCase.execute({ projectId: project.id, title: '' })).rejects.toMatchObject({
        code: 'VALIDATION_ERROR',
      })
    })

    it('throws DomainError with code VALIDATION_ERROR when title is only whitespace', async () => {
      const project = buildProject()
      projectRepo.seed(project)

      await expect(useCase.execute({ projectId: project.id, title: '   ' })).rejects.toMatchObject({
        code: 'VALIDATION_ERROR',
      })
    })
  })

  describe('project guard failures', () => {
    it('throws DomainError with code PROJECT_NOT_FOUND when project does not exist', async () => {
      await expect(
        useCase.execute({ projectId: 'non-existent-id', title: 'Task' }),
      ).rejects.toMatchObject({ code: 'PROJECT_NOT_FOUND' })
    })

    it('throws DomainError with code PROJECT_ARCHIVED when project is archived', async () => {
      const project = buildProject({ status: 'ARCHIVED' })
      projectRepo.seed(project)

      await expect(useCase.execute({ projectId: project.id, title: 'Task' })).rejects.toMatchObject(
        { code: 'PROJECT_ARCHIVED' },
      )
    })
  })
})
