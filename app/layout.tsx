import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";

import { Space_Grotesk } from "next/font/google";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: {
    template: "%s",
    default: "FileGilla",
  },
  description: "Store your stuff on the cloud",
  openGraph: {
    images: "/ogLogo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn("antialiased", spaceGrotesk.className)}>
        {children}
      </body>
    </html>
  );
}
