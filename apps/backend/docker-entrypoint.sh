#!/bin/sh
set -e

# Turnkey startup.
#
# Runs before the application server so that `docker compose up` leaves the system
# fully operational from an empty database, with no manual Prisma steps:
#   1) Apply pending migrations. Idempotent: a no-op when none are pending.
#      `set -e` makes a failed migration abort startup loudly instead of booting
#      the server against an invalid schema.
#   2) Seed demo data ONLY when the database is empty (non-destructive — see
#      prisma/seed-if-empty.ts). Existing data is preserved across restarts.
#   3) Hand off to the container command (the server) via exec.

echo "[entrypoint] Applying database migrations (prisma migrate deploy)..."
pnpm exec prisma migrate deploy

echo "[entrypoint] Seeding demo data if the database is empty..."
pnpm exec tsx prisma/seed-if-empty.ts

echo "[entrypoint] Starting application..."
exec "$@"
