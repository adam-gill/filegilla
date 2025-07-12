import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";

import { Space_Grotesk } from "next/font/google";
import { Providers } from "./providers";
import { Toaster } from "@/components/ui/toaster"

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
  icons: ["/logoFav.png"]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn("antialiased", spaceGrotesk.className)}>
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}