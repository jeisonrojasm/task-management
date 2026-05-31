import { InMemoryTaskRepository } from '../__fakes__/in-memory-task.repository.js'

import { UpdateTaskStatusUseCase } from './update-task-status.use-case.js'

import type { Task } from '../../../domain/entities/task.entity.js'

function buildTask(overrides: Partial<Task> = {}): Task {
  return {
    id: crypto.randomUUID(),
    projectId: 'project-1',
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

let taskRepo: InMemoryTaskRepository
let useCase: UpdateTaskStatusUseCase

beforeEach(() => {
  taskRepo = new InMemoryTaskRepository()
  useCase = new UpdateTaskStatusUseCase(taskRepo)
})

describe('UpdateTaskStatusUseCase', () => {
  describe('valid transitions', () => {
    it('TODO → IN_PROGRESS: returns task with status IN_PROGRESS', async () => {
      const task = buildTask({ status: 'TODO' })
      taskRepo.seed(task)

      const result = await useCase.execute({ taskId: task.id, newStatus: 'IN_PROGRESS' })

      expect(result.status).toBe('IN_PROGRESS')
    })

    it('IN_PROGRESS → IN_REVIEW: returns task with status IN_REVIEW', async () => {
      const task = buildTask({ status: 'IN_PROGRESS' })
      taskRepo.seed(task)

      const result = await useCase.execute({ taskId: task.id, newStatus: 'IN_REVIEW' })

      expect(result.status).toBe('IN_REVIEW')
    })

    it('IN_REVIEW → DONE: returns task with status DONE', async () => {
      const task = buildTask({ status: 'IN_REVIEW' })
      taskRepo.seed(task)

      const result = await useCase.execute({ taskId: task.id, newStatus: 'DONE' })

      expect(result.status).toBe('DONE')
    })

    it('IN_PROGRESS → TODO (rollback): returns task with status TODO', async () => {
      const task = buildTask({ status: 'IN_PROGRESS' })
      taskRepo.seed(task)

      const result = await useCase.execute({ taskId: task.id, newStatus: 'TODO' })

      expect(result.status).toBe('TODO')
    })
  })

  describe('invalid transitions from terminal states', () => {
    it('DONE → IN_PROGRESS: throws DomainError with code INVALID_TASK_STATUS_TRANSITION', async () => {
      const task = buildTask({ status: 'DONE' })
      taskRepo.seed(task)

      await expect(
        useCase.execute({ taskId: task.id, newStatus: 'IN_PROGRESS' }),
      ).rejects.toMatchObject({ code: 'INVALID_TASK_STATUS_TRANSITION' })
    })

    it('CANCELLED → TODO: throws DomainError with code INVALID_TASK_STATUS_TRANSITION', async () => {
      const task = buildTask({ status: 'CANCELLED' })
      taskRepo.seed(task)

      await expect(useCase.execute({ taskId: task.id, newStatus: 'TODO' })).rejects.toMatchObject({
        code: 'INVALID_TASK_STATUS_TRANSITION',
      })
    })

    it('TODO → DONE (invalid skip): throws DomainError with code INVALID_TASK_STATUS_TRANSITION', async () => {
      const task = buildTask({ status: 'TODO' })
      taskRepo.seed(task)

      await expect(useCase.execute({ taskId: task.id, newStatus: 'DONE' })).rejects.toMatchObject({
        code: 'INVALID_TASK_STATUS_TRANSITION',
      })
    })
  })

  describe('not found', () => {
    it('throws DomainError with code TASK_NOT_FOUND when task does not exist', async () => {
      await expect(
        useCase.execute({ taskId: 'non-existent-id', newStatus: 'IN_PROGRESS' }),
      ).rejects.toMatchObject({ code: 'TASK_NOT_FOUND' })
    })
  })

  describe('invalid status value', () => {
    it('throws DomainError with code VALIDATION_ERROR when status string is not a recognized TaskStatus', async () => {
      const task = buildTask({ status: 'TODO' })
      taskRepo.seed(task)

      await expect(
        useCase.execute({ taskId: task.id, newStatus: 'INVALID_STATUS' }),
      ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' })
    })
  })
})
