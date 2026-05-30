import { PrismaClient } from '@prisma/client'

const isDevelopment = process.env['NODE_ENV'] !== 'production'

const createPrismaClient = (): PrismaClient =>
  new PrismaClient({
    log: isDevelopment ? ['query', 'error', 'warn'] : ['error'],
  })

declare global {
  var prismaGlobal: PrismaClient | undefined
}

const prisma: PrismaClient = isDevelopment
  ? (globalThis.prismaGlobal ?? (globalThis.prismaGlobal = createPrismaClient()))
  : createPrismaClient()

export default prisma
