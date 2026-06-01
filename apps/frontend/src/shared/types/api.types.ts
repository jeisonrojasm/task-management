export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: PaginationMeta
}

export interface ApiError {
  code: string
  message: string
  details: Record<string, string[]> | null
}

export interface ApiErrorResponse {
  error: ApiError
}
