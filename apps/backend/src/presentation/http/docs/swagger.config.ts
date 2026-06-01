import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

import swaggerJsdoc from 'swagger-jsdoc'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Task Manager API',
      version: '1.0.0',
      description:
        'REST API for managing projects and tasks. Supports pagination, filtering, status transitions, and AI-generated project insights.',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Local development server',
      },
    ],
  },
  apis: [
    join(__dirname, 'swagger.components.{ts,js}'),
    join(__dirname, '../routes/project.routes.{ts,js}'),
    join(__dirname, '../routes/task.routes.{ts,js}'),
  ],
}

export const swaggerSpec = swaggerJsdoc(options)
