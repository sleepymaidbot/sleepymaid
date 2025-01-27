FROM node:22-alpine

WORKDIR /opt/build

RUN apk add --no-cache \
    ca-certificates \
    cairo-dev \
    pango-dev \
    giflib-dev \
    jpeg-dev \
    pixman-dev \
    pangomm-dev \
    libjpeg-turbo-dev \
    ttf-dejavu \
    fontconfig \
    yt-dlp \
    git \
    && apk add --no-cache --virtual .build-deps \
    curl git python3 alpine-sdk libc6-compat openssl-dev yt-dlp \
    && apk del .build-deps
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

COPY tsup.config.js turbo.json package.json tsconfig.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./

COPY packages/db ./packages/db
COPY packages/handler ./packages/handler
COPY packages/logger ./packages/logger
COPY packages/shared ./packages/shared
COPY packages/util ./packages/util

COPY services/api ./services/api
COPY services/clarity ./services/clarity
COPY services/sleepymaid ./services/sleepymaid
COPY services/helper/ ./services/helper
COPY services/watcher ./services/watcher

RUN pnpm install --frozen-lockfile --ignore-scripts
COPY locales/ ./locales
COPY .git/ ./.git
RUN pnpm turbo run build

COPY locales/ ./locales
COPY services/helper/banners ./services/helper/banners
