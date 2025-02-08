import * as userService from '@/api/users/service';
import type { PrismaFlatTransactionClient } from '@/core/db';
import { verifyPassword } from '@/core/security';

export const authenticate = async (
    tx: PrismaFlatTransactionClient,
    email: string,
    password: string,
) => {
    const user = await userService.getUserByEmail(tx, email);

    if (!user) {
        return null;
    }

    if (!(await verifyPassword(password, user.hashedPassword))) {
        return null;
    }

    return user;
};
