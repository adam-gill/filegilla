import type { Metadata } from "next";

export function metadata(): Metadata {
  return {
    title: "Viewer",
    description: "FileGilla File Viewer",
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
