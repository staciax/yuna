import { Elysia } from 'elysia';

import { getUser } from '@/api/users/service';
import { security } from '@/core/security';
import { HTTPError } from '@/errors';
import { dbSession } from '@/plugins/db';

// TODO: role check

export const getCurrentUser = new Elysia({ name: 'current-user' })
    .use(dbSession)
    .use(security)
    .derive(async ({ jwt, cookie: { auth }, tx }) => {
        const jwtPayload = await jwt.verify(auth.value);
        if (!jwtPayload) {
            throw new HTTPError({
                status: 403,
                message: 'Could not validate credentials',
            });
        }

        const userId = jwtPayload.sub;

        const user = await getUser(tx, userId);

        if (!user) {
            throw new HTTPError({
                status: 404,
                message: 'User not found',
            });
        }

        if (!user.isActive) {
            throw new HTTPError({
                status: 400,
                message: 'Inactive user',
            });
        }

        return { currentUser: user };
    })
    // .macro({
    //     allowedRoles(roles: string[]) {
    //         return {
    //             beforeHandle({ user }) {
    //                 if (user && !roles.includes(user.role)) {
    //                     throw new HTTPError({
    //                         status: 403,
    //                         message: "The user doesn't have enough privileges",
    //                     });
    //                 }
    //             },
    //         };
    //     },
    // })
    .as('plugin');
