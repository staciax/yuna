ARG BUN_VERSION=1.2.7

FROM oven/bun:${BUN_VERSION} AS base

FROM base AS deps

WORKDIR /app

COPY package.json .
COPY bun.lock .

RUN bun install --production --frozen-lockfile
RUN bun install prisma --frozen-lockfile

FROM base AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules

COPY src src
COPY package.json .
COPY tsconfig.json .
COPY prisma prisma

RUN bun prisma generate

ENV NODE_ENV=production

# https://elysiajs.com/patterns/deployment.html#why-not-minify
RUN bun build \
    --compile \
    --minify-whitespace \
    --minify-syntax \
    --target bun \
    --outfile server \
    ./src/index.ts

# use distroless/cc instead of distroless/base because prisma needs libgcc
FROM gcr.io/distroless/cc:nonroot

WORKDIR /app

# for basic healthchecks in the final image.
COPY --from=busybox:stable --chown=nonroot:nonroot /bin/wget /usr/bin/wget

COPY --from=builder --chown=nonroot:nonroot /app/server ./server
COPY --from=builder --chown=nonroot:nonroot /app/node_modules/.prisma /app/node_modules/.prisma

COPY --chown=nonroot:nonroot public public
# COPY --chown=nonroot:nonroot protected protected
# TODO: docker volumes for public ?

ENV NODE_ENV=production

ENV PATH=/bin/wget:$PATH

CMD ["./server"]

EXPOSE 8000

# TODO: entrypoint for migrations
# TODO: opentelemetry
