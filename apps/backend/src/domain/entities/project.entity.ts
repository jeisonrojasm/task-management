import type { ProjectStatus } from '../value-objects/project-status.js'

export interface Project {
  id: string
  name: string
  description: string | null
  status: ProjectStatus
  createdAt: Date
  updatedAt: Date
}

export function isProjectArchived(project: Project): boolean {
  return project.status === 'ARCHIVED'
}
