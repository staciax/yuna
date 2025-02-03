import { Prisma, PrismaClient } from '@prisma/client';

import { env } from '@/core/config';

export const prisma = new PrismaClient({
    ...(env.NODE_ENV === 'development' && {
        errorFormat: 'pretty',
        log: [
            {
                emit: 'event',
                level: 'query',
            },
            {
                emit: 'stdout',
                level: 'error',
            },
            {
                emit: 'stdout',
                level: 'info',
            },
            {
                emit: 'stdout',
                level: 'warn',
            },
        ],
    }),
});

// logging docs: https://www.prisma.io/docs/orm/prisma-client/observability-and-logging/logging

if (env.NODE_ENV === 'development') {
    const green = '\x1b[32m';
    const reset = '\x1b[0m';
    const blue = '\x1b[34m';
    const yellow = '\x1b[33m';
    const cyan = '\x1b[36m';

    // NOTE: fix for docker build error
    // biome-ignore lint/suspicious/noImplicitAnyLet: <explanation>
    let format;
    try {
        const sql = await import('sql-formatter');
        format = sql.format;
    } catch {
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        format = (query: string, _cfg?: any) => query;
    }

    // @ts-ignore
    prisma.$on('query', (e) => {
        console.log(
            // @ts-ignore
            `Query: \n${green} ${format(e.query, { language: 'postgresql' })} ${reset}`,
        );
        // @ts-ignore
        console.log(`Params: ${yellow}${e.params}${reset}`);
        // @ts-ignore
        console.log(`Duration: ${cyan}${e.duration}${reset} ms`);
        // @ts-ignore
        console.log(`Timestamp: ${blue}${e.timestamp}${reset}\n`);
    });
}

// custom prisma for transaction
// read more:
// https://github.com/prisma/prisma/issues/22309
// https://github.com/prisma/prisma-client-extensions/tree/main/callback-free-itx
// https://github.com/prisma/prisma-client-extensions/pull/52

type PrismaFlatTransactionClient = Prisma.TransactionClient & {
    $commit: () => Promise<void>;
    $rollback: () => Promise<void>;
};

type PrismaTransactionOptions = {
    maxWait?: number;
    timeout?: number;
    isolationLevel?: Prisma.TransactionIsolationLevel;
};

const ROLLBACK = { [Symbol.for('prisma.client.extension.rollback')]: true };

export const xprisma = prisma.$extends({
    client: {
        async $begin(options?: PrismaTransactionOptions) {
            const prisma = Prisma.getExtensionContext(this);
            let setTxClient: (txClient: Prisma.TransactionClient) => void;
            let commit: () => void;
            let rollback: () => void;

            // a promise for getting the tx inner client
            const txClient = new Promise<Prisma.TransactionClient>((res) => {
                setTxClient = (txClient) => res(txClient);
            });

            // a promise for controlling the transaction
            const txPromise = new Promise((_res, _rej) => {
                commit = () => {
                    return _res(undefined);
                };
                rollback = () => {
                    return _rej(ROLLBACK);
                };
            });

            // opening a transaction to control externally
            if (
                '$transaction' in prisma &&
                typeof prisma.$transaction === 'function'
            ) {
                const tx = prisma
                    .$transaction((txClient) => {
                        setTxClient(
                            txClient as unknown as Prisma.TransactionClient,
                        );

                        return txPromise;
                    }, options)
                    .catch((e) => {
                        if (e === ROLLBACK) return;
                        throw e;
                    });

                // return a proxy TransactionClient with `$commit` and `$rollback` methods
                return new Proxy(await txClient, {
                    get(target, prop) {
                        if (prop === '$commit') {
                            return () => {
                                commit();
                                return tx;
                            };
                        }
                        if (prop === '$rollback') {
                            return () => {
                                rollback();
                                return tx;
                            };
                        }
                        if (prop === '$transaction') {
                            return async (
                                fn: (
                                    client: Prisma.TransactionClient,
                                    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
                                ) => Promise<any>,
                            ) => {
                                return fn(target);
                            };
                        }
                        return target[prop as keyof typeof target];
                    },
                }) as PrismaFlatTransactionClient;
            }
            throw new Error('Transactions are not supported by this client');
        },
    },
});

export type PrismaClientType = typeof prisma;
