import { InMemoryProjectRepository } from '../__fakes__/in-memory-project.repository.js'
import { InMemoryTaskRepository } from '../__fakes__/in-memory-task.repository.js'

import { GetProjectStatsUseCase } from './get-project-stats.use-case.js'

import type { Project } from '../../../domain/entities/project.entity.js'
import type { Task } from '../../../domain/entities/task.entity.js'
import type { AIProvider, AIInsights } from '../../../domain/services/ai-provider.js'

const fastAI: AIProvider = {
  generateProjectInsights: async (ctx): Promise<AIInsights> => ({
    summary: `Summary for ${ctx.projectName}`,
    recommendations: ['Recommendation 1', 'Recommendation 2'],
    generatedAt: new Date(),
  }),
}

const failingAI: AIProvider = {
  generateProjectInsights: async (): Promise<AIInsights> => {
    throw new Error('OpenAI timeout')
  },
}

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

function buildTask(overrides: Partial<Task> & { projectId: string }): Task {
  return {
    id: crypto.randomUUID(),
    title: 'Test Task',
    description: null,
    status: 'TODO',
    priority: 'MEDIUM',
    dueDate: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

let projectRepo: InMemoryProjectRepository
let taskRepo: InMemoryTaskRepository

beforeEach(() => {
  projectRepo = new InMemoryProjectRepository()
  taskRepo = new InMemoryTaskRepository()
})

describe('GetProjectStatsUseCase', () => {
  describe('stats computation', () => {
    it('returns correct stats with status and priority distributions', async () => {
      const project = buildProject()
      projectRepo.seed(project)
      taskRepo.seed(buildTask({ projectId: project.id, status: 'DONE', priority: 'HIGH' }))
      taskRepo.seed(buildTask({ projectId: project.id, status: 'TODO', priority: 'MEDIUM' }))
      taskRepo.seed(buildTask({ projectId: project.id, status: 'IN_PROGRESS', priority: 'LOW' }))

      const useCase = new GetProjectStatsUseCase(projectRepo, taskRepo, fastAI)
      const result = await useCase.execute({ projectId: project.id })

      expect(result.taskCount).toBe(3)
      expect(result.byStatus['DONE']).toBe(1)
      expect(result.byStatus['TODO']).toBe(1)
      expect(result.byStatus['IN_PROGRESS']).toBe(1)
      expect(result.byPriority['HIGH']).toBe(1)
      expect(result.byPriority['MEDIUM']).toBe(1)
      expect(result.byPriority['LOW']).toBe(1)
    })

    it('completionRate is 0 when there are no tasks', async () => {
      const project = buildProject()
      projectRepo.seed(project)

      const useCase = new GetProjectStatsUseCase(projectRepo, taskRepo, fastAI)
      const result = await useCase.execute({ projectId: project.id })

      expect(result.completionRate).toBe(0)
    })

    it('completionRate is 0.5 with 2 DONE tasks out of 4', async () => {
      const project = buildProject()
      projectRepo.seed(project)
      taskRepo.seed(buildTask({ projectId: project.id, status: 'DONE' }))
      taskRepo.seed(buildTask({ projectId: project.id, status: 'DONE' }))
      taskRepo.seed(buildTask({ projectId: project.id, status: 'TODO' }))
      taskRepo.seed(buildTask({ projectId: project.id, status: 'TODO' }))

      const useCase = new GetProjectStatsUseCase(projectRepo, taskRepo, fastAI)
      const result = await useCase.execute({ projectId: project.id })

      expect(result.completionRate).toBe(0.5)
    })
  })

  describe('AI insights', () => {
    it('returns aiInsights with summary and recommendations when provider succeeds', async () => {
      const project = buildProject()
      projectRepo.seed(project)

      const useCase = new GetProjectStatsUseCase(projectRepo, taskRepo, fastAI)
      const result = await useCase.execute({ projectId: project.id })

      expect(result.aiInsights).not.toBeNull()
      expect(typeof result.aiInsights?.summary).toBe('string')
      expect(Array.isArray(result.aiInsights?.recommendations)).toBe(true)
    })

    it('aiInsights is null when provider throws — use case does not propagate the exception', async () => {
      const project = buildProject()
      projectRepo.seed(project)

      const useCase = new GetProjectStatsUseCase(projectRepo, taskRepo, failingAI)
      const result = await useCase.execute({ projectId: project.id })

      expect(result.aiInsights).toBeNull()
    })
  })

  describe('not found', () => {
    it('throws DomainError with code PROJECT_NOT_FOUND when project does not exist', async () => {
      const useCase = new GetProjectStatsUseCase(projectRepo, taskRepo, fastAI)

      await expect(useCase.execute({ projectId: 'non-existent-id' })).rejects.toMatchObject({
        code: 'PROJECT_NOT_FOUND',
      })
    })
  })
})
