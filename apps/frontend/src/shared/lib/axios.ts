import axios, { type AxiosError } from 'axios'

const baseURL = import.meta.env['VITE_API_URL'] ?? 'http://localhost:3000'

export const apiClient = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      const correlationId = response.headers['x-correlation-id']
      if (correlationId !== undefined) {
        console.info(`[correlation-id] ${correlationId}`)
      }
    }
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
