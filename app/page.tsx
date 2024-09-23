"use client"

import { Button } from "@/components/ui/button";
import { useSession, signIn, signOut } from "next-auth/react"
import Image from "next/image";
import { useEffect } from "react";

export default function Home() {

  const { data: session, status } = useSession()

  useEffect(() => {
      console.log(session)
      console.log(status)
  }, [session, status])

  return (
    <div className="w-full h-full flex">
      <div className="text-4xl text-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <Image src="/logoSvg.svg" width={400} height={400} alt="logo" className="mb-4" />
        FileGilla
      </div>

      <Button onClick={() => signIn("azure-ad-b2c")}>Sign In</Button>
      {session && session.user && <p>{"Email: " + session.user.email}</p>}

      <Button onClick={() => signOut()}>Sign Out</Button>

    </div>
  );
}
