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
    },
) => {
    return tx.user.findMany({
        where: {
            deletedAt: null,
        },
        skip: options?.skip,
        take: options?.take,
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
    return tx.user.create({
        data: {
            ...data,
        },
    });
};

export const updateUser = (
    tx: PrismaFlatTransactionClient,
    id: string,
    data: Prisma.UserUpdateInput,
) => {
    return tx.user.update({
        where: {
            id: id,
            deletedAt: null,
        },
        data,
    });
};

export const softDeleteUser = (
    tx: PrismaFlatTransactionClient,
    id: string,
    email: string,
) => {
    return tx.user.update({
        where: {
            id: id,
            deletedAt: null,
        },
        data: {
            email: `${email}-${id}-deleted`, // ensure unique
            deletedAt: new Date(),
        },
    });
};
