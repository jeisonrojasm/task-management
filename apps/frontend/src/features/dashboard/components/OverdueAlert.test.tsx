import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'

import { OverdueAlert } from './OverdueAlert'

describe('OverdueAlert', () => {
  it('no renderiza nada cuando overdueCount es 0', () => {
    const { container } = render(<OverdueAlert overdueCount={0} />)
    expect(container.firstChild).toBeNull()
  })

  it('usa singular cuando hay exactamente 1 tarea vencida', () => {
    render(<OverdueAlert overdueCount={1} />)
    expect(screen.getByText('1 tarea vencida')).toBeInTheDocument()
  })

  it('usa plural cuando hay más de 1 tarea vencida', () => {
    render(<OverdueAlert overdueCount={3} />)
    expect(screen.getByText('3 tareas vencidas')).toBeInTheDocument()
  })
})
