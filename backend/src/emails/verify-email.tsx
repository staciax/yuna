import {
    Body,
    Button,
    Column,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Img,
    Link,
    Preview,
    Row,
    Section,
    Tailwind,
    Text,
} from '@react-email/components';
// biome-ignore lint/correctness/noUnusedImports: allow react import
import * as React from 'react';

type Props = {
    projectName: string;
    email: string;
    link: string;
};

export default function VerifyEmail({ projectName, email, link }: Props) {
    return (
        <Html>
            <Head />
            <Preview>Verify Email</Preview>
            <Tailwind>
                <Body>
                    <Section>
                        <Text>Project Name: {projectName}</Text>
                        <Text>Email: {email}</Text>
                        <Text>Link: {link}</Text>
                    </Section>
                </Body>
            </Tailwind>
        </Html>
    );
}

VerifyEmail.PreviewProps = {
    projectName: 'test',
    email: 'test@gmail.com',
    link: 'http://localhost:3000/verify-email?token=token',
};
