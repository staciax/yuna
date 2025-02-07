ARG BUN_VERSION=1.2.2

FROM oven/bun:${BUN_VERSION} AS base

RUN apt-get update && apt-get install -y curl unzip

RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get install -y nodejs

FROM base AS deps

WORKDIR /app

COPY package.json .
COPY bun.lock .

RUN bun install --production --frozen-lockfile

FROM base AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules

COPY src src
COPY package.json .
COPY tsconfig.json .
COPY prisma .

RUN bunx prisma generate

ENV NODE_ENV=production

# https://elysiajs.com/patterns/deployment.html#why-not-minify 
RUN bun build \
    --compile \
	--minify-whitespace \
	--minify-syntax \
    --target bun \
    --outfile server \
    ./src/index.ts

FROM gcr.io/distroless/base:nonroot

WORKDIR /app

COPY --from=builder --chown=nonroot:nonroot /lib/x86_64-linux-gnu/libgcc_s.so.1 /lib/x86_64-linux-gnu/libgcc_s.so.1
COPY --from=builder --chown=nonroot:nonroot /app/src/generated ./src/generated
COPY --from=builder --chown=nonroot:nonroot /app/server ./server

COPY --chown=nonroot:nonroot public public
# COPY --chown=nonroot:nonroot protected protected
# TODO: docker volumes for public ?

ENV NODE_ENV=production

CMD ["./server"]

EXPOSE 8000

# TODO: entrypoint for migrations
# TODO: opentelemetry