import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Analytics } from "@vercel/analytics/next";

import { Space_Grotesk } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import Navbar from "@/components/navbar";
import { TooltipProvider } from "@/components/ui/tooltip";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-sg",
});

export const metadata: Metadata = {
  title: {
    template: "%s",
    default: "filegilla",
  },
  description: "store your stuff in the cloud",
  openGraph: {
    title: "filegilla",
    description: "store your stuff in the cloud",
    images: [
      {
        url: "/ogLogo.png",
        width: 1200,
        height: 630,
        alt: "filegilla posts",
      },
    ],
    type: "website",
  },
  icons: ["/logoFav.png"],
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={cn("antialiased bg-black", spaceGrotesk.className)}>
        <Navbar />
        <TooltipProvider>{children}</TooltipProvider>
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}

/*

  Current TODOs

  TODO - Page to view shared files
  TODO - Shared files view counter
  TODO - Add friends and posts (future)
  TODO - Need global search function (file names) - will involve beefy script

*/
