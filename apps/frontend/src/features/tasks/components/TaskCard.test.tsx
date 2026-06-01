import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { TaskCard } from './TaskCard'

import type { Task } from '../types'

const baseTask: Task = {
  id: 'task-1',
  projectId: 'project-1',
  title: 'Implementar autenticación',
  description: 'Login con JWT',
  status: 'TODO',
  priority: 'HIGH',
  dueDate: '2026-03-01',
  isOverdue: false,
  createdAt: '2026-01-11T08:00:00.000Z',
  updatedAt: '2026-01-11T08:00:00.000Z',
}

function renderCard(overrides: Partial<Task> = {}) {
  const onStatusChange = vi.fn()
  const onDelete = vi.fn()
  render(
    <TaskCard
      task={{ ...baseTask, ...overrides }}
      onStatusChange={onStatusChange}
      onDelete={onDelete}
    />,
  )
  return { onStatusChange, onDelete }
}

describe('TaskCard', () => {
  it('renderiza título, status badge y priority badge', () => {
    renderCard()
    expect(screen.getByText('Implementar autenticación')).toBeInTheDocument()
    expect(screen.getByText('Pendiente')).toBeInTheDocument() // status TODO
    expect(screen.getByText('Alta')).toBeInTheDocument() // priority HIGH
  })

  it('muestra el indicador de overdue cuando isOverdue es true y hay dueDate', () => {
    renderCard({ isOverdue: true })
    expect(screen.getByText(/⚠/)).toBeInTheDocument()
  })

  it('no muestra el indicador de overdue cuando isOverdue es false', () => {
    renderCard({ isOverdue: false })
    expect(screen.queryByText(/⚠/)).not.toBeInTheDocument()
  })

  it('llama a onStatusChange con el nuevo status al seleccionar una transición válida', async () => {
    const user = userEvent.setup()
    const { onStatusChange } = renderCard({ status: 'TODO' })

    // El trigger del dropdown es el único botón con aria-expanded (Radix).
    await user.click(screen.getByRole('button', { expanded: false }))
    // TODO permite IN_PROGRESS ('En progreso') y CANCELLED ('Cancelada').
    await user.click(await screen.findByText('En progreso'))

    expect(onStatusChange).toHaveBeenCalledWith('task-1', 'IN_PROGRESS')
  })

  it('solo muestra transiciones válidas: una tarea DONE no expone el menú de transición', () => {
    renderCard({ status: 'DONE' })
    // DONE no tiene transiciones válidas → no se renderiza el trigger del dropdown.
    expect(screen.queryByRole('button', { expanded: false })).not.toBeInTheDocument()
  })
})
