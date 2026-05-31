import { InMemoryTaskRepository } from '../__fakes__/in-memory-task.repository.js'

import { DeleteTaskUseCase } from './delete-task.use-case.js'

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
let useCase: DeleteTaskUseCase

beforeEach(() => {
  taskRepo = new InMemoryTaskRepository()
  useCase = new DeleteTaskUseCase(taskRepo)
})

describe('DeleteTaskUseCase', () => {
  it('resolves without error when task exists', async () => {
    const task = buildTask()
    taskRepo.seed(task)

    await expect(useCase.execute({ taskId: task.id })).resolves.toBeUndefined()
  })

  it('throws DomainError with code TASK_NOT_FOUND when task does not exist', async () => {
    await expect(useCase.execute({ taskId: 'non-existent-id' })).rejects.toMatchObject({
      code: 'TASK_NOT_FOUND',
    })
  })
})
