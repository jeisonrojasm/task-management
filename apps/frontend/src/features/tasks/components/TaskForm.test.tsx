import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { TaskForm } from './TaskForm'

const projectId = 'project-1'

describe('TaskForm', () => {
  it('renderiza los campos del formulario', () => {
    render(<TaskForm projectId={projectId} onSubmit={() => undefined} />)
    expect(screen.getByLabelText(/Título/)).toBeInTheDocument()
    expect(screen.getByLabelText('Descripción')).toBeInTheDocument()
    expect(screen.getByLabelText('Prioridad')).toBeInTheDocument()
    expect(screen.getByLabelText('Fecha de vencimiento')).toBeInTheDocument()
  })

  it('muestra error de validación y no hace submit cuando el título está vacío', async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()
    render(<TaskForm projectId={projectId} onSubmit={onSubmit} />)

    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    expect(await screen.findByText('El título es obligatorio')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('llama a onSubmit con los datos correctos cuando es válido', async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()
    render(<TaskForm projectId={projectId} onSubmit={onSubmit} />)

    await user.type(screen.getByLabelText(/Título/), 'Nueva tarea')
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    await waitFor(() => {
      // priority por defecto MEDIUM; description y dueDate vacíos se omiten.
      expect(onSubmit).toHaveBeenCalledWith({
        projectId,
        title: 'Nueva tarea',
        priority: 'MEDIUM',
      })
    })
  })

  it('el botón de submit queda deshabilitado cuando loading es true', () => {
    render(<TaskForm projectId={projectId} onSubmit={() => undefined} loading />)
    expect(screen.getByRole('button', { name: 'Guardar' })).toBeDisabled()
  })
})
