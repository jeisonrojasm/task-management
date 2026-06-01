import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { http, HttpResponse, delay } from 'msw'

import { AIInsightsPanel } from './AIInsightsPanel'

import { server } from '@/test/server'
import { mockStats } from '@/test/handlers'
import { renderWithProviders } from '@/test/renderWithProviders'

const projectId = 'project-1'

function renderPanel() {
  return renderWithProviders(<AIInsightsPanel projectId={projectId} />)
}

describe('AIInsightsPanel (estados async)', () => {
  it('muestra el skeleton de loading mientras la query está pendiente', () => {
    server.use(
      http.get('/api/v1/projects/:projectId/stats', async () => {
        await delay(100)
        return HttpResponse.json({ data: mockStats })
      }),
    )
    renderPanel()
    expect(screen.getByText('Generando análisis...')).toBeInTheDocument()
  })

  it('muestra el summary y las recommendations cuando hay aiInsights', async () => {
    renderPanel()
    expect(await screen.findByText(mockStats.ai_insights.summary)).toBeInTheDocument()
    expect(screen.getByText('Priorizar la tarea crítica pendiente')).toBeInTheDocument()
    expect(screen.getByText('Revisar las tareas vencidas')).toBeInTheDocument()
  })

  it('muestra el mensaje de "no disponible" cuando aiInsights es null', async () => {
    server.use(
      http.get('/api/v1/projects/:projectId/stats', () =>
        HttpResponse.json({ data: { ...mockStats, ai_insights: null } }),
      ),
    )
    renderPanel()
    expect(
      await screen.findByText('Análisis aún no disponibles para este proyecto'),
    ).toBeInTheDocument()
  })

  it('muestra el error inline con botón de reintento cuando la query falla', async () => {
    server.use(
      http.get('/api/v1/projects/:projectId/stats', () => new HttpResponse(null, { status: 500 })),
    )
    renderPanel()
    expect(
      await screen.findByText('Los análisis de IA no están disponibles temporalmente'),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Intentar de nuevo' })).toBeInTheDocument()
  })
})
