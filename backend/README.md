# Yuna Backend

## Requirements

- [Bun](https://bun.sh) 1.2.10+

## Configuration

Create a `.env` file in the root of the project with the following content:

```bash
cp .env.example .env
```

## Installation

```bash
bun install
```

## Usage

```bash
bun dev
```

## TODO
- [ ]  [JWT (JSON Web Token) authentication.](https://jwt.io)
    - [x] [Elysia JWT](https://elysiajs.com/plugins/jwt.html)
    - [ ] with [Refresh Token](https://auth0.com/learn/refresh-tokens)
- [x] Hashing Password with bcrypt ([Bun Hashing](https://bun.sh/docs/api/hashing))
- [ ] Passkey (passwordless)
- [x] [Environment Variables Validation](./src/core/config.ts)
- [ ] Static files
    - [x] [Elysia Static](https://elysiajs.com/plugins/static.html)
    - [ ] S3 storage with [Bun S3](https://bun.sh/docs/api/s3)
        - [ ] [AWS S3](https://aws.amazon.com/s3/)
        - [x] [Cloudflare R2](https://developers.cloudflare.com/r2/)
- [x] [React Email](https://github.com/resend/react-email) with [Nodemailer](https://www.nodemailer.com) ([Elysia Email](https://elysiajs.com/recipe/react-email.html))
- [x] [Docker](https://www.docker.com) and [Docker Compose](https://docs.docker.com/compose) ([Elysia Docker](https://elysiajs.com/recipe/docker.html))
- [ ] [Unit Test](https://elysiajs.com/patterns/unit-test) and coverage with [Bun Code coverage](https://bun.sh/docs/test/coverage)
- [ ] [Redis](https://redis.io)
- [ ] [Opentelemetry](https://opentelemetry.io) ([Elysia OpenTelemetry](https://elysiajs.com/recipe/opentelemetry.html))
- [ ] [Sentry](https://sentry.io)
- [ ] OAuth2
    - [ ] [Google](https://developers.google.com/identity/protocols/oauth2)
    - [ ] [Github](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps)
    - [ ] [Discord](https://discord.com/developers/docs/topics/oauth2)
- [ ] [better-auth](https://www.better-auth.com) ([Elysia Better Auth](https://elysiajs.com/recipe/better-auth.html))
- [ ] ORM
    - [X] [Prisma](https://www.prisma.io) ([Elysia Prisma](https://elysiajs.com/blog/with-prisma))
    - [ ] [Drizzle](https://orm.drizzle.team) ([Elysia Drizzle](https://elysiajs.com/recipe/drizzle.html#drizzle))
- [ ] [Supabase](https://supabase.com)
- [ ] Edge
    - [ ] [Cloudflare Workers](https://workers.cloudflare.com)
    - [ ] [Traefik](https://traefik.io)
- [ ] Rate Limiting (maybe: [rayriffy/elysia-rate-limit](https://github.com/rayriffy/elysia-rate-limit))
- [ ] Microservices
- [ ] RabbitMQ
<!-- - [ ] Monorepo with [Turbo](https://turbo.build/repo/docs) -->
<!-- - [ ] Architecture (Clean Architecture, Hexagonal Architecture) -->

## License

This project is licensed under the GNUv3 License - see the [LICENSE](LICENSE.md) file for details.