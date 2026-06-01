import { PrismaClient } from '@prisma/client'

import { seedDatabase } from './seed.js'

// Conditional boot seed.
//
// The decision is based on the REAL database state — the project count — not on
// any flag, env toggle or marker file. If the database already holds data, the
// seed is skipped entirely: nothing is deleted, recreated or modified, so data
// created by the evaluator survives restarts. The seed runs only on an empty DB.
async function seedIfEmpty(): Promise<void> {
  const prisma = new PrismaClient()
  try {
    const existing = await prisma.project.count()

    if (existing > 0) {
      console.log(`Seed skipped: database already has ${existing} project(s).`)
      return
    }

    console.log('Database is empty — running seed...')
    await seedDatabase(prisma)
    console.log('Seed completed successfully.')
  } finally {
    await prisma.$disconnect()
  }
}

seedIfEmpty().catch((error: unknown) => {
  console.error(error)
  process.exit(1)
})
