FROM caddy:builder AS builder

RUN xcaddy build --with github.com/caddy-dns/cloudflare

FROM caddy:latest
LABEL name "sleepymaid caddy"

COPY --from=builder /usr/bin/caddy /usr/bin/caddy
COPY ./Caddyfile /etc/caddy
