import type { TaskStatus } from '../value-objects/task-status.js'
import type { Priority } from '../value-objects/priority.js'

export interface ProjectInsightContext {
  projectName: string
  taskCount: number
  byStatus: Record<TaskStatus, number>
  byPriority: Record<Priority, number>
  overdueCount: number
  completionRate: number
}

export interface AIInsights {
  summary: string
  recommendations: string[]
  generatedAt: Date
}

export interface AIProvider {
  generateProjectInsights(context: ProjectInsightContext): Promise<AIInsights>
}
