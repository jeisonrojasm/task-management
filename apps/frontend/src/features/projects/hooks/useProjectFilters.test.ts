import { describe, expect, it } from 'vitest'
import { act, renderHook } from '@testing-library/react'

import { useProjectFilters } from './useProjectFilters'

describe('useProjectFilters', () => {
  it('estado inicial: status ACTIVE y page 1', () => {
    const { result } = renderHook(() => useProjectFilters())
    expect(result.current.status).toBe('ACTIVE')
    expect(result.current.page).toBe(1)
  })

  it('setStatus cambia el status sin afectar la página', () => {
    const { result } = renderHook(() => useProjectFilters())

    act(() => {
      result.current.setPage(3)
    })
    act(() => {
      result.current.setStatus('ARCHIVED')
    })

    expect(result.current.status).toBe('ARCHIVED')
    expect(result.current.page).toBe(3)
  })

  it('setPage actualiza la página', () => {
    const { result } = renderHook(() => useProjectFilters())
    act(() => {
      result.current.setPage(4)
    })
    expect(result.current.page).toBe(4)
  })

  it('reset vuelve a status ACTIVE y page 1', () => {
    const { result } = renderHook(() => useProjectFilters())

    act(() => {
      result.current.setStatus('ARCHIVED')
      result.current.setPage(5)
    })
    expect(result.current.status).toBe('ARCHIVED')
    expect(result.current.page).toBe(5)

    act(() => {
      result.current.reset()
    })
    expect(result.current.status).toBe('ACTIVE')
    expect(result.current.page).toBe(1)
  })
})
