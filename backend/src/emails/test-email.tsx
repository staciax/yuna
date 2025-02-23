import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Preview,
    Section,
    Tailwind,
    Text,
} from '@react-email/components';
// biome-ignore lint/correctness/noUnusedImports: allow react import
import * as React from 'react';

type Props = {
    projectName: string;
    email: string;
};

export default function TestEmail({ projectName, email }: Props) {
    return (
        <Html>
            <Head />
            <Tailwind>
                <Body className="mx-auto my-auto bg-white px-2 font-sans">
                    <Preview>Test Email from {projectName}</Preview>
                    <Container className="mx-auto my-[40px] max-w-[465px] rounded border border-[#eaeaea] border-solid p-[20px]">
                        <Section className="mt-[32px]">
                            <Text className="text-center font-bold text-[24px] text-black">
                                {projectName}
                            </Text>
                        </Section>
                        <Heading className="mx-0 my-[30px] p-0 text-center font-bold text-[24px] text-black">
                            Test Email
                        </Heading>
                        <Text className="text-[14px] text-black leading-[24px]">
                            This is a test email from {projectName}.
                        </Text>
                        <Text className="text-[14px] text-black leading-[24px]">
                            If you received this email, the email service is
                            working properly.
                        </Text>
                        <Text className="mt-4 text-[14px] text-black leading-[24px]">
                            Sent to: <strong>{email}</strong>
                        </Text>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
}

TestEmail.PreviewProps = {
    projectName: 'test',
    email: 'test@gmail.com',
};
