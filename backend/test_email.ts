import { Value } from '@sinclair/typebox/value';
import { t } from 'elysia';
import nodemailer from 'nodemailer';

const envSchema = t.Object({
    // Email
    SMTP_TLS: t.Boolean({
        default: true,
        description: 'Enable TLS for SMTP',
    }),
    SMTP_SSL: t.Boolean({
        default: false,
        description: 'Enable SSL for SMTP',
    }),
    SMTP_HOST: t.String({
        description: 'SMTP host',
    }),
    SMTP_PORT: t.Integer({
        default: 587,
        description: 'SMTP port',
    }),
    SMTP_USER: t.String({
        description: 'SMTP user',
    }),
    SMTP_PASSWORD: t.String({
        description: 'SMTP password',
    }),
    EMAILS_FROM_EMAIL: t.Optional(
        t.String({
            format: 'email',
            description: 'Emails from email',
        }),
    ),
    EMAILS_FROM_NAME: t.Optional(
        t.String({
            description: 'Emails from name',
        }),
    ),
});

export type Environment = typeof envSchema.static;

export const env: Environment = Value.Parse(envSchema, process.env);

const error = Value.Errors(envSchema, env);

if (error.First()) {
    7;
    console.error('Invalid environment variables, check the errors below!');
    console.error([...error]);
    process.exit(1);
}

if (env.SMTP_SSL && env.SMTP_TLS) {
    console.error(
        'SMTP_SSL and SMTP_TLS cannot be enabled at the same time,',
        'please enable only one of them',
    );
    process.exit(1);
}

export const EMAIL_ENABLED = Boolean(env.SMTP_HOST && env.EMAILS_FROM_EMAIL);

// https://www.nodemailer.com/smtp/
// https://github.com/nodemailer/nodemailer

type EmailPayload = {
    email_to: string | string[];
    subject: string;
    html: string;
};

export const sendEmail = async ({ email_to, subject, html }: EmailPayload) => {
    if (!EMAIL_ENABLED) {
        console.log('Email is disabled');
        return;
    }
    const transporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        auth: {
            user: env.SMTP_USER,
            pass: env.SMTP_PASSWORD,
        },
        // debug: true,
    });

    const mailOptions = {
        from: `${env.EMAILS_FROM_NAME} <${env.EMAILS_FROM_EMAIL}>`,
        to: email_to,
        subject: subject,
        html: html,
        secure: env.SMTP_SSL,
        ...(env.SMTP_TLS && {
            tls: {
                rejectUnauthorized: false,
                minVersion: 'TLSv1.2',
            },
        }),
    };

    const response = await transporter.sendMail(mailOptions);
    console.log('send email result:', response);
};

await sendEmail({
    email_to: '',
    subject: 'Test email',
    html: '<h1>Test email</h1>',
});
