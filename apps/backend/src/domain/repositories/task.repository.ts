import type { Task } from '../entities/task.entity.js'
import type { TaskStatus } from '../value-objects/task-status.js'
import type { Priority } from '../value-objects/priority.js'
import type { PaginatedResult, PaginationParams, SortParams } from '../shared-types.js'

export interface ListTasksFilters {
  status?: TaskStatus
  priority?: Priority
}

export interface TaskRepository {
  findById(id: string): Promise<Task | null>
  findByProjectId(
    projectId: string,
    filters: ListTasksFilters,
    pagination: PaginationParams,
    sort: SortParams,
  ): Promise<PaginatedResult<Task>>
  create(data: CreateTaskData): Promise<Task>
  update(id: string, data: UpdateTaskData): Promise<Task>
  updateStatus(id: string, status: TaskStatus): Promise<Task>
  delete(id: string): Promise<void>
  countByProjectId(projectId: string): Promise<number>
  getStatusDistribution(projectId: string): Promise<Record<TaskStatus, number>>
  getPriorityDistribution(projectId: string): Promise<Record<Priority, number>>
  getOverdueCount(projectId: string): Promise<number>
}

export interface CreateTaskData {
  projectId: string
  title: string
  description?: string
  priority?: Priority
  dueDate?: Date
}

export interface UpdateTaskData {
  title: string
  description: string | null
  priority: Priority
  dueDate: Date | null
}
