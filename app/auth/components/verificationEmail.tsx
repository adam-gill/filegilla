import {
  Tailwind,
  pixelBasedPreset,
  Html,
  Head,
  Body,
  Container,
  Section,
  Img,
  Text,
} from "@react-email/components";

interface VerificationEmailProps {
  name: string;
  verificationCode: string;
}

export default function VerificationEmail({
  name,
  verificationCode,
}: VerificationEmailProps) {
  return (
    <Html>
      <Head />
      <Tailwind
        config={{
          presets: [pixelBasedPreset],
          theme: {
            extend: {
              colors: {
                brand: "#0f172a",
              },
            },
          },
        }}
      >
        <Body className="bg-[#f5f7fb] font-sans">
          <Container className="mx-auto my-[24px] max-w-[600px] rounded-lg bg-white shadow-sm">
            {/* Header */}
            <Section className="border-b border-[#e6edf3] px-[24px] py-[20px]">
              <table cellPadding="0" cellSpacing="0" border={0} style={{ width: '100%' }}>
                <tr>
                  <td style={{ width: '80px', verticalAlign: 'middle' }}>
                    <Img
                      src="https://filegilla.com/navLogo.png"
                      alt="Filegilla"
                      width={80}
                      height={32}
                      className="block object-contain"
                    />
                  </td>
                  <td style={{ paddingLeft: '12px', verticalAlign: 'middle' }}>
                    <Text className="m-0 text-[18px] font-bold text-black">
                      filegilla
                    </Text>
                  </td>
                </tr>
              </table>
            </Section>

            {/* Body */}
            <Section className="px-[24px] py-[28px] text-black">
              <Text className="m-0 text-[16px] text-black">
                hi {name || "there"},
              </Text>

              <Text className="mb-[8px] mt-[16px] leading-[1.5] text-black">
                thanks for creating an account with filegilla. use the
                verification code below to complete your sign up. this code will
                expire in 30 minutes.
              </Text>

              <Section className="my-[20px] flex justify-center">
                <div className="rounded-lg bg-[#0f172a] px-[22px] py-[14px] font-mono text-[26px] font-bold tracking-[4px] text-white">
                  {verificationCode}
                </div>
              </Section>

              <Text className="mb-[8px] mt-0 text-[#334155]">
                if you didn&#39;t request this, you can safely ignore this email.
              </Text>
            </Section>

            {/* Footer */}
            <Section className="border-t border-[#e6edf3] bg-[#fbfdff] px-[24px] py-[16px] text-[13px] text-[#64748b]">
              <Text className="m-0">filegilla</Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}