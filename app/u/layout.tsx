import Container from "@/components/container";
import Navbar from "@/components/navbar";
import type { Metadata } from "next";

export function metadata(): Metadata {
  return {
    title: "dashboard",
    description: "fileGilla dashboard",
    openGraph: {
      images: "/ogLogo.png",
    },
  };
}

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Container>
        {children}
      </Container>
    </>
  );
}

