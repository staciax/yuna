import { Elysia, t } from 'elysia';

import { getCurrentUser } from '@/api/auth/plugins';
import { EMAIL_ENABLED } from '@/core/config';
import { getPasswordHash, security, verifyPassword } from '@/core/security';
import { Status } from '@/enums';
import { HTTPError } from '@/errors';
import { dbSession } from '@/plugins/db';
import { Message } from '@/schemas/message';
import { OffsetBasedPagination } from '@/schemas/pagination';
import { generateAccountVerificationEmail, sendEmail } from '@/utils';

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

export const router = new Elysia({
    prefix: '/users',
    tags: ['users'],
})
    .use(dbSession)
    .use(security)
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
                        [Status.HTTP_200_OK]: UserPagination,
                    },
                },
            )
            .get(
                '/:id',
                async ({ tx, params: { id } }) => {
                    const user = await service.getUser(tx, id);

                    if (!user) {
                        throw new HTTPError({
                            status: Status.HTTP_404_NOT_FOUND,
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
                        [Status.HTTP_200_OK]: UserRead,
                    },
                },
            )
            .post(
                '/',
                async ({ tx, jwt, set, body }) => {
                    const user = await service.getUserByEmail(tx, body.email);

                    if (user) {
                        throw new HTTPError({
                            status: Status.HTTP_400_BAD_REQUEST,
                            message: 'Email already exists',
                        });
                    }

                    const { password, ...data } = body;
                    const hashedPassword = await getPasswordHash(password);

                    const newUser = await service.createUser(tx, {
                        ...data,
                        hashedPassword,
                    });

                    if (EMAIL_ENABLED && data.email) {
                        const verifyEmailToken = await jwt.sign({
                            sub: data.email,
                        });
                        const emailData = generateAccountVerificationEmail(
                            data.email,
                            verifyEmailToken,
                        );
                        setTimeout(async () => {
                            await sendEmail(emailData);
                        }, 1000);
                    }

                    set.status = Status.HTTP_201_CREATED;
                    return newUser;
                },
                {
                    body: UserCreate,
                    response: {
                        [Status.HTTP_201_CREATED]: UserRead,
                    },
                },
            )
            .patch(
                '/:id',
                async ({ tx, params: { id }, body }) => {
                    const updateUser = await service.getUser(tx, id);

                    if (!updateUser) {
                        throw new HTTPError({
                            status: Status.HTTP_404_NOT_FOUND,
                            message: 'User not found',
                        });
                    }

                    const { password, ...data } = body;
                    let hashedPassword = undefined;

                    if (password) {
                        hashedPassword = await getPasswordHash(password);
                    }

                    const updatedUser = await service.updateUser(
                        tx,
                        updateUser,
                        {
                            ...data,
                            hashedPassword,
                        },
                    );

                    return updatedUser;
                },
                {
                    params: t.Object({
                        id: t.String({ format: 'uuid' }),
                    }),
                    body: UserUpdate,
                    response: {
                        [Status.HTTP_200_OK]: UserRead,
                    },
                },
            )
            .delete(
                '/:id',
                async ({ currentUser, tx, params: { id } }) => {
                    const deleteUser = await service.getUser(tx, id);

                    if (!deleteUser) {
                        throw new HTTPError({
                            status: Status.HTTP_404_NOT_FOUND,
                            message: 'User not found',
                        });
                    }

                    if (deleteUser.id === currentUser.id) {
                        throw new HTTPError({
                            status: Status.HTTP_403_FORBIDDEN,
                            message: "You can't delete yourself",
                        });
                    }

                    await service.softDeleteUser(tx, deleteUser);

                    return { message: 'User deleted successfully' };
                },
                {
                    params: t.Object({
                        id: t.String({ format: 'uuid' }),
                    }),
                    response: {
                        [Status.HTTP_200_OK]: Message,
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
                        currentUser,
                        body,
                    );

                    return updatedUser;
                },
                {
                    body: UserMeUpdate,
                    response: {
                        [Status.HTTP_200_OK]: UserMeRead,
                    },
                },
            )
            .patch(
                '/me/password',
                async ({ tx, currentUser, body }) => {
                    if (!currentUser.hashedPassword) {
                        throw new HTTPError({
                            status: Status.HTTP_400_BAD_REQUEST,
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
                            status: Status.HTTP_400_BAD_REQUEST,
                            message: 'Invalid password',
                        });
                    }

                    if (currentPassword === newPassword) {
                        throw new HTTPError({
                            status: Status.HTTP_400_BAD_REQUEST,
                            message: 'New password must be different',
                        });
                    }

                    const hashedPassword = await getPasswordHash(newPassword);
                    await service.updateUser(tx, currentUser, {
                        hashedPassword,
                    });

                    return { message: 'User updated successfully' };
                },
                {
                    body: UpdatePassword,
                    response: {
                        [Status.HTTP_200_OK]: Message,
                    },
                },
            ),
    )
    .post(
        '/signup',
        async ({ tx, jwt, set, body }) => {
            const { email, password } = body;

            const user = await service.getUserByEmail(tx, email);

            if (user) {
                throw new HTTPError({
                    status: Status.HTTP_400_BAD_REQUEST,
                    message: 'User already exists',
                });
            }

            const hashedPassword = await getPasswordHash(password);

            await service.createUser(tx, {
                email,
                hashedPassword,
            });

            if (EMAIL_ENABLED && email) {
                const verifyEmailToken = await jwt.sign({
                    sub: email,
                });
                const emailData = generateAccountVerificationEmail(
                    email,
                    verifyEmailToken,
                );
                setTimeout(async () => {
                    await sendEmail(emailData);
                }, 1000);
            }

            set.status = Status.HTTP_201_CREATED;
            return { message: 'User created successfully' };
        },
        {
            body: UserRegiser,
            response: {
                [Status.HTTP_201_CREATED]: Message,
            },
        },
    )
    .post(
        '/verify-email',
        async ({ tx, jwt, body }) => {
            const tokenIsValid = await jwt.verify(body.token);

            if (!tokenIsValid) {
                throw new HTTPError({
                    status: Status.HTTP_400_BAD_REQUEST,
                    message: 'Token is invalid',
                });
            }

            const email = tokenIsValid.sub;

            const user = await service.getUserByEmail(tx, email);

            if (!user) {
                throw new HTTPError({
                    status: Status.HTTP_404_NOT_FOUND,
                    message: 'User not found',
                });
            }

            await service.updateUser(tx, user, {
                isActive: true,
            });

            return {
                message: 'Verified email successfully',
            };
        },
        {
            response: {
                [Status.HTTP_200_OK]: Message,
            },
            body: t.Object({
                token: t.String(),
            }),
        },
    );
