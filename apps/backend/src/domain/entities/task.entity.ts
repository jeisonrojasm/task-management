import type { TaskStatus } from '../value-objects/task-status.js'
import type { Priority } from '../value-objects/priority.js'

export interface Task {
  id: string
  projectId: string
  title: string
  description: string | null
  status: TaskStatus
  priority: Priority
  dueDate: Date | null
  createdAt: Date
  updatedAt: Date
}

const VALID_TRANSITIONS: Record<TaskStatus, readonly TaskStatus[]> = {
  TODO: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['IN_REVIEW', 'TODO', 'CANCELLED'],
  IN_REVIEW: ['DONE', 'IN_PROGRESS', 'CANCELLED'],
  DONE: [],
  CANCELLED: [],
}

export function canTransitionTo(currentStatus: TaskStatus, newStatus: TaskStatus): boolean {
  return (VALID_TRANSITIONS[currentStatus] ?? []).includes(newStatus)
}

export function isTaskOverdue(task: Task): boolean {
  if (task.dueDate === null) {
    return false
  }
  if (task.status === 'DONE' || task.status === 'CANCELLED') {
    return false
  }
  return task.dueDate < new Date()
}
