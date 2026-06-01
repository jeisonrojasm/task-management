import OpenAI from 'openai'
import { z } from 'zod'

import type {
  AIInsights,
  AIProvider,
  ProjectInsightContext,
} from '../../domain/services/ai-provider.js'

const FALLBACK_INSIGHTS: AIInsights = {
  summary: 'Los insights de IA no están disponibles temporalmente.',
  recommendations: [],
  generatedAt: new Date(),
}

const aiResponseSchema = z.object({
  summary: z.string(),
  recommendations: z.array(z.string()),
})

const SYSTEM_PROMPT = `Eres un asistente de gestión de proyectos de software.
Dado un conjunto de métricas sobre un proyecto, responde con un objeto JSON que contenga:
- "summary": un análisis conciso de 2 a 3 oraciones sobre el estado actual y el progreso del proyecto
- "recommendations": un array de 2 a 4 recomendaciones cortas y accionables para el equipo
Responde ÚNICAMENTE con JSON válido. Sin markdown, sin bloques de código, sin texto adicional.`

function buildUserPrompt(ctx: ProjectInsightContext): string {
  return JSON.stringify(
    {
      project_name: ctx.projectName,
      task_count: ctx.taskCount,
      completion_rate: ctx.completionRate,
      overdue_count: ctx.overdueCount,
      by_status: ctx.byStatus,
      by_priority: ctx.byPriority,
    },
    null,
    2,
  )
}

function isRetryableError(error: unknown): boolean {
  if (error instanceof OpenAI.APIConnectionError) {
    return true
  }
  if (error instanceof OpenAI.APIError && error.status >= 500) {
    return true
  }
  return false
}

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))

export class OpenAIProvider implements AIProvider {
  private readonly client: OpenAI

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey })
  }

  async generateProjectInsights(context: ProjectInsightContext): Promise<AIInsights> {
    try {
      const content = await this.callWithRetry(context)
      const parsed: unknown = JSON.parse(content)
      const result = aiResponseSchema.safeParse(parsed)
      if (!result.success) {
        return { ...FALLBACK_INSIGHTS, generatedAt: new Date() }
      }
      return { ...result.data, generatedAt: new Date() }
    } catch {
      return { ...FALLBACK_INSIGHTS, generatedAt: new Date() }
    }
  }

  private async callWithRetry(context: ProjectInsightContext): Promise<string> {
    try {
      return await this.callAPI(context)
    } catch (error) {
      if (isRetryableError(error)) {
        await sleep(1000)
        return this.callAPI(context)
      }
      throw error
    }
  }

  private async callAPI(context: ProjectInsightContext): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: buildUserPrompt(context) },
      ],
      response_format: { type: 'json_object' },
    })

    const firstChoice = response.choices[0]
    const content = firstChoice?.message.content
    if (content === null || content === undefined) {
      throw new Error('Empty response received from OpenAI API')
    }
    return content
  }
}
