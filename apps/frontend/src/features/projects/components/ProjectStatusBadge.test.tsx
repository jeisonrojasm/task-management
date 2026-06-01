import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'

import { ProjectStatusBadge } from './ProjectStatusBadge'

describe('ProjectStatusBadge', () => {
  it('renderiza "Activo" para status ACTIVE', () => {
    render(<ProjectStatusBadge status="ACTIVE" />)
    expect(screen.getByText('Activo')).toBeInTheDocument()
  })

  it('renderiza "Archivado" para status ARCHIVED', () => {
    render(<ProjectStatusBadge status="ARCHIVED" />)
    expect(screen.getByText('Archivado')).toBeInTheDocument()
  })
})
