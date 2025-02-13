// import { Section, Tailwind, Text } from '@react-email/components';
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

export default function ResetPassword({ projectName, email, link }: Props) {
    return (
        <Html>
            <Head />
            <Preview>Verify Email</Preview>
            <Tailwind>
                <Section>
                    <Text>Project Name: {projectName}</Text>
                    <Text>Email: {email}</Text>
                    <Text>Link: {link}</Text>
                </Section>
            </Tailwind>
        </Html>
    );
}

ResetPassword.PreviewProps = {
    email: 'test@gmail.com',
    link: 'test',
    projectName: 'test',
};
