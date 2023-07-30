FROM node:20-alpine
LABEL name "sleepymaid qcgsecret"

WORKDIR /opt/build

RUN apk add --update \
  && apk add --no-cache ca-certificates \
  && apk add --no-cache --virtual .build-deps curl git python3 alpine-sdk libc6-compat openssl1.1-compat-dev

COPY tsup.config.js turbo.json package.json tsconfig.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn
RUN yarn workspaces focus

COPY prisma/ ./prisma
RUN yarn prisma generate

COPY packages/handler/package.json ./packages/handler/package.json
COPY packages/logger/package.json ./packages/logger/package.json
COPY packages/shared/package.json ./packages/shared/package.json
COPY packages/util/package.json ./packages/util/package.json

COPY services/api/package.json ./services/api/package.json
COPY services/helper/package.json ./services/helper/package.json
COPY services/bot/package.json ./services/bot/package.json
COPY services/watcher/package.json ./services/watcher/package.json
COPY services/website/package.json ./services/website/package.json
COPY services/qcgsecret/package.json ./services/qcgsecret/package.json

RUN yarn

COPY packages/handler ./packages/handler
COPY packages/logger ./packages/logger
COPY packages/shared ./packages/shared
COPY packages/util ./packages/util

RUN yarn turbo run build --filter=qcgsecret^

COPY services/api/ ./services/api
COPY services/bot ./services/bot
COPY services/helper/ ./services/helper
COPY services/watcher ./services/watcher
COPY services/website ./services/website
COPY services/qcgsecret ./services/qcgsecret

RUN yarn turbo run build --filter=qcgsecret

COPY locales/ ./locales

EXPOSE 3001
ENV PORT 3001
ENV HOST 0.0.0.0

CMD ["yarn", "workspace", "@sleepymaid/qcgsecret", "start"]
