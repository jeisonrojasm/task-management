import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ProjectForm } from './ProjectForm'

describe('ProjectForm', () => {
  it('renderiza los campos del formulario', () => {
    render(<ProjectForm onSubmit={() => undefined} />)
    expect(screen.getByLabelText('Nombre')).toBeInTheDocument()
    expect(screen.getByLabelText('Descripción')).toBeInTheDocument()
  })

  it('muestra error de validación y no hace submit cuando name está vacío', async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()
    render(<ProjectForm onSubmit={onSubmit} />)

    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    expect(await screen.findByText('El nombre es requerido')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('llama a onSubmit con los datos correctos cuando el formulario es válido', async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()
    render(<ProjectForm onSubmit={onSubmit} />)

    await user.type(screen.getByLabelText('Nombre'), 'Proyecto nuevo')
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({ name: 'Proyecto nuevo' })
    })
  })

  it('el botón de submit muestra estado de loading (deshabilitado) cuando loading es true', () => {
    render(<ProjectForm onSubmit={() => undefined} loading />)
    expect(screen.getByRole('button', { name: 'Guardar' })).toBeDisabled()
  })
})
