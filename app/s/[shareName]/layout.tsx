import Container from "@/components/container";
import Navbar from "@/components/navbar";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Container>
        <div className="mt-4">{children}</div>
      </Container>
    </>
  );
}
