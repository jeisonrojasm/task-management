import { useState } from 'react'

export function usePagination(
  initialPage: number = 1,
  initialLimit: number = 10,
): {
  page: number
  limit: number
  setPage: (page: number) => void
  setLimit: (limit: number) => void
  reset: () => void
} {
  const [page, setPage] = useState(initialPage)
  const [limit, setLimit] = useState(initialLimit)

  function reset(): void {
    setPage(initialPage)
    setLimit(initialLimit)
  }

  return { page, limit, setPage, setLimit, reset }
}
