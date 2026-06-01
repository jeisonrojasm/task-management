FROM node:22-alpine AS base
WORKDIR /workspace
RUN ln -s /usr/lib/libssl.so.3 /lib/libssl.so.3
RUN corepack enable pnpm

FROM base AS installer
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/backend/package.json ./apps/backend/
COPY packages/shared/package.json ./packages/shared/
RUN pnpm install --frozen-lockfile

FROM installer AS dev
COPY tsconfig.base.json ./
COPY packages/shared ./packages/shared
COPY apps/backend ./apps/backend
WORKDIR /workspace/apps/backend
RUN pnpm exec prisma generate
CMD ["pnpm", "exec", "tsx", "watch", "src/main.ts"]

FROM installer AS builder
COPY tsconfig.base.json ./
COPY packages/shared ./packages/shared
COPY apps/backend ./apps/backend
WORKDIR /workspace/apps/backend
RUN pnpm exec prisma generate
RUN pnpm exec tsc -p tsconfig.build.json

# pnpm deploy produces a self-contained bundle: resolves workspace packages
# (packages/shared) without symlinks, installs only production dependencies.
FROM installer AS deployer
COPY tsconfig.base.json ./
COPY packages/shared ./packages/shared
COPY apps/backend ./apps/backend
COPY --from=builder /workspace/apps/backend/dist ./apps/backend/dist
WORKDIR /workspace
RUN pnpm --filter ./apps/backend deploy --prod /deploy

FROM node:22-alpine AS prod
WORKDIR /app
COPY --from=deployer /deploy .
USER node
EXPOSE 3000
CMD ["node", "dist/main.js"]
