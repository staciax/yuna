import { t } from 'elysia';

export const UserLogin = t.Object({
    username: t.String({
        format: 'email',
        maxLength: 320,
    }),
    password: t.String({
        minLength: 8,
        maxLength: 255,
    }),
});

export const NewPassword = t.Object({
    token: t.String(),
    newPassword: t.String({ minLength: 8, maxLength: 255 }),
});
