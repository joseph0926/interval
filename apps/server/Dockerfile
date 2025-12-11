ARG NODE_VERSION=22
FROM node:${NODE_VERSION}-slim AS base

LABEL fly_launch_runtime="Node.js"

WORKDIR /app

ENV NODE_ENV="production"




FROM base AS build

ENV NODE_ENV="development"

RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y \
    build-essential \
    node-gyp \
    openssl \
    pkg-config \
    python-is-python3 && \
    rm -rf /var/lib/apt/lists/*


COPY package*.json ./
COPY prisma ./prisma/

RUN npm install --include=dev


RUN npx prisma generate


COPY . .


RUN npm run build


RUN npm prune --omit=dev




FROM base AS production


RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y \
    openssl && \
    rm -rf /var/lib/apt/lists/*


RUN useradd --create-home --shell /bin/bash appuser


COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/src/generated ./dist/generated
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/package.json ./


USER appuser


EXPOSE 3000


CMD ["node", "dist/index.js"]
