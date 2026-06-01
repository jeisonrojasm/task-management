import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'

import { DistributionChart } from './DistributionChart'

const colorMap = { TODO: 'bg-slate-400', DONE: 'bg-green-500' }

describe('DistributionChart', () => {
  it('renderiza una entrada por cada clave de la distribución', () => {
    render(<DistributionChart distribution={{ TODO: 2, DONE: 3 }} colorMap={colorMap} />)
    expect(screen.getByText('TODO')).toBeInTheDocument()
    expect(screen.getByText('DONE')).toBeInTheDocument()
    // total = 5 → TODO 40%, DONE 60%
    expect(screen.getByText('2 (40%)')).toBeInTheDocument()
    expect(screen.getByText('3 (60%)')).toBeInTheDocument()
  })

  it('muestra "Sin tareas aún" cuando el total es 0', () => {
    render(<DistributionChart distribution={{ TODO: 0, DONE: 0 }} colorMap={colorMap} />)
    expect(screen.getByText('Sin tareas aún')).toBeInTheDocument()
  })

  it('muestra el skeleton cuando loading es true', () => {
    const { container } = render(
      <DistributionChart distribution={{}} colorMap={colorMap} loading />,
    )
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })
})
