import React from "react";

export default function SignInLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen min-w-screen flex items-center justify-center">
      {children}
    </main>
  );
}
