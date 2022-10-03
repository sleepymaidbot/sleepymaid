FROM caddy:builder AS builder

FROM caddy:latest
LABEL name "sleepymaid caddy"

COPY --from=builder /usr/bin/caddy /usr/bin/caddy
COPY ./Caddyfile /etc/caddy
