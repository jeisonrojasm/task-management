import type { ProjectStatus } from '@task-manager/shared'

export interface Project {
  id: string
  name: string
  description: string | null
  status: ProjectStatus
  createdAt: string
  updatedAt: string
}

export interface ProjectSummary extends Project {
  taskCount: number
}

export interface ProjectFilters {
  status?: ProjectStatus
  page?: number
  limit?: number
}

export type CreateProjectData = {
  name: string
  description?: string
}

export type UpdateProjectData = {
  name: string
  description: string | null
}
