import { Message } from '@/schemas/message';
import { generateTestEmail, sendEmail } from '@/utils';
import { Elysia, t } from 'elysia';

export const router = new Elysia({
    prefix: '/tests',
    tags: ['tests'],
}).get(
    '/test-email/:email_to',
    async ({ params: { email_to: emailTo } }) => {
        const emailData = generateTestEmail(emailTo);
        setTimeout(async () => {
            await sendEmail(emailData);
        }, 1000);

        return { message: 'Email sent' };
    },
    {
        params: t.Object({
            email_to: t.String({ format: 'email' }),
        }),
        response: {
            201: Message,
        },
    },
);
