import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";

import { Space_Grotesk } from "next/font/google";
import { Toaster } from "@/components/ui/toaster"
import ServerAuthProvider from "@/components/auth/server-auth-provider";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-sg"
});


export const metadata: Metadata = {
  title: {
    template: "%s",
    default: "FileGilla",
  },
  description: "Store your stuff in the cloud",
  openGraph: {
    images: "/ogLogo.png",
  },
  icons: ["/logoFav.png"],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn("antialiased", spaceGrotesk.className)}>
        <ServerAuthProvider>
          {children}
        </ServerAuthProvider>
        <Toaster />
      </body>
    </html>
  );
}