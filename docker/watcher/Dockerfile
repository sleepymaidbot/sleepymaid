FROM node:20-alpine
LABEL name "sleepymaid watcher"

WORKDIR /opt/build

RUN apk add --update \
  && apk add --no-cache ca-certificates \
  && apk add --no-cache --virtual .build-deps curl git python3 alpine-sdk libc6-compat openssl1.1-compat-dev
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

COPY tsup.config.js turbo.json package.json tsconfig.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./

COPY packages/handler ./packages/handler
COPY packages/logger ./packages/logger
COPY packages/shared ./packages/shared
COPY packages/util ./packages/util

COPY services/sleepymaid ./services/sleepymaid
COPY services/helper/ ./services/helper
COPY services/watcher ./services/watcher

RUN pnpm install --frozen-lockfile --ignore-scripts
COPY prisma/ ./prisma
COPY locales/ ./locales
RUN pnpm prisma generate
RUN pnpm turbo run build --filter=watcher...

CMD ["node", "--trace-warnings", "-r", "source-map-support/register", "services/watcher/dist/index.js"]
