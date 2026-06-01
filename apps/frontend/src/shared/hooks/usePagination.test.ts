import { describe, expect, it } from 'vitest'
import { act, renderHook } from '@testing-library/react'

import { usePagination } from './usePagination'

describe('usePagination', () => {
  it('usa los valores por defecto (page 1, limit 10) cuando no se pasan args', () => {
    const { result } = renderHook(() => usePagination())
    expect(result.current.page).toBe(1)
    expect(result.current.limit).toBe(10)
  })

  it('respeta los valores iniciales provistos', () => {
    const { result } = renderHook(() => usePagination(2, 20))
    expect(result.current.page).toBe(2)
    expect(result.current.limit).toBe(20)
  })

  it('setPage y setLimit actualizan el estado', () => {
    const { result } = renderHook(() => usePagination(2, 20))

    act(() => {
      result.current.setPage(5)
    })
    expect(result.current.page).toBe(5)

    act(() => {
      result.current.setLimit(50)
    })
    expect(result.current.limit).toBe(50)
  })

  it('reset vuelve a los valores iniciales', () => {
    const { result } = renderHook(() => usePagination(2, 20))

    act(() => {
      result.current.setPage(7)
      result.current.setLimit(99)
    })
    expect(result.current.page).toBe(7)
    expect(result.current.limit).toBe(99)

    act(() => {
      result.current.reset()
    })
    expect(result.current.page).toBe(2)
    expect(result.current.limit).toBe(20)
  })
})
