import { pino } from 'pino'

const isDevelopment = process.env['NODE_ENV'] !== 'production'
const logLevel = process.env['LOG_LEVEL'] ?? 'info'

export const logger = isDevelopment
  ? pino({
      level: logLevel,
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: true,
        },
      },
    })
  : pino({ level: logLevel })
