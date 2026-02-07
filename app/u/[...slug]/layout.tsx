import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const lastSegment = slug?.[slug.length - 1] || "dashboard";
  const decodedTitle = decodeURIComponent(lastSegment);

  return {
    title: `${decodedTitle} - filegilla`,
    description: "view your personal files in peace and privacy",
    openGraph: {
      images: "/ogLogo.png",
    },
  };
}

export default function SlugLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
