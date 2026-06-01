export interface Project {
  id: string
  name: string
  description: string | null
  status: 'ACTIVE' | 'ARCHIVED'
  createdAt: string
  updatedAt: string
}

export interface ProjectSummary extends Project {
  taskCount: number
}

export interface ProjectFilters {
  status?: 'ACTIVE' | 'ARCHIVED'
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
