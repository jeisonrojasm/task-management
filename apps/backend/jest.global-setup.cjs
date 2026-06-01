/* eslint-disable @typescript-eslint/no-require-imports */
const { execSync } = require('node:child_process')
const { setTimeout: sleep } = require('node:timers/promises')
const dotenv = require('dotenv')

// Jest globalSetup — provisions the integration test database before any spec runs.
//
// Loads the test environment (.env.test → DATABASE_URL points to the test DB) and runs
// `prisma migrate deploy`, which CREATES the database if it does not exist and applies
// all migrations, leaving the schema ready. This makes `pnpm test` self-contained: it
// works after a `docker compose down -v && docker compose up` with no manual DB steps.
//
// Retries while PostgreSQL is still starting up to avoid timing-related failures.
//
// Note: Jest's cwd is apps/backend, which is why `.env.test` and `prisma` are resolved
// relatively. override: true forces the test URL even if the environment already carries
// another DATABASE_URL. execSync inherits process.env by default, so the test URL
// (which dotenv leaves in process.env) reaches the Prisma subprocess.
module.exports = async function globalSetup() {
  dotenv.config({ path: '.env.test', override: true })

  const MAX_ATTEMPTS = 10
  const DELAY_MS = 1500

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      execSync('pnpm exec prisma migrate deploy', { stdio: 'inherit' })
      return
    } catch (err) {
      if (attempt === MAX_ATTEMPTS) {
        throw err
      }
      // PostgreSQL may still be starting up: wait and retry.
      await sleep(DELAY_MS)
    }
  }
}
