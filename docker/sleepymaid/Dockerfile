FROM node:18
LABEL name "sleepymaid bot"

WORKDIR /opt/build

COPY turbo.json package.json tsconfig.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn
RUN yarn workspaces focus

COPY prisma ./prisma
RUN yarn prisma generate

COPY packages/handler/package.json ./packages/handler/package.json
COPY packages/logger/package.json ./packages/logger/package.json
COPY packages/shared/package.json ./packages/shared/package.json
COPY packages/util/package.json ./packages/util/package.json

COPY services/helper/package.json ./services/helper/package.json
COPY services/bot/package.json ./services/bot/package.json

RUN yarn

COPY packages/handler ./packages/handler
COPY packages/logger ./packages/logger
COPY packages/shared ./packages/shared
COPY packages/util ./packages/util

RUN yarn turbo run build --filter=./packages/*

COPY services/bot ./services/bot
COPY services/helper/ ./services/helper

RUN yarn turbo run build --filter=./services/*

CMD ["yarn", "start"]
