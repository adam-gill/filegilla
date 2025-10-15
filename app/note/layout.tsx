export default function NotesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
        <div>{children}</div>
    </>
  );
}
