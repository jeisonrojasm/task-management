import { type Prisma, type Task as PrismaTask } from '@prisma/client'

import { PRIORITY_VALUES, type Priority } from '../../../domain/value-objects/priority.js'
import { TASK_STATUS_VALUES, type TaskStatus } from '../../../domain/value-objects/task-status.js'
import prisma from '../prisma/client.js'

import type { Task } from '../../../domain/entities/task.entity.js'
import type {
  CreateTaskData,
  ListTasksFilters,
  TaskRepository,
  UpdateTaskData,
} from '../../../domain/repositories/task.repository.js'
import type { PaginatedResult, PaginationParams, SortParams } from '../../../domain/shared-types.js'

function mapTask(row: PrismaTask): Task {
  return {
    id: row.id,
    projectId: row.projectId,
    title: row.title,
    description: row.description,
    status: row.status,
    priority: row.priority,
    dueDate: row.dueDate,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

function buildTaskWhere(projectId: string, filters: ListTasksFilters): Prisma.TaskWhereInput {
  return {
    projectId,
    ...(filters.status !== undefined && { status: filters.status }),
    ...(filters.priority !== undefined && { priority: filters.priority }),
  }
}

function buildTaskOrderBy(
  sort: string,
  order: 'asc' | 'desc',
): Prisma.TaskOrderByWithRelationInput {
  if (sort === 'title') {
    return { title: order }
  }
  if (sort === 'status') {
    return { status: order }
  }
  if (sort === 'priority') {
    return { priority: order }
  }
  if (sort === 'dueDate') {
    return { dueDate: order }
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

export class PrismaTaskRepository implements TaskRepository {
  async findById(id: string): Promise<Task | null> {
    const row = await prisma.task.findUnique({ where: { id } })
    return row !== null ? mapTask(row) : null
  }

  async findByProjectId(
    projectId: string,
    filters: ListTasksFilters,
    pagination: PaginationParams,
    sort: SortParams,
  ): Promise<PaginatedResult<Task>> {
    const where = buildTaskWhere(projectId, filters)
    const orderBy = buildTaskOrderBy(sort.sort, sort.order)
    const skip = (pagination.page - 1) * pagination.limit
    const take = pagination.limit

    const [total, rows] = await prisma.$transaction([
      prisma.task.count({ where }),
      prisma.task.findMany({ where, skip, take, orderBy }),
    ])

    return {
      data: rows.map(mapTask),
      pagination: buildPaginationMeta(total, pagination.page, pagination.limit),
    }
  }

  async create(data: CreateTaskData): Promise<Task> {
    const row = await prisma.task.create({
      data: {
        projectId: data.projectId,
        title: data.title,
        description: data.description ?? null,
        ...(data.priority !== undefined && { priority: data.priority }),
        dueDate: data.dueDate ?? null,
      },
    })
    return mapTask(row)
  }

  async update(id: string, data: UpdateTaskData): Promise<Task> {
    const row = await prisma.task.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        priority: data.priority,
        dueDate: data.dueDate,
      },
    })
    return mapTask(row)
  }

  async updateStatus(id: string, status: TaskStatus): Promise<Task> {
    const row = await prisma.task.update({
      where: { id },
      data: { status },
    })
    return mapTask(row)
  }

  async delete(id: string): Promise<void> {
    await prisma.task.delete({ where: { id } })
  }

  async countByProjectId(projectId: string): Promise<number> {
    return prisma.task.count({ where: { projectId } })
  }

  async getStatusDistribution(projectId: string): Promise<Record<TaskStatus, number>> {
    const groups = await prisma.task.groupBy({
      by: ['status'],
      where: { projectId },
      _count: { _all: true },
    })

    const result: Record<TaskStatus, number> = {
      TODO: 0,
      IN_PROGRESS: 0,
      IN_REVIEW: 0,
      DONE: 0,
      CANCELLED: 0,
    }

    for (const status of TASK_STATUS_VALUES) {
      const group = groups.find((g) => g.status === status)
      result[status] = group?._count._all ?? 0
    }

    return result
  }

  async getPriorityDistribution(projectId: string): Promise<Record<Priority, number>> {
    const groups = await prisma.task.groupBy({
      by: ['priority'],
      where: { projectId },
      _count: { _all: true },
    })

    const result: Record<Priority, number> = {
      LOW: 0,
      MEDIUM: 0,
      HIGH: 0,
      CRITICAL: 0,
    }

    for (const priority of PRIORITY_VALUES) {
      const group = groups.find((g) => g.priority === priority)
      result[priority] = group?._count._all ?? 0
    }

    return result
  }

  async getOverdueCount(projectId: string): Promise<number> {
    return prisma.task.count({
      where: {
        projectId,
        dueDate: { lt: new Date() },
        status: { notIn: ['DONE', 'CANCELLED'] },
      },
    })
  }
}
