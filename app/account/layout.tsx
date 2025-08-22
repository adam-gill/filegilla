import Navbar from "@/components/navbar";
import type { Metadata } from "next";

export function metadata(): Metadata {
  return {
    title: "dashboard",
    description: "filegilla dashboard",
    openGraph: {
      images: "/ogLogo.png",
    },
  };
}

export default function AccountLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main>
      <Navbar />
      {children}
    </main>
  );
}
