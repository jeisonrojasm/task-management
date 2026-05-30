import type { Project } from '../entities/project.entity.js'
import type { ProjectStatus } from '../value-objects/project-status.js'
import type { PaginatedResult, PaginationParams, SortParams } from '../shared-types.js'

export interface ListProjectsFilters {
  status?: ProjectStatus
}

export interface ProjectWithTaskCount extends Project {
  taskCount: number
}

export interface ProjectRepository {
  findById(id: string): Promise<Project | null>
  findAll(
    filters: ListProjectsFilters,
    pagination: PaginationParams,
    sort: SortParams,
  ): Promise<PaginatedResult<Project>>
  findAllWithTaskCount(
    filters: ListProjectsFilters,
    pagination: PaginationParams,
    sort: SortParams,
  ): Promise<PaginatedResult<ProjectWithTaskCount>>
  create(data: CreateProjectData): Promise<Project>
  update(id: string, data: UpdateProjectData): Promise<Project>
  archive(id: string): Promise<Project>
  existsById(id: string): Promise<boolean>
}

export interface CreateProjectData {
  name: string
  description?: string
}

export interface UpdateProjectData {
  name: string
  description: string | null
}
