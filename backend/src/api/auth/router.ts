import { Elysia, t } from 'elysia';

import * as userService from '@/api/users/service';
import { backgroundTasksPlugin } from '@/background-tasks';
import { getPasswordHash, security } from '@/core/security';
import { Status } from '@/enums';
import { HTTPError } from '@/errors';
import { dbSession } from '@/plugins/db';
import { Message } from '@/schemas/message';
import { generateResetPasswordEmail, sendEmail } from '@/utils';

import { NewPassword, UserLogin } from './schemas';
import * as service from './service';

export const router = new Elysia({
    prefix: '/auth',
    tags: ['auth'],
})
    .use(security)
    .use(dbSession)
    .use(backgroundTasksPlugin)
    .post(
        '/login',
        async ({ tx, body, jwt, cookie: { auth } }) => {
            const { username, password } = body;

            const user = await service.authenticate(tx, username, password);

            if (!user) {
                throw new HTTPError({
                    status: Status.HTTP_400_BAD_REQUEST,
                    message: 'Incorrect email or password',
                });
            }

            if (!user.isActive) {
                throw new HTTPError({
                    status: Status.HTTP_400_BAD_REQUEST,
                    message: 'Inactive user',
                });
            }

            auth.set({
                value: await jwt.sign({ sub: user.id }),
                httpOnly: true, // false for development in safari browser
                maxAge: 7 * 86400, // 7 days
                sameSite: 'strict',
                path: '/',
            });

            return {
                message: 'Login successfully',
            };
        },
        {
            body: UserLogin,
            response: {
                [Status.HTTP_200_OK]: Message,
            },
        },
    )
    .post(
        '/password-recovery/:email',
        async ({ params: { email }, tx, jwt, backgroundTasks }) => {
            const user = await userService.getUserByEmail(tx, email);

            if (!user) {
                throw new HTTPError({
                    status: Status.HTTP_404_NOT_FOUND,
                    message:
                        'The user with this email does not exist in the system.',
                });
            }

            // NOTE: wait for the conclusion
            // if (!user.isActive) {
            //     throw new HTTPError({
            //         status: Status.HTTP_400_BAD_REQUEST,
            //         message: 'Inactive user',
            //     });
            // }

            const passwordResetToken = await jwt.sign({
                sub: email,
                // TODO: add nbf
            });

            const emailData = generateResetPasswordEmail(
                email,
                passwordResetToken,
            );

            backgroundTasks.addTask(sendEmail, emailData);

            return {
                message: 'Password recovery email sent.',
            };
        },
        {
            params: t.Object({
                email: t.String({ format: 'email' }),
            }),
            response: {
                [Status.HTTP_200_OK]: Message,
            },
        },
    )
    .post(
        '/reset-password',
        async ({ tx, jwt, body }) => {
            const isTokenValid = await jwt.verify(body.token);

            if (!isTokenValid) {
                throw new HTTPError({
                    status: Status.HTTP_400_BAD_REQUEST,
                    message: 'Invalid token',
                });
            }

            const email = isTokenValid.sub;

            const user = await userService.getUserByEmail(tx, email);

            if (!user) {
                throw new HTTPError({
                    status: Status.HTTP_404_NOT_FOUND,
                    message:
                        'The user with this email does not exist in the system.',
                });
            }

            if (!user.isActive) {
                throw new HTTPError({
                    status: Status.HTTP_400_BAD_REQUEST,
                    message: 'Inactive user',
                });
            }

            const hashedPassword = await getPasswordHash(body.newPassword);

            await userService.updateUser(tx, user, {
                hashedPassword: hashedPassword,
            });

            return {
                message: 'Password updated successfully',
            };
        },
        {
            body: NewPassword,
            response: {
                [Status.HTTP_200_OK]: Message,
            },
        },
    );
