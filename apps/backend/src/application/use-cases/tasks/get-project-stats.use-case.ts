import { ProjectNotFoundError } from '../../../domain/errors/project-not-found.error.js'
import { type ProjectStatsOutput } from '../../dtos/task.dto.js'

import type { ProjectRepository } from '../../../domain/repositories/project.repository.js'
import type { TaskRepository } from '../../../domain/repositories/task.repository.js'
import type { AIProvider } from '../../../domain/services/ai-provider.js'

export class GetProjectStatsUseCase {
  constructor(
    private readonly projectRepository: ProjectRepository,
    private readonly taskRepository: TaskRepository,
    private readonly aiProvider: AIProvider,
  ) {}

  async execute(input: { projectId: string }): Promise<ProjectStatsOutput> {
    const project = await this.projectRepository.findById(input.projectId)

    if (project === null) {
      throw new ProjectNotFoundError(input.projectId)
    }

    const [taskCount, byStatus, byPriority, overdueCount] = await Promise.all([
      this.taskRepository.countByProjectId(input.projectId),
      this.taskRepository.getStatusDistribution(input.projectId),
      this.taskRepository.getPriorityDistribution(input.projectId),
      this.taskRepository.getOverdueCount(input.projectId),
    ])

    const completionRate = taskCount > 0 ? (byStatus['DONE'] ?? 0) / taskCount : 0

    const insights = await this.aiProvider.generateProjectInsights({
      projectName: project.name,
      taskCount,
      byStatus,
      byPriority,
      overdueCount,
      completionRate,
    })

    const aiInsights: ProjectStatsOutput['aiInsights'] = {
      summary: insights.summary,
      recommendations: insights.recommendations,
      generatedAt: insights.generatedAt.toISOString(),
    }

    return {
      projectId: input.projectId,
      taskCount,
      byStatus,
      byPriority,
      overdueCount,
      completionRate,
      aiInsights,
    }
  }
}
