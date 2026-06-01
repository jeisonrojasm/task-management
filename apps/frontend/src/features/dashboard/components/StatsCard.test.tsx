import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ListChecks } from 'lucide-react'

import { StatsCard } from './StatsCard'

describe('StatsCard', () => {
  it('renderiza el valor y el título', () => {
    render(<StatsCard title="Total de tareas" value={42} />)
    expect(screen.getByText('Total de tareas')).toBeInTheDocument()
    expect(screen.getByText('42')).toBeInTheDocument()
  })

  it('renderiza el subtítulo cuando se provee', () => {
    render(<StatsCard title="Total" value={1} subtitle="esta semana" />)
    expect(screen.getByText('esta semana')).toBeInTheDocument()
  })

  it('renderiza el ícono cuando se provee', () => {
    const { container } = render(<StatsCard title="Total" value={1} icon={ListChecks} />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })
})
