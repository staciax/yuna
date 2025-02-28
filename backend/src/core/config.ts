import type { StaticDecode } from '@sinclair/typebox';
import { TransformDecodeCheckError, Value } from '@sinclair/typebox/value';
import { type TSchema, t } from 'elysia';

// A Simple Environment Variable Parser

function parseEnv<T extends TSchema>(
    schema: T,
    env: Record<string, string | undefined> = process.env,
): StaticDecode<T> {
    const value = Value.Clone(env);
    const cleaned = Value.Clean(schema, value);
    const defaulted = Value.Default(schema, cleaned);
    const converted = Value.Convert(schema, defaulted);
    try {
        return Value.Decode(schema, converted);
    } catch (err) {
        console.error('Invalid environment variables, check the errors below!');
        if (err instanceof TransformDecodeCheckError) {
            console.log([...Value.Errors(schema, converted)]);
        }
        throw err;
    }
}

//

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

    // Email
    SMTP_TLS: t.Boolean({
        default: true,
        description: 'Enable TLS for SMTP',
    }),
    SMTP_SSL: t.Boolean({
        default: false,
        description: 'Enable SSL for SMTP',
    }),
    SMTP_HOST: t.String({
        description: 'SMTP host',
    }),
    SMTP_PORT: t.Integer({
        default: 587,
        description: 'SMTP port',
    }),
    SMTP_USER: t.String({
        description: 'SMTP user',
    }),
    SMTP_PASSWORD: t.String({
        description: 'SMTP password',
    }),
    EMAILS_FROM_EMAIL: t.Optional(
        t.String({
            format: 'email',
            description: 'Emails from email',
        }),
    ),
    EMAILS_FROM_NAME: t.Optional(
        t.String({
            description: 'Emails from name',
        }),
    ),
    EMAIL_RESET_TOKEN_EXPIRE_HOURS: t.Integer({
        default: 24,
        description: 'Email reset token expiration time in hours',
    }),
});

export type Environment = typeof envSchema.static;

export const env: Environment = parseEnv(envSchema, process.env);

if (env.SMTP_SSL && env.SMTP_TLS) {
    console.error(
        'SMTP_SSL and SMTP_TLS cannot be enabled at the same time,',
        'please enable only one of them',
    );
    process.exit(1);
}

export const EMAIL_ENABLED = Boolean(env.SMTP_HOST && env.EMAILS_FROM_EMAIL);
