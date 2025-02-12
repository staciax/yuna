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

export default function VerifyEmail(props: Props) {
    return (
        <Html>
            <Head />
            <Preview>Verify Email</Preview>
            <Tailwind>
                <Body>
                    <Section>
                        <Text>Project Name: {props.projectName}</Text>
                        <Text>Email: {props.email}</Text>
                        <Text>Link: {props.link}</Text>
                    </Section>
                </Body>
            </Tailwind>
        </Html>
    );
}

VerifyEmail.PreviewProps = {
    email: 'test@gmail.com',
    link: 'test',
    projectName: 'test',
};
