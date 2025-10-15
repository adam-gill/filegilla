import Container from "@/components/container";

export default function DashboardLayout({
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
