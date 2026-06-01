import type { TaskStatus, Priority } from '@task-manager/shared'

export type { TaskStatus, Priority }

export const VALID_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  TODO: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['IN_REVIEW', 'TODO', 'CANCELLED'],
  IN_REVIEW: ['DONE', 'IN_PROGRESS', 'CANCELLED'],
  DONE: [],
  CANCELLED: [],
}

export interface Task {
  id: string
  projectId: string
  title: string
  description: string | null
  status: TaskStatus
  priority: Priority
  dueDate: string | null
  isOverdue: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateTaskData {
  projectId: string
  title: string
  description?: string
  priority?: Priority
  dueDate?: string
}

export interface UpdateTaskData {
  title: string
  description: string | null
  priority: Priority
  dueDate: string | null
}

export interface TaskFilters {
  status?: TaskStatus
  priority?: Priority
  page?: number
  limit?: number
}
