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
      <div className="w-full py-10">
        <div className="w-full max-w-6xl px-6 mx-auto">{children}</div>
      </div>
    </>
  );
}
