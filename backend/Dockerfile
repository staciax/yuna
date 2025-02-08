ARG BUN_VERSION=1.2.2

FROM oven/bun:${BUN_VERSION} AS base

FROM base AS deps

WORKDIR /app

COPY package.json .
COPY bun.lock .

RUN bun install --production --frozen-lockfile
RUN bun install prisma --frozen-lockfile

COPY prisma prisma

RUN bun prisma generate

FROM base AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules

COPY src src
COPY package.json .
COPY tsconfig.json .
COPY prisma .

# RUN bun install --production --frozen-lockfile
# RUN bun install prisma --frozen-lockfile

# COPY src src
# COPY prisma prisma

ENV NODE_ENV=production

# RUN bun prisma generate

# https://elysiajs.com/patterns/deployment.html#why-not-minify 
RUN bun build \
    --compile \
	--minify-whitespace \
	--minify-syntax \
    --target bun \
    --outfile server \
    ./src/index.ts

FROM gcr.io/distroless/cc:nonroot
# FROM gcr.io/distroless/nodejs22-debian12:nonroot

WORKDIR /app

# COPY --from=builder --chown=nonroot:nonroot /usr/bin/wget /usr/bin/wget
# COPY --from=builder --chown=nonroot:nonroot /usr/bin/curl /usr/bin/curl
# COPY --from=busybox:stable /bin/curl /usr/bin/curl

# COPY --from=builder --chown=nonroot:nonroot /usr/local/bin/node /usr/local/bin/node
# COPY --from=builder --chown=nonroot:nonroot /lib/x86_64-linux-gnu/libgcc_s.so.1 /lib/x86_64-linux-gnu/libgcc_s.so.1
# COPY --from=builder --chown=nonroot:nonroot /app/src/generated ./src/generated

# for basic healthchecks in the final image.
COPY --from=busybox:stable /bin/wget /usr/bin/wget

COPY --from=builder --chown=nonroot:nonroot /app/server ./server
COPY --from=builder --chown=nonroot:nonroot /app/node_modules/.prisma /app/node_modules/.prisma

COPY --chown=nonroot:nonroot public public
# COPY --chown=nonroot:nonroot protected protected
# TODO: docker volumes for public ?

ENV NODE_ENV=production

CMD ["./server"]

EXPOSE 8000

# TODO: entrypoint for migrations
# TODO: opentelemetry