import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Analytics } from "@vercel/analytics/next"


import { Space_Grotesk } from "next/font/google";
import { Toaster } from "@/components/ui/toaster"

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-sg"
});


export const metadata: Metadata = {
  title: {
    template: "%s",
    default: "filegilla",
  },
  description: "store your stuff in the cloud",
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
    <html lang="en" className="dark">
      <body className={cn("antialiased bg-black", spaceGrotesk.className)}>
          {children}
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}


/*

TODO
- Move functionality (possibly drag and drop or selecting multiple folders/files)
- Uploading images to tiptap editor
- Allowing users to create tiptap documents, save, rename, delete, them etc 
  (should be the same as other files if) I store them as files like the others
- Allow users to share those documents and test what the collaboration would look like 
  - Will be a headache moving embedded images from private storage to public storage

*/
