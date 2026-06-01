import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'

import { CompletionRateCard } from './CompletionRateCard'

describe('CompletionRateCard', () => {
  it('renderiza el título y el porcentaje redondeado', () => {
    render(<CompletionRateCard rate={0.4} />)
    expect(screen.getByText('Completitud')).toBeInTheDocument()
    expect(screen.getByText('40%')).toBeInTheDocument()
  })

  it('redondea correctamente valores intermedios', () => {
    render(<CompletionRateCard rate={0.666} />)
    expect(screen.getByText('67%')).toBeInTheDocument()
  })

  it('renderiza el rango alto (>= 70%)', () => {
    render(<CompletionRateCard rate={0.85} />)
    expect(screen.getByText('85%')).toBeInTheDocument()
  })

  it('renderiza el rango bajo (< 40%)', () => {
    render(<CompletionRateCard rate={0.1} />)
    expect(screen.getByText('10%')).toBeInTheDocument()
  })
})
