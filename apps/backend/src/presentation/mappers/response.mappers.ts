import type { ProjectOutput, ProjectWithStatsOutput } from '../../application/dtos/project.dto.js'
import type { TaskOutput, ProjectStatsOutput } from '../../application/dtos/task.dto.js'
import type { PaginatedResult } from '../../domain/shared-types.js'

export function mapProject(dto: ProjectOutput) {
  return {
    id: dto.id,
    name: dto.name,
    description: dto.description,
    status: dto.status,
    created_at: dto.createdAt,
    updated_at: dto.updatedAt,
  }
}

export function mapProjectWithStats(dto: ProjectWithStatsOutput) {
  return {
    id: dto.id,
    name: dto.name,
    description: dto.description,
    status: dto.status,
    task_count: dto.taskCount,
    created_at: dto.createdAt,
    updated_at: dto.updatedAt,
  }
}

export function mapTask(dto: TaskOutput) {
  return {
    id: dto.id,
    project_id: dto.projectId,
    title: dto.title,
    description: dto.description,
    status: dto.status,
    priority: dto.priority,
    due_date: dto.dueDate,
    is_overdue: dto.isOverdue,
    created_at: dto.createdAt,
    updated_at: dto.updatedAt,
  }
}

export function mapProjectStats(dto: ProjectStatsOutput) {
  return {
    project_id: dto.projectId,
    task_count: dto.taskCount,
    by_status: dto.byStatus,
    by_priority: dto.byPriority,
    overdue_count: dto.overdueCount,
    completion_rate: dto.completionRate,
    ai_insights:
      dto.aiInsights !== null
        ? {
            summary: dto.aiInsights.summary,
            recommendations: dto.aiInsights.recommendations,
            generated_at: dto.aiInsights.generatedAt,
          }
        : null,
  }
}

function mapPagination(p: PaginatedResult<unknown>['pagination']) {
  return {
    page: p.page,
    limit: p.limit,
    total: p.total,
    total_pages: p.totalPages,
    has_next: p.hasNext,
    has_prev: p.hasPrev,
  }
}

export function mapPaginated<TDto, TRes>(
  result: PaginatedResult<TDto>,
  mapItem: (dto: TDto) => TRes,
) {
  return {
    data: result.data.map(mapItem),
    pagination: mapPagination(result.pagination),
  }
}
