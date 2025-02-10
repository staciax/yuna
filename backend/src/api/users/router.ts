import { getCurrentUser } from '@/api/auth/plugins';
import { getPasswordHash, verifyPassword } from '@/core/security';
import { HTTPError } from '@/errors';
import { dbSession } from '@/plugins/db';
import { Message } from '@/schemas/message';
import { OffsetBasedPagination } from '@/schemas/pagination';

import {
    UpdatePassword,
    UserCreate,
    UserMeRead,
    UserMeUpdate,
    UserPagination,
    UserRead,
    UserRegiser,
    UserUpdate,
} from './schemas';
import * as service from './service';

import { Elysia, t } from 'elysia';

export const router = new Elysia({
    prefix: '/users',
    tags: ['users'],
})
    .use(dbSession)
    .guard((app) =>
        app
            // TODO: role or permission verification
            .use(getCurrentUser)
            .get(
                '/',
                async ({ tx, query: { limit, offset } }) => {
                    const users = await service.getUsers(tx, {
                        skip: offset,
                        take: limit,
                    });
                    const count = await service.countUsers(tx);

                    return {
                        data: users,
                        pagination: {
                            limit: limit,
                            offset: offset,
                            total: count,
                        },
                    };
                },
                {
                    query: OffsetBasedPagination,
                    response: {
                        200: UserPagination,
                    },
                },
            )
            .get(
                '/:id',
                async ({ tx, params: { id } }) => {
                    const user = await service.getUser(tx, id);

                    if (!user) {
                        throw new HTTPError({
                            status: 404,
                            message: 'User not found',
                        });
                    }

                    return user;
                },
                {
                    params: t.Object({
                        id: t.String({ format: 'uuid' }),
                    }),
                    response: {
                        200: UserRead,
                    },
                },
            )
            .post(
                '/',
                async ({ tx, set, body }) => {
                    const user = await service.getUserByEmail(tx, body.email);

                    if (user) {
                        throw new HTTPError({
                            status: 400,
                            message: 'Email already exists',
                        });
                    }

                    const { password, ...data } = body;
                    const hashedPassword = await getPasswordHash(password);

                    const newUser = await service.createUser(tx, {
                        ...data,
                        hashedPassword,
                    });

                    await tx.$commit();
                    set.status = 201;
                    return newUser;
                },
                {
                    body: UserCreate,
                    response: {
                        201: UserRead,
                    },
                },
            )
            .patch(
                '/:id',
                async ({ tx, params: { id }, body }) => {
                    const user = await service.getUser(tx, id);

                    if (!user) {
                        throw new HTTPError({
                            status: 404,
                            message: 'User not found',
                        });
                    }

                    const { password, ...data } = body;
                    let hashedPassword = undefined;

                    if (password) {
                        hashedPassword = await getPasswordHash(password);
                    }

                    const updatedUser = await service.updateUser(tx, user.id, {
                        ...data,
                        hashedPassword,
                    });

                    await tx.$commit();
                    return updatedUser;
                },
                {
                    params: t.Object({
                        id: t.String({ format: 'uuid' }),
                    }),
                    body: UserUpdate,
                    response: {
                        200: UserRead,
                    },
                },
            )
            .delete(
                '/:id',
                async ({ currentUser, tx, params: { id } }) => {
                    const deleteUser = await service.getUser(tx, id);

                    if (!deleteUser) {
                        throw new HTTPError({
                            status: 404,
                            message: 'User not found',
                        });
                    }

                    if (deleteUser.id === currentUser.id) {
                        throw new HTTPError({
                            status: 403,
                            message: "You can't delete yourself",
                        });
                    }

                    await service.softDeleteUser(
                        tx,
                        deleteUser.id,
                        deleteUser.email,
                    );
                    await tx.$commit();

                    return { message: 'User deleted successfully' };
                },
                {
                    params: t.Object({
                        id: t.String({ format: 'uuid' }),
                    }),
                    response: {
                        200: Message,
                    },
                },
            ),
    )
    .guard((app) =>
        app
            .use(getCurrentUser)
            .get('/me', async ({ currentUser }) => currentUser, {
                response: {
                    200: UserMeRead,
                },
            })
            .patch(
                '/me',
                async ({ tx, currentUser, body }) => {
                    const updatedUser = await service.updateUser(
                        tx,
                        currentUser.id,
                        body,
                    );

                    await tx.$commit();

                    return updatedUser;
                },
                {
                    body: UserMeUpdate,
                    response: {
                        200: UserMeRead,
                    },
                },
            )
            .patch(
                '/me/password',
                async ({ tx, currentUser, body }) => {
                    if (!currentUser.hashedPassword) {
                        throw new HTTPError({
                            status: 400,
                            message: 'User has no password',
                        });
                    }
                    const { currentPassword, newPassword } = body;

                    const passwordIsMatch = await verifyPassword(
                        currentPassword,
                        currentUser.hashedPassword,
                    );
                    if (!passwordIsMatch) {
                        throw new HTTPError({
                            status: 400,
                            message: 'Invalid password',
                        });
                    }

                    if (currentPassword === newPassword) {
                        throw new HTTPError({
                            status: 400,
                            message: 'New password must be different',
                        });
                    }

                    const hashedPassword = await getPasswordHash(newPassword);
                    await service.updateUser(tx, currentUser.id, {
                        hashedPassword,
                    });

                    await tx.$commit();

                    return { message: 'User updated successfully' };
                },
                {
                    body: UpdatePassword,
                    response: {
                        200: Message,
                    },
                },
            ),
    )
    .post(
        '/signup',
        async ({ tx, set, body }) => {
            const { email, password } = body;

            const user = await service.getUserByEmail(tx, email);

            if (user) {
                throw new HTTPError({
                    status: 400,
                    message: 'User already exists',
                });
            }

            const hashedPassword = await getPasswordHash(password);

            await service.createUser(tx, {
                email,
                hashedPassword,
            });

            await tx.$commit();

            set.status = 201;
            return { message: 'User created successfully' };
        },
        {
            body: UserRegiser,
            response: {
                201: Message,
            },
        },
    );
