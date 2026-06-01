import { describe, expect, it } from 'vitest'
import { act, renderHook } from '@testing-library/react'

import { useTaskFilters } from './useTaskFilters'

describe('useTaskFilters', () => {
  it('estado inicial: status y priority undefined, page 1', () => {
    const { result } = renderHook(() => useTaskFilters())
    expect(result.current.status).toBeUndefined()
    expect(result.current.priority).toBeUndefined()
    expect(result.current.page).toBe(1)
  })

  it('setStatus actualiza el status y resetea la página a 1', () => {
    const { result } = renderHook(() => useTaskFilters())

    act(() => {
      result.current.setPage(5)
    })
    expect(result.current.page).toBe(5)

    act(() => {
      result.current.setStatus('DONE')
    })
    expect(result.current.status).toBe('DONE')
    expect(result.current.page).toBe(1)
  })

  it('setPriority actualiza la prioridad y resetea la página a 1', () => {
    const { result } = renderHook(() => useTaskFilters())

    act(() => {
      result.current.setPage(4)
    })
    act(() => {
      result.current.setPriority('HIGH')
    })

    expect(result.current.priority).toBe('HIGH')
    expect(result.current.page).toBe(1)
  })

  it('setPage actualiza la página', () => {
    const { result } = renderHook(() => useTaskFilters())
    act(() => {
      result.current.setPage(3)
    })
    expect(result.current.page).toBe(3)
  })

  it('reset limpia status, priority y vuelve a page 1', () => {
    const { result } = renderHook(() => useTaskFilters())

    act(() => {
      result.current.setStatus('IN_PROGRESS')
      result.current.setPriority('CRITICAL')
      result.current.setPage(8)
    })

    act(() => {
      result.current.reset()
    })

    expect(result.current.status).toBeUndefined()
    expect(result.current.priority).toBeUndefined()
    expect(result.current.page).toBe(1)
  })
})
