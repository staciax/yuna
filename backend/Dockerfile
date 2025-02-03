FROM oven/bun:1.2 AS base

# deps stage
FROM base AS deps

WORKDIR /app
COPY package.json .
COPY bun.lock .
RUN bun install --frozen-lockfile --production

# builder stage
FROM base AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY src src
COPY package.json .
COPY tsconfig.json .

ENV NODE_ENV=production

# https://elysiajs.com/patterns/deployment.html#why-not-minify 
RUN bun build \
    --compile \
	--minify-whitespace \
	--minify-syntax \
    --target bun \
    --outfile server \
    ./src/index.ts

# runner stage
FROM gcr.io/distroless/base:nonroot

WORKDIR /app

COPY --from=builder --chown=nonroot:nonroot /app/server ./server

# COPY --chown=nonroot:nonroot public public
# COPY --chown=nonroot:nonroot protected protected
# TODO: docker volumes for public ?

ENV NODE_ENV=production

CMD ["./server"]

EXPOSE 8000

# TODO: entrypoint for migrations
# TODO: opentelemetry