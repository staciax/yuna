import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Link,
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
    link: string;
};

export default function ResetPassword({ projectName, email, link }: Props) {
    return (
        <Html>
            <Head />
            <Tailwind>
                <Body className="mx-auto my-auto bg-white px-2 font-sans ">
                    <Preview>Reset Password</Preview>
                    <Container className="mx-auto my-[40px] max-w-[465px] rounded border border-[#eaeaea] border-solid p-[20px]">
                        <Section className="mt-[32px]">
                            <Text className="text-center font-bold text-[24px] text-black">
                                {projectName}
                            </Text>
                        </Section>
                        <Heading className="mx-0 my-[30px] p-0 text-center font-bold text-[24px] text-black">
                            Reset Password
                        </Heading>
                        <Text className="font-bold text-[14px] text-black leading-[24px]">
                            Hello, {email}
                        </Text>
                        <Text className="text-[14px] text-black leading-[24px]">
                            We received a request to reset your password for
                            your account at <strong>{projectName}</strong>. To
                            reset your password, click the button below.
                        </Text>
                        <Section className="mt-[32px] mb-[32px] text-center">
                            <Button
                                className="rounded bg-[#000000] px-5 py-3 text-center font-semibold text-[12px] text-white no-underline"
                                href={link}
                            >
                                Reset Password
                            </Button>
                        </Section>
                        <Text className="text-[14px] text-black leading-[24px]">
                            <strong>Note: </strong>
                            If you can't click the button, copy and paste the
                            following link in your browser:{' '}
                            <Link href={link}>{link}</Link>
                        </Text>
                        <Hr className="mx-0 my-[26px] w-full border border-[#eaeaea] border-solid" />
                        <Text className="text-[#666666] text-[12px] leading-[24px]">
                            &copy; 2024-present {projectName}. All rights
                            reserved.
                        </Text>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
}

ResetPassword.PreviewProps = {
    projectName: 'test',
    email: 'test@gmail.com',
    link: 'http://localhost:3000/reset-password?token=token',
};
