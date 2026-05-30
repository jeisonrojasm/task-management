/*
 * What a production AI provider would implement beyond this mock:
 *
 * - Prompt engineering: a versioned system prompt with explicit role, output format constraints,
 *   few-shot examples, and chain-of-thought instructions to improve reliability.
 * - Token counting: estimate prompt tokens before sending to avoid context-length errors and
 *   to select the cheapest model tier that fits within the budget.
 * - Retry logic: exponential backoff on transient 5xx and rate-limit (429) responses,
 *   with jitter to avoid thundering-herd when multiple requests fail simultaneously.
 * - Cost tracking: log the estimated USD cost per request using the model's pricing table
 *   and aggregate totals per project/user for billing and anomaly detection.
 * - Response caching: cache stable insights keyed by a fingerprint of the task distribution,
 *   invalidated when project tasks change, to avoid redundant API calls.
 * - Streaming: stream response tokens and flush them to the client progressively,
 *   reducing perceived latency for users waiting on LLM output.
 */

import type {
  AIInsights,
  AIProvider,
  ProjectInsightContext,
} from '../../domain/services/ai-provider.js'

const LATENCY_MIN_MS = 600
const LATENCY_MAX_MS = 1200

function simulateLatency(): Promise<void> {
  const delay = LATENCY_MIN_MS + Math.random() * (LATENCY_MAX_MS - LATENCY_MIN_MS)
  return new Promise((resolve) => setTimeout(resolve, delay))
}

function buildSummary(ctx: ProjectInsightContext): string {
  const pct = Math.round(ctx.completionRate * 100)
  const taskWord = ctx.taskCount === 1 ? 'tarea' : 'tareas'
  const overdueClause =
    ctx.overdueCount > 0
      ? ` ${ctx.overdueCount} ${ctx.overdueCount === 1 ? 'tarea está vencida' : 'tareas están vencidas'}.`
      : ''

  return (
    `El proyecto "${ctx.projectName}" tiene ${ctx.taskCount} ${taskWord} con una tasa de completitud del ${pct}%.${overdueClause} ` +
    `Distribución de estados: ${ctx.byStatus.DONE} completadas, ${ctx.byStatus.IN_PROGRESS} en progreso, ` +
    `${ctx.byStatus.IN_REVIEW} en revisión, ${ctx.byStatus.TODO} pendientes, ${ctx.byStatus.CANCELLED} canceladas.`
  )
}

function buildRecommendations(ctx: ProjectInsightContext): string[] {
  const recs: string[] = []

  if (ctx.byPriority.CRITICAL > 0) {
    const word = ctx.byPriority.CRITICAL === 1 ? 'tarea' : 'tareas'
    recs.push(
      `Prioriza ${ctx.byPriority.CRITICAL} ${word} de prioridad CRÍTICA — representan el mayor riesgo para la entrega.`,
    )
  }

  if (ctx.overdueCount > 0) {
    const word = ctx.overdueCount === 1 ? 'tarea vencida' : 'tareas vencidas'
    recs.push(
      `Revisa y reprograma ${ctx.overdueCount} ${word} para recuperar la integridad del cronograma.`,
    )
  }

  if (ctx.completionRate < 0.3) {
    recs.push(
      'La tasa de completitud es inferior al 30%. Considera revisar el alcance del proyecto o desbloquear el trabajo en curso.',
    )
  } else if (ctx.completionRate > 0.8) {
    recs.push(
      'El proyecto supera el 80% de completitud. Comienza a planificar el siguiente sprint y documenta las lecciones aprendidas.',
    )
  }

  const generalFallbacks = [
    'Mantén el ritmo actual y actualiza los estados de las tareas para reflejar el progreso real.',
    'Agenda una sincronización breve del equipo para alinear prioridades y desbloquear trabajo pendiente.',
  ]
  for (const rec of generalFallbacks) {
    if (recs.length >= 2) {
      break
    }
    recs.push(rec)
  }

  return recs.slice(0, 3)
}

export class MockAIProvider implements AIProvider {
  async generateProjectInsights(context: ProjectInsightContext): Promise<AIInsights> {
    await simulateLatency()

    return {
      summary: buildSummary(context),
      recommendations: buildRecommendations(context),
      generatedAt: new Date(),
    }
  }
}
