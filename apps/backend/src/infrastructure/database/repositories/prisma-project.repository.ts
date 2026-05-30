import { type Prisma, type Project as PrismaProject } from '@prisma/client'

import prisma from '../prisma/client.js'

import type { Project } from '../../../domain/entities/project.entity.js'
import type {
  CreateProjectData,
  ListProjectsFilters,
  ProjectRepository,
  ProjectWithTaskCount,
  UpdateProjectData,
} from '../../../domain/repositories/project.repository.js'
import type { PaginatedResult, PaginationParams, SortParams } from '../../../domain/shared-types.js'

function mapProject(row: PrismaProject): Project {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    status: row.status,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

function buildWhere(filters: ListProjectsFilters): Prisma.ProjectWhereInput {
  return filters.status !== undefined ? { status: filters.status } : {}
}

function buildOrderBy(sort: string, order: 'asc' | 'desc'): Prisma.ProjectOrderByWithRelationInput {
  if (sort === 'name') {
    return { name: order }
  }
  if (sort === 'status') {
    return { status: order }
  }
  if (sort === 'updatedAt') {
    return { updatedAt: order }
  }
  return { createdAt: order }
}

function buildPaginationMeta(
  total: number,
  page: number,
  limit: number,
): PaginatedResult<never>['pagination'] {
  const totalPages = Math.ceil(total / limit)
  return { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 }
}

export class PrismaProjectRepository implements ProjectRepository {
  async findById(id: string): Promise<Project | null> {
    const row = await prisma.project.findUnique({ where: { id } })
    return row !== null ? mapProject(row) : null
  }

  async findAll(
    filters: ListProjectsFilters,
    pagination: PaginationParams,
    sort: SortParams,
  ): Promise<PaginatedResult<Project>> {
    const where = buildWhere(filters)
    const orderBy = buildOrderBy(sort.sort, sort.order)
    const skip = (pagination.page - 1) * pagination.limit
    const take = pagination.limit

    const [total, rows] = await prisma.$transaction([
      prisma.project.count({ where }),
      prisma.project.findMany({ where, skip, take, orderBy }),
    ])

    return {
      data: rows.map(mapProject),
      pagination: buildPaginationMeta(total, pagination.page, pagination.limit),
    }
  }

  async findAllWithTaskCount(
    filters: ListProjectsFilters,
    pagination: PaginationParams,
    sort: SortParams,
  ): Promise<PaginatedResult<ProjectWithTaskCount>> {
    const where = buildWhere(filters)
    const orderBy = buildOrderBy(sort.sort, sort.order)
    const skip = (pagination.page - 1) * pagination.limit
    const take = pagination.limit

    const [total, rows] = await prisma.$transaction([
      prisma.project.count({ where }),
      prisma.project.findMany({
        where,
        skip,
        take,
        orderBy,
        include: { _count: { select: { tasks: true } } },
      }),
    ])

    return {
      data: rows.map((row) => ({
        ...mapProject(row),
        taskCount: row._count.tasks,
      })),
      pagination: buildPaginationMeta(total, pagination.page, pagination.limit),
    }
  }

  async create(data: CreateProjectData): Promise<Project> {
    const row = await prisma.project.create({
      data: {
        name: data.name,
        description: data.description ?? null,
      },
    })
    return mapProject(row)
  }

  async update(id: string, data: UpdateProjectData): Promise<Project> {
    const row = await prisma.project.update({
      where: { id },
      data: { name: data.name, description: data.description },
    })
    return mapProject(row)
  }

  async archive(id: string): Promise<Project> {
    const row = await prisma.project.update({
      where: { id },
      data: { status: 'ARCHIVED' },
    })
    return mapProject(row)
  }

  async existsById(id: string): Promise<boolean> {
    const count = await prisma.project.count({ where: { id } })
    return count > 0
  }
}
