import { InMemoryProjectRepository } from '../__fakes__/in-memory-project.repository.js'

import { CreateProjectUseCase } from './create-project.use-case.js'

let projectRepo: InMemoryProjectRepository
let useCase: CreateProjectUseCase

beforeEach(() => {
  projectRepo = new InMemoryProjectRepository()
  useCase = new CreateProjectUseCase(projectRepo)
})

describe('CreateProjectUseCase', () => {
  describe('happy path', () => {
    it('creates project with name and description', async () => {
      const result = await useCase.execute({ name: 'My Project', description: 'A description' })

      expect(result.name).toBe('My Project')
      expect(result.description).toBe('A description')
      expect(result.status).toBe('ACTIVE')
      expect(result.id).toBeDefined()
    })

    it('creates project with only name (description is optional)', async () => {
      const result = await useCase.execute({ name: 'Minimal Project' })

      expect(result.name).toBe('Minimal Project')
      expect(result.description).toBeNull()
    })
  })

  describe('validation failures', () => {
    it('throws DomainError with code VALIDATION_ERROR when name is empty', async () => {
      await expect(useCase.execute({ name: '' })).rejects.toMatchObject({
        code: 'VALIDATION_ERROR',
      })
    })

    it('throws DomainError with code VALIDATION_ERROR when name is only whitespace', async () => {
      await expect(useCase.execute({ name: '   ' })).rejects.toMatchObject({
        code: 'VALIDATION_ERROR',
      })
    })
  })
})
