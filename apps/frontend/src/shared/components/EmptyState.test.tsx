import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { EmptyState } from './EmptyState'

describe('EmptyState', () => {
  it('renderiza título y descripción', () => {
    render(<EmptyState title="Sin proyectos" description="Aún no hay nada aquí" />)
    expect(screen.getByText('Sin proyectos')).toBeInTheDocument()
    expect(screen.getByText('Aún no hay nada aquí')).toBeInTheDocument()
  })

  it('renderiza el botón de acción cuando se provee action', () => {
    render(
      <EmptyState
        title="Sin proyectos"
        action={{ label: 'Crear proyecto', onClick: () => undefined }}
      />,
    )
    expect(screen.getByRole('button', { name: 'Crear proyecto' })).toBeInTheDocument()
  })

  it('el botón de acción llama a onClick al hacer click', async () => {
    const onClick = vi.fn()
    const user = userEvent.setup()
    render(<EmptyState title="Sin proyectos" action={{ label: 'Crear proyecto', onClick }} />)
    await user.click(screen.getByRole('button', { name: 'Crear proyecto' }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('no renderiza botón si no se provee action', () => {
    render(<EmptyState title="Sin proyectos" />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
