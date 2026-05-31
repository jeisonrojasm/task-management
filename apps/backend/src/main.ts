import 'dotenv/config'

import { z } from 'zod'
import express, { type Request, type Response } from 'express'
import helmet from 'helmet'
import cors from 'cors'
import swaggerUi from 'swagger-ui-express'

import { logger } from './infrastructure/config/logger.js'
import prisma from './infrastructure/database/prisma/client.js'
import {
  PrismaProjectRepository,
  PrismaTaskRepository,
} from './infrastructure/database/repositories/index.js'
import { MockAIProvider, OpenAIProvider } from './infrastructure/ai/index.js'
import { CreateProjectUseCase } from './application/use-cases/projects/create-project.use-case.js'
import { GetProjectUseCase } from './application/use-cases/projects/get-project.use-case.js'
import { ListProjectsUseCase } from './application/use-cases/projects/list-projects.use-case.js'
import { UpdateProjectUseCase } from './application/use-cases/projects/update-project.use-case.js'
import { ArchiveProjectUseCase } from './application/use-cases/projects/archive-project.use-case.js'
import { GetProjectStatsUseCase } from './application/use-cases/tasks/get-project-stats.use-case.js'
import { CreateTaskUseCase } from './application/use-cases/tasks/create-task.use-case.js'
import { GetTaskUseCase } from './application/use-cases/tasks/get-task.use-case.js'
import { UpdateTaskUseCase } from './application/use-cases/tasks/update-task.use-case.js'
import { DeleteTaskUseCase } from './application/use-cases/tasks/delete-task.use-case.js'
import { UpdateTaskStatusUseCase } from './application/use-cases/tasks/update-task-status.use-case.js'
import { ListProjectTasksUseCase } from './application/use-cases/tasks/list-project-tasks.use-case.js'
import { ProjectController } from './presentation/http/controllers/project.controller.js'
import { TaskController } from './presentation/http/controllers/task.controller.js'
import { createProjectRouter } from './presentation/http/routes/project.routes.js'
import { createTaskRouter } from './presentation/http/routes/task.routes.js'
import { correlationIdMiddleware } from './presentation/http/middlewares/correlation-id.middleware.js'
import { requestLoggerMiddleware } from './presentation/http/middlewares/request-logger.middleware.js'
import { globalRateLimiter } from './presentation/http/middlewares/rate-limiter.middleware.js'
import { errorHandlerMiddleware } from './presentation/http/middlewares/error-handler.middleware.js'
import { swaggerSpec } from './presentation/http/docs/swagger.config.js'

// ---------------------------------------------------------------------------
// 1. Validate environment variables
// ---------------------------------------------------------------------------

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().url(),
  ALLOWED_ORIGINS: z.string(),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000),
  RATE_LIMIT_MAX_GLOBAL: z.coerce.number().default(1000),
  RATE_LIMIT_MAX_WRITE: z.coerce.number().default(100),
  OPENAI_API_KEY: z.string().optional(),
  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error']).default('info'),
})

const envResult = EnvSchema.safeParse(process.env)

if (!envResult.success) {
  const errors = envResult.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`)
  logger.error({ errors }, 'Invalid environment variables — server will not start')
  process.exit(1)
}

const env = envResult.data

// ---------------------------------------------------------------------------
// 2. Resolve AI provider
// ---------------------------------------------------------------------------

const aiProvider =
  env.OPENAI_API_KEY !== undefined ? new OpenAIProvider(env.OPENAI_API_KEY) : new MockAIProvider()

// ---------------------------------------------------------------------------
// 3. Instantiate repositories
// ---------------------------------------------------------------------------

const projectRepository = new PrismaProjectRepository()
const taskRepository = new PrismaTaskRepository()

// ---------------------------------------------------------------------------
// 4. Instantiate use cases
// ---------------------------------------------------------------------------

const listProjectsUseCase = new ListProjectsUseCase(projectRepository)
const getProjectUseCase = new GetProjectUseCase(projectRepository)
const createProjectUseCase = new CreateProjectUseCase(projectRepository)
const updateProjectUseCase = new UpdateProjectUseCase(projectRepository)
const archiveProjectUseCase = new ArchiveProjectUseCase(projectRepository)
const getProjectStatsUseCase = new GetProjectStatsUseCase(
  projectRepository,
  taskRepository,
  aiProvider,
)

const createTaskUseCase = new CreateTaskUseCase(projectRepository, taskRepository)
const getTaskUseCase = new GetTaskUseCase(taskRepository)
const updateTaskUseCase = new UpdateTaskUseCase(taskRepository)
const deleteTaskUseCase = new DeleteTaskUseCase(taskRepository)
const updateTaskStatusUseCase = new UpdateTaskStatusUseCase(taskRepository)
const listProjectTasksUseCase = new ListProjectTasksUseCase(projectRepository, taskRepository)

// ---------------------------------------------------------------------------
// 5. Instantiate controllers
// ---------------------------------------------------------------------------

const projectController = new ProjectController(
  listProjectsUseCase,
  getProjectUseCase,
  createProjectUseCase,
  updateProjectUseCase,
  archiveProjectUseCase,
  getProjectStatsUseCase,
)

const taskController = new TaskController(
  createTaskUseCase,
  getTaskUseCase,
  updateTaskUseCase,
  deleteTaskUseCase,
  updateTaskStatusUseCase,
  listProjectTasksUseCase,
)

// ---------------------------------------------------------------------------
// 6. Build Express app
// ---------------------------------------------------------------------------

const app = express()

// ---------------------------------------------------------------------------
// 7. Register middlewares in order
// ---------------------------------------------------------------------------

app.use(helmet())
app.use(correlationIdMiddleware)
app.use(
  cors({
    origin: env.ALLOWED_ORIGINS.split(',').map((o) => o.trim()),
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Correlation-ID'],
  }),
)
app.use(express.json())
app.use(requestLoggerMiddleware)
app.use(globalRateLimiter)

// ---------------------------------------------------------------------------
// 8. Mount routers
// ---------------------------------------------------------------------------

app.use('/api/v1/projects', createProjectRouter(projectController, taskController))
app.use('/api/v1/tasks', createTaskRouter(taskController))

// ---------------------------------------------------------------------------
// 9. Swagger UI (non-production only)
// ---------------------------------------------------------------------------

if (env.NODE_ENV !== 'production') {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
  logger.info('Swagger UI available at /api/docs')
}

// ---------------------------------------------------------------------------
// 10. 404 handler
// ---------------------------------------------------------------------------

app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found.`,
      details: null,
    },
  })
})

// ---------------------------------------------------------------------------
// 11. Error handler (must be last)
// ---------------------------------------------------------------------------

app.use(errorHandlerMiddleware)

// ---------------------------------------------------------------------------
// 12. Start server
// ---------------------------------------------------------------------------

async function bootstrap(): Promise<void> {
  await prisma.$connect()
  logger.info('Database connected')

  app.listen(env.PORT, () => {
    logger.info({ port: env.PORT, env: env.NODE_ENV }, 'Server started')
  })
}

bootstrap().catch((err: unknown) => {
  logger.error(err, 'Fatal error during bootstrap')
  process.exit(1)
})
