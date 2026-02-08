FROM node:22-slim AS base
RUN corepack enable pnpm

WORKDIR /app

# Install dependencies
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY server/package.json server/
COPY client/package.json client/
RUN pnpm install --frozen-lockfile

# Build
COPY server/ server/
COPY client/ client/
RUN pnpm build

# Production image
FROM node:22-slim AS production
RUN corepack enable pnpm

WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY server/package.json server/
RUN pnpm install --frozen-lockfile --prod --filter server

COPY --from=base /app/server/dist server/dist
COPY --from=base /app/client/dist client/dist

ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

CMD ["node", "server/dist/index.js"]
