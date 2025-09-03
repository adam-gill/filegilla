import Navbar from "@/components/navbar";

export default function NotesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Navbar />
        <div>{children}</div>
    </>
  );
}
