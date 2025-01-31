import { Value } from '@sinclair/typebox/value';
import { t } from 'elysia';

const parseCorsOrigins = (value: string) => {
    return value.split(',').map((v) => v.trim().replace(/\/$/, ''));
};

const envSchema = t.Object({
    // Application
    NODE_ENV: t.Union(
        [t.Literal('development'), t.Literal('test'), t.Literal('production')],
        {
            default: 'development',
            description: 'Node environment',
        },
    ),
    PROJECT_NAME: t.String({
        description: 'Project name',
    }),
    FRONTEND_HOST: t.Optional(
        t.String({
            description: 'Frontend host',
            default: 'http://localhost:3000',
        }),
    ),
    HOSTNAME: t.String({
        default: 'localhost',
        description: 'API hostname',
    }),
    PORT: t.Integer({
        minimum: 1000,
        maximum: 65535,
        default: 8000,
        description: 'API port',
    }),

    // Security
    BACKEND_CORS_ORIGINS: t.Optional(
        t.Union([
            t
                .Transform(
                    t.String({
                        description:
                            'Comma-separated list of origins for the CORS policy',
                    }),
                )
                .Decode((value) => parseCorsOrigins(value))
                .Encode((value) => value.join(',')),
            t.Array(t.String()),
        ]),
    ),
    SECRET_KEY: t.String({
        default: new Bun.CryptoHasher('sha256').digest('hex'),
        description: 'Secret key for hashing',
    }),
    ACCESS_TOKEN_EXPIRE: t.String({
        default: '1d',
        pattern: '^\\d+[smhdwMy]$',
        description: 'Access token expiration time',
    }),

    // API
    API_V1_STR: t.String({
        default: '/api/v1',
        description: 'API version',
    }),

    // Database
    // POSTGRES_HOST: t.String({
    //     default: 'localhost',
    //     description: 'Postgres host',
    // }),
    // POSTGRES_PORT: t.Integer({
    //     default: 5432,
    //     description: 'Postgres port',
    // }),
    // POSTGRES_USER: t.String({
    //     description: 'Postgres user',
    // }),
    // POSTGRES_PASSWORD: t.String({
    //     description: 'Postgres password',
    // }),
    // POSTGRES_DB: t.String({
    //     description: 'Postgres database',
    // }),
});

export type Environment = typeof envSchema.static;

export const env: Environment = Value.Parse(envSchema, process.env);

const error = Value.Errors(envSchema, env);

if (error.First()) {
    console.error('Invalid environment variables, check the errors below!');
    console.error([...error]);
    process.exit(1);
}
