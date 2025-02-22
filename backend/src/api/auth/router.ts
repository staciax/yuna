import * as userService from '@/api/users/service';
import { getPasswordHash, security } from '@/core/security';
import { HTTPError } from '@/errors';
import { dbSession } from '@/plugins/db';
import { Message } from '@/schemas/message';
import { generateResetPasswordEmail, sendEmail } from '@/utils';

import { NewPassword, UserLogin } from './schemas';
import * as service from './service';

import { Elysia, t } from 'elysia';

export const router = new Elysia({
    prefix: '/auth',
    tags: ['auth'],
})
    .use(security)
    .use(dbSession)
    .post(
        '/login',
        async ({ tx, body, jwt, cookie: { auth } }) => {
            const { username, password } = body;

            const user = await service.authenticate(tx, username, password);

            if (!user) {
                throw new HTTPError({
                    status: 404,
                    message: 'Not found user',
                });
            }

            if (!user.isActive) {
                throw new HTTPError({
                    status: 400,
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
                200: Message,
            },
        },
    )
    .post(
        '/password-recovery/:email',
        async ({ tx, jwt, params: { email } }) => {
            const user = await userService.getUserByEmail(tx, email);

            if (!user) {
                throw new HTTPError({
                    status: 400,
                    message: 'User not found',
                });
            }

            if (!user.isActive) {
                throw new HTTPError({
                    status: 404,
                    message: 'Inactive user',
                });
            }

            const passwordResetToken = await jwt.sign({
                sub: email,
                // TODO: add nbf
            });

            const html = generateResetPasswordEmail(email, passwordResetToken);

            // NOTE: send email after api response 1 sec
            setTimeout(async () => {
                await sendEmail(html);
            }, 1000);

            return {
                message: 'Password recovery email sent.',
            };
        },
        {
            params: t.Object({
                email: t.String({ format: 'email' }),
            }),
            response: {
                200: Message,
            },
        },
    )
    .post(
        '/reset-password',
        async ({ tx, jwt, body }) => {
            const tokenIsValid = await jwt.verify(body.token);

            if (!tokenIsValid) {
                throw new HTTPError({
                    status: 400,
                    message: 'Invalid token',
                });
            }

            const email = tokenIsValid.sub;

            const user = await userService.getUserByEmail(tx, email);

            if (!user) {
                throw new HTTPError({
                    status: 404,
                    message: 'User not found',
                });
            }

            if (!user.isActive) {
                throw new HTTPError({
                    status: 404,
                    message: 'Inactive user',
                });
            }

            const hashedPassword = await getPasswordHash(body.newPassword);

            await userService.updateUser(tx, user, {
                hashedPassword: hashedPassword,
            });

            await tx.$commit();

            return {
                message: 'Password updated successfully',
            };
        },
        {
            body: NewPassword,
            response: {
                200: Message,
            },
        },
    );
