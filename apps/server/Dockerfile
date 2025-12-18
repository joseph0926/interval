ARG NODE_VERSION=22
FROM node:${NODE_VERSION}-slim AS base

LABEL fly_launch_runtime="Node.js"

WORKDIR /app

ENV NODE_ENV="production"

RUN corepack enable && corepack prepare pnpm@10.24.0 --activate

FROM base AS build

ENV NODE_ENV="development"
ENV CI="true"

RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y \
    build-essential \
    node-gyp \
    openssl \
    pkg-config \
    python-is-python3 && \
    rm -rf /var/lib/apt/lists/*

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

COPY apps/server/package.json ./apps/server/
COPY packages/pause-engine/package.json ./packages/pause-engine/

RUN pnpm install --frozen-lockfile

COPY apps/server/prisma ./apps/server/prisma/
RUN pnpm --filter @interval/server exec prisma generate

COPY packages/pause-engine ./packages/pause-engine/
COPY apps/server ./apps/server/

RUN pnpm --filter @pause/engine build
RUN pnpm --filter @interval/server build

RUN pnpm --filter @interval/server deploy --prod --legacy /app/deploy

FROM base AS production

RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y \
    openssl && \
    rm -rf /var/lib/apt/lists/*

RUN useradd --create-home --shell /bin/bash appuser

COPY --from=build --chown=appuser:appuser /app/deploy ./
COPY --from=build --chown=appuser:appuser /app/apps/server/dist ./dist
COPY --from=build --chown=appuser:appuser /app/apps/server/src/generated ./dist/generated
COPY --from=build --chown=appuser:appuser /app/apps/server/prisma ./prisma

USER appuser

EXPOSE 3000

CMD ["node", "dist/index.js"]
