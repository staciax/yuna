import type { PrismaFlatTransactionClient } from '@/core/db';
import type { Prisma } from '@prisma/client';

export const getUserByEmail = (
    tx: PrismaFlatTransactionClient,
    email: string,
) => {
    return tx.user.findUnique({
        where: {
            email: email,
            deletedAt: null,
        },
    });
};

export const getUser = (tx: PrismaFlatTransactionClient, id: string) => {
    return tx.user.findUnique({
        where: {
            id: id,
            deletedAt: null,
        },
    });
};

export const getUsers = (
    tx: PrismaFlatTransactionClient,
    options?: {
        skip?: number;
        take?: number;
        orderBy?:
            | Prisma.UserOrderByWithRelationInput
            | Prisma.UserOrderByWithRelationInput[];
    },
) => {
    return tx.user.findMany({
        where: {
            deletedAt: null,
        },
        skip: options?.skip,
        take: options?.take,
        orderBy: options?.orderBy,
    });
};

export const countUsers = (tx: PrismaFlatTransactionClient) => {
    return tx.user.count({
        where: {
            deletedAt: null,
        },
    });
};

export const createUser = async (
    tx: PrismaFlatTransactionClient,
    data: Prisma.UserCreateInput,
) => {
    const dbUser = await tx.user.create({
        data: {
            ...data,
        },
    });
    await tx.$commit();
    return dbUser;
};

export const updateUser = async (
    tx: PrismaFlatTransactionClient,
    user: { id: string },
    data: Prisma.UserUpdateInput,
) => {
    const dbUser = await tx.user.update({
        where: {
            id: user.id,
            deletedAt: null,
        },
        data,
    });
    await tx.$commit();
    return dbUser;
};

export const softDeleteUser = async (
    tx: PrismaFlatTransactionClient,
    user: { id: string; email: string },
) => {
    const dbUser = await tx.user.update({
        where: {
            id: user.id,
            deletedAt: null,
        },
        data: {
            email: `${user.email}-${user.id}-deleted`, // ensure unique
            deletedAt: new Date(),
        },
    });
    await tx.$commit();
    return dbUser;
};
