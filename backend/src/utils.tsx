import nodemailer from 'nodemailer';

import { EMAIL_ENABLED, env } from '@/core/config';
import ResetPassword from '@/emails/reset-password';
import { renderToStaticMarkup } from 'react-dom/server';

import * as React from 'react';
import VerifyEmail from './emails/verify-email';

// https://www.nodemailer.com/smtp/
// https://github.com/nodemailer/nodemailer

// export const renderEmail = (props) => {
//     const html = renderToStaticMarkup();
//     return html;
// };

type EmailPayload = {
    email_to: string | string[];
    subject: string;
    htmlContent: string;
};

export const sendEmail = async ({
    email_to,
    subject,
    htmlContent: html,
}: EmailPayload) => {
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

// export const renderEmailTemplate = ({ props }) => {};

// TODO: email template localization

export const generateResetPasswordEmail = (
    email: string,
    token: string,
): EmailPayload => {
    const link = `${env.FRONTEND_HOST}/reset-password/token=${token}`;
    const htmlContent = renderToStaticMarkup(
        <ResetPassword
            projectName={env.PROJECT_NAME}
            email={email}
            link={link}
        />,
    );
    return {
        email_to: email,
        subject: 'Reset Password',
        htmlContent: htmlContent,
    };
};

export const generateAccountVerificationEmail = (
    email: string,
    token: string,
) => {
    const link = `${env.FRONTEND_HOST}/verify-email/token=${token}`;
    const htmlContent = renderToStaticMarkup(
        <VerifyEmail
            projectName={env.PROJECT_NAME}
            email={email}
            link={link}
        />,
    );
    return {
        email_to: email,
        subject: 'Verify Email',
        htmlContent: htmlContent,
    };
};

// TODO: email template
// TODO: user email verification
// TODO: user password reset
