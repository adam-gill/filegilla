import Container from "@/components/container";
import Navbar from "@/components/navbar";
import type { Metadata } from "next";

export function metadata(): Metadata {
  return {
    title: "dashboard",
    description: "fileGilla dashboard",
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
      <Navbar />
      <Container>
        {children}
      </Container>
    </>
  );
}
/*

All the todos I can think of right now:

TODO - list/rename/delete folders (folder cards)
TODO - upload/list/rename/delete file(s)
TODO - upload folder
TODO - edit username
TODO - edit profile picture
TODO - make alert dialog with input a reuseable component


*/
