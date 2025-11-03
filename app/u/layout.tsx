import Container from "@/components/container";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "dashboard",
  description: "filegilla dashboard",
  openGraph: {
    images: "/ogLogo.png",
    },
};

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Container className="pt-16">
        {children}
      </Container>
    </>
  );
}

