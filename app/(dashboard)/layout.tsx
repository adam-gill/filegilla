import type { Metadata } from "next";

export function metadata(): Metadata {
  return {
    title: "Dashboard",
    description: "FileGilla Dashboard",
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
      <div>{children}</div>
    </>
  );
}
