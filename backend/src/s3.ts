// ** Elysia S3 Plugin **
// Elysia S3 Plugin to integrate bun S3 client with Elysia.
// Read more about the bun S3 client here: https://bun.sh/docs/api/s3
import { type S3Options as BunS3Options, S3Client } from 'bun';

import { Elysia } from 'elysia';

import { env } from '@/core/config';

type ElysiaS3Option<Name extends string = 's3'> = {
    name?: Name;
} & BunS3Options;

export const s3Plugin = <const Name extends string = 's3'>({
    name = 's3' as Name,
    ...options
}: ElysiaS3Option<Name>) => {
    const s3Client = new S3Client(options);
    return new Elysia({
        name: 'elysia-s3',
        seed: { name, ...options },
    }) //
        .decorate(name as Name extends string ? Name : 's3', s3Client)
        .as('plugin');
};

// usage

export const s3 = s3Plugin({
    name: 's3',
    accessKeyId: env.S3_ACCESS_KEY_ID,
    secretAccessKey: env.S3_SECRET_ACCESS_KEY,
    bucket: env.S3_BUCKET,
    endpoint: env.S3_ENDPOINT,
    ...(env.S3_ACL && { acl: env.S3_ACL }),
    ...(env.S3_REGION && { region: env.S3_REGION }),
    ...(env.S3_SESSION_TOKEN && { sessionToken: env.S3_SESSION_TOKEN }),
});
