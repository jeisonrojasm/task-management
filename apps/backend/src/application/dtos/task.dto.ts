import { isTaskOverdue, type Task } from '../../domain/entities/task.entity.js'

export interface CreateTaskInput {
  projectId: string
  title: string
  description?: string
  priority?: string
  dueDate?: string
}

export interface UpdateTaskInput {
  title: string
  description: string | null
  priority: string
  dueDate: string | null
}

export interface UpdateTaskStatusInput {
  taskId: string
  newStatus: string
}

export interface ListProjectTasksInput {
  projectId: string
  status?: string
  priority?: string
  page?: number
  limit?: number
  sort?: string
  order?: string
}

export interface TaskOutput {
  id: string
  projectId: string
  title: string
  description: string | null
  status: string
  priority: string
  dueDate: string | null
  isOverdue: boolean
  createdAt: string
  updatedAt: string
}

export interface ProjectStatsOutput {
  projectId: string
  taskCount: number
  byStatus: Record<string, number>
  byPriority: Record<string, number>
  overdueCount: number
  completionRate: number
  aiInsights: {
    summary: string
    recommendations: string[]
    generatedAt: string
  } | null
}

export function toTaskOutput(task: Task): TaskOutput {
  return {
    id: task.id,
    projectId: task.projectId,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    dueDate: task.dueDate !== null ? task.dueDate.toISOString() : null,
    isOverdue: isTaskOverdue(task),
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  }
}
