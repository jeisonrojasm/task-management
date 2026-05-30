import type { Project } from '../../domain/entities/project.entity.js'
import type { ProjectWithTaskCount } from '../../domain/repositories/project.repository.js'

export interface CreateProjectInput {
  name: string
  description?: string
}

export interface UpdateProjectInput {
  name: string
  description: string | null
}

export interface ListProjectsInput {
  status?: string
  page?: number
  limit?: number
  sort?: string
  order?: string
}

export interface ProjectOutput {
  id: string
  name: string
  description: string | null
  status: string
  createdAt: string
  updatedAt: string
}

export interface ProjectWithStatsOutput extends ProjectOutput {
  taskCount: number
}

export function toProjectOutput(project: Project): ProjectOutput {
  return {
    id: project.id,
    name: project.name,
    description: project.description,
    status: project.status,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
  }
}

export function toProjectWithStatsOutput(project: ProjectWithTaskCount): ProjectWithStatsOutput {
  return {
    id: project.id,
    name: project.name,
    description: project.description,
    status: project.status,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
    taskCount: project.taskCount,
  }
}
