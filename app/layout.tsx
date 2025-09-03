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
- Allowing users to create tiptap documents, save, rename, delete, them etc 
  (should be the same as other files if) I store them as files like the others
- move /note to upload the html data to s3 not database (infinite file size compared to 1GB)
  - might have to not use server actions for syncing/fetching data because the limits are low
    and I shouldn't be processing a shit ton of data server side anyway
  - fix sync icon (not symmetrical - use svg or something)
*/
