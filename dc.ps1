param(
    [string]$env
)

docker-compose `
  -p sleepymaid `
  --env-file ./.env `
  -f compose/docker-compose.yml `
  -f "compose/docker-compose.$env.yml" `
  -f "compose/docker-compose.config.$env.yml" `
  $args
