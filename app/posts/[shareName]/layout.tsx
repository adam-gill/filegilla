import Container from "@/components/container";

export default function PostsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Container>
        <div className="mt-4 pt-16">{children}</div>
      </Container>
    </>
  );
}
