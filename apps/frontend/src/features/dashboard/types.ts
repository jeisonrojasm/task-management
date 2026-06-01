export interface ProjectStats {
  projectId: string
  taskCount: number
  byStatus: Record<string, number>
  byPriority: Record<string, number>
  overdueCount: number
  completionRate: number
  aiInsights: {
    summary: string
    recommendations: string[]
    generatedAt: string
  } | null
}
