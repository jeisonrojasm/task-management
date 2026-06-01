import type { Task } from '../../../domain/entities/task.entity.js'
import type {
  TaskRepository,
  CreateTaskData,
  UpdateTaskData,
  ListTasksFilters,
} from '../../../domain/repositories/task.repository.js'
import type { TaskStatus } from '../../../domain/value-objects/task-status.js'
import type { Priority } from '../../../domain/value-objects/priority.js'
import type { PaginatedResult, PaginationParams, SortParams } from '../../../domain/shared-types.js'

function paginate<T>(
  items: T[],
  sort: SortParams,
  pagination: PaginationParams,
): PaginatedResult<T> {
  const sorted = [...items].sort((a, b) => {
    const aRec = a as Record<string, unknown>
    const bRec = b as Record<string, unknown>
    const aVal = aRec[sort.sort]
    const bVal = bRec[sort.sort]
    if (aVal instanceof Date && bVal instanceof Date) {
      const diff = aVal.getTime() - bVal.getTime()
      return sort.order === 'asc' ? diff : -diff
    }
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      const diff = aVal.localeCompare(bVal)
      return sort.order === 'asc' ? diff : -diff
    }
    return 0
  })

  const total = sorted.length
  const totalPages = Math.max(1, Math.ceil(total / pagination.limit))
  const start = (pagination.page - 1) * pagination.limit
  const data = sorted.slice(start, start + pagination.limit)

  return {
    data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total,
      totalPages,
      hasNext: pagination.page < totalPages,
      hasPrev: pagination.page > 1,
    },
  }
}

export class InMemoryTaskRepository implements TaskRepository {
  private readonly store = new Map<string, Task>()

  seed(task: Task): void {
    this.store.set(task.id, task)
  }

  clear(): void {
    this.store.clear()
  }

  async findById(id: string): Promise<Task | null> {
    return this.store.get(id) ?? null
  }

  async findByProjectId(
    projectId: string,
    filters: ListTasksFilters,
    pagination: PaginationParams,
    sort: SortParams,
  ): Promise<PaginatedResult<Task>> {
    let items = [...this.store.values()].filter((t) => t.projectId === projectId)
    if (filters.status !== undefined) {
      items = items.filter((t) => t.status === filters.status)
    }
    if (filters.priority !== undefined) {
      items = items.filter((t) => t.priority === filters.priority)
    }
    return paginate(items, sort, pagination)
  }

  async create(data: CreateTaskData): Promise<Task> {
    const task: Task = {
      id: crypto.randomUUID(),
      projectId: data.projectId,
      title: data.title,
      description: data.description ?? null,
      status: 'TODO',
      priority: data.priority ?? 'MEDIUM',
      dueDate: data.dueDate ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    this.store.set(task.id, task)
    return task
  }

  async update(id: string, data: UpdateTaskData): Promise<Task> {
    const existing = this.store.get(id)
    if (existing === undefined) {
      throw new Error(`Task ${id} not found`)
    }
    const dueDate = data.dueDate !== null ? new Date(data.dueDate) : null
    const updated: Task = {
      ...existing,
      title: data.title,
      description: data.description,
      priority: data.priority,
      dueDate,
      updatedAt: new Date(),
    }
    this.store.set(id, updated)
    return updated
  }

  async updateStatus(id: string, status: TaskStatus): Promise<Task> {
    const existing = this.store.get(id)
    if (existing === undefined) {
      throw new Error(`Task ${id} not found`)
    }
    const updated: Task = { ...existing, status, updatedAt: new Date() }
    this.store.set(id, updated)
    return updated
  }

  async delete(id: string): Promise<void> {
    this.store.delete(id)
  }

  async countByProjectId(projectId: string): Promise<number> {
    let count = 0
    for (const task of this.store.values()) {
      if (task.projectId === projectId) {
        count++
      }
    }
    return count
  }

  async getStatusDistribution(projectId: string): Promise<Record<TaskStatus, number>> {
    const dist: Record<TaskStatus, number> = {
      TODO: 0,
      IN_PROGRESS: 0,
      IN_REVIEW: 0,
      DONE: 0,
      CANCELLED: 0,
    }
    for (const task of this.store.values()) {
      if (task.projectId === projectId) {
        dist[task.status]++
      }
    }
    return dist
  }

  async getPriorityDistribution(projectId: string): Promise<Record<Priority, number>> {
    const dist: Record<Priority, number> = {
      LOW: 0,
      MEDIUM: 0,
      HIGH: 0,
      CRITICAL: 0,
    }
    for (const task of this.store.values()) {
      if (task.projectId === projectId) {
        dist[task.priority]++
      }
    }
    return dist
  }

  async getOverdueCount(projectId: string): Promise<number> {
    const now = new Date()
    let count = 0
    for (const task of this.store.values()) {
      if (
        task.projectId === projectId &&
        task.dueDate !== null &&
        task.dueDate < now &&
        task.status !== 'DONE' &&
        task.status !== 'CANCELLED'
      ) {
        count++
      }
    }
    return count
  }
}
