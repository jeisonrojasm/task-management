import type { Project } from '../../../domain/entities/project.entity.js'
import type {
  ProjectRepository,
  CreateProjectData,
  UpdateProjectData,
  ListProjectsFilters,
  ProjectWithTaskCount,
} from '../../../domain/repositories/project.repository.js'
import type { PaginatedResult, PaginationParams, SortParams } from '../../../domain/shared-types.js'

function paginate<T>(
  items: T[],
  sort: SortParams,
  pagination: PaginationParams,
): PaginatedResult<T> {
  const sorted = [...items].sort((a, b) => {
    const aRec = a as Record<string, unknown>
    const bRec = b as Record<string, unknown>
    const aVal = aRec[sort.sort]
    const bVal = bRec[sort.sort]
    if (aVal instanceof Date && bVal instanceof Date) {
      const diff = aVal.getTime() - bVal.getTime()
      return sort.order === 'asc' ? diff : -diff
    }
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      const diff = aVal.localeCompare(bVal)
      return sort.order === 'asc' ? diff : -diff
    }
    return 0
  })

  const total = sorted.length
  const totalPages = Math.max(1, Math.ceil(total / pagination.limit))
  const start = (pagination.page - 1) * pagination.limit
  const data = sorted.slice(start, start + pagination.limit)

  return {
    data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total,
      totalPages,
      hasNext: pagination.page < totalPages,
      hasPrev: pagination.page > 1,
    },
  }
}

export class InMemoryProjectRepository implements ProjectRepository {
  private readonly store = new Map<string, Project>()

  seed(project: Project): void {
    this.store.set(project.id, project)
  }

  clear(): void {
    this.store.clear()
  }

  async findById(id: string): Promise<Project | null> {
    return this.store.get(id) ?? null
  }

  async existsById(id: string): Promise<boolean> {
    return this.store.has(id)
  }

  async findAll(
    filters: ListProjectsFilters,
    pagination: PaginationParams,
    sort: SortParams,
  ): Promise<PaginatedResult<Project>> {
    let items = [...this.store.values()]
    if (filters.status !== undefined) {
      items = items.filter((p) => p.status === filters.status)
    }
    return paginate(items, sort, pagination)
  }

  async findAllWithTaskCount(
    filters: ListProjectsFilters,
    pagination: PaginationParams,
    sort: SortParams,
  ): Promise<PaginatedResult<ProjectWithTaskCount>> {
    let items = [...this.store.values()]
    if (filters.status !== undefined) {
      items = items.filter((p) => p.status === filters.status)
    }
    const withCount: ProjectWithTaskCount[] = items.map((p) => ({ ...p, taskCount: 0 }))
    return paginate(withCount, sort, pagination)
  }

  async create(data: CreateProjectData): Promise<Project> {
    const project: Project = {
      id: crypto.randomUUID(),
      name: data.name,
      description: data.description ?? null,
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    this.store.set(project.id, project)
    return project
  }

  async update(id: string, data: UpdateProjectData): Promise<Project> {
    const existing = this.store.get(id)
    if (existing === undefined) {
      throw new Error(`Project ${id} not found`)
    }
    const updated: Project = {
      ...existing,
      name: data.name,
      description: data.description,
      updatedAt: new Date(),
    }
    this.store.set(id, updated)
    return updated
  }

  async archive(id: string): Promise<Project> {
    const existing = this.store.get(id)
    if (existing === undefined) {
      throw new Error(`Project ${id} not found`)
    }
    const archived: Project = { ...existing, status: 'ARCHIVED', updatedAt: new Date() }
    this.store.set(id, archived)
    return archived
  }
}
