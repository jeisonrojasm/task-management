import axios, { type AxiosError } from 'axios'

const baseURL = import.meta.env['VITE_API_URL'] ?? 'http://localhost:3000'

export const apiClient = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
})

function toCamelCase(key: string): string {
  if (key === key.toUpperCase()) {
    return key
  }
  return key.replace(/_([a-z])/g, (_match: string, char: string) => char.toUpperCase())
}

function camelizeKeys(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(camelizeKeys)
  }
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [toCamelCase(k), camelizeKeys(v)]),
    )
  }
  return value
}

apiClient.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      const correlationId = response.headers['x-correlation-id']
      if (correlationId !== undefined) {
        console.info(`[correlation-id] ${correlationId}`)
      }
    }
    response.data = camelizeKeys(response.data)
    return response
  },
  (error: AxiosError<{ error: { code: string; message: string; details: unknown } }>) => {
    const apiError = error.response?.data?.error
    if (apiError !== undefined) {
      return Promise.reject(
        Object.assign(new Error(apiError.message), {
          code: apiError.code,
          details: apiError.details,
          status: error.response?.status,
        }),
      )
    }
    return Promise.reject(error)
  },
)
