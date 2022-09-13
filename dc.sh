#!/bin/bash

docker-compose \
  -p sleepymaid \
  --env-file ./.env \
  -f compose/docker-compose.yml \
  -f compose/docker-compose.$1.yml \
  -f compose/docker-compose.config.$1.yml \
  ${@%$1}
