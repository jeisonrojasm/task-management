import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

import { ErrorBoundary } from './ErrorBoundary'

function Bomb(): never {
  throw new Error('boom')
}

describe('ErrorBoundary', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renderiza children cuando no hay error', () => {
    render(
      <ErrorBoundary>
        <p>contenido ok</p>
      </ErrorBoundary>,
    )
    expect(screen.getByText('contenido ok')).toBeInTheDocument()
  })

  it('renderiza el fallback cuando un hijo lanza una excepción', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    render(
      <ErrorBoundary fallback={<p>fallback personalizado</p>}>
        <Bomb />
      </ErrorBoundary>,
    )
    expect(screen.getByText('fallback personalizado')).toBeInTheDocument()
  })

  it('renderiza un PageError genérico si no se provee fallback', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>,
    )
    expect(screen.getByText('Algo salió mal.')).toBeInTheDocument()
  })
})
