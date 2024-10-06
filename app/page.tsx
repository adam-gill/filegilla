"use client";

import { Button } from "@/components/ui/button";
import { useSession, signIn } from "next-auth/react";
import Image from "next/image";
import { useEffect } from "react";
// import { useRouter } from "next/navigation";
import Typewriter from "typewriter-effect";

export default function Home() {
  const { data: session, status } = useSession();
  // const router = useRouter();

  useEffect(() => {
    console.log(session);
    console.log(status);
  }, [session, status]);

  return (
    <div className="w-full h-full flex-col px-8 mx-auto max-w-7xl">
      <nav className="w-full px-8 py-4 h-20 flex items-center justify-center">
        <ul className="w-full flex justify-between">
          <li className="flex items-center justify-center cursor-pointer">
            <Image
              src="/navLogo.png"
              width={40}
              height={40}
              alt="logo"
              className="mr-4"
            />
            <h1 className="text-2xl font-bold">FileGilla</h1>
          </li>
          <li>
            <Button onClick={() => signIn("azure-ad-b2c")} variant={"secondary"}>Sign In</Button>
          </li>
        </ul>
      </nav>

      <div className="w-full h-[200px] max-w-[900px] mx-auto flex flex-col cc mt-16 text-7xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-400 to-blue-800 pb-4">
        <Typewriter
          options={{
            strings: ["Storage in the Cloud with Privacy and Security"],
            autoStart: true,
            loop: false,
            delay: 80,
            deleteSpeed: 999999999,
          }}
        />
      </div>

      <h1 className="text-center mt-8 text-2xl">All of your storage needs in one place</h1>
      
    </div>
  );
}

// need to edit auth profiles for edited user data

{
  /* <div className="text-4xl text-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <Image
          src="/logoSvg.svg"
          width={400}
          height={400}
          alt="logo"
          className="mb-4"
        />
        FileGilla
      </div> */
}

// import { useSession, signIn, signOut } from "next-auth/react";

{
  /* <Button onClick={() => signIn("azure-ad-b2c")}>Sign In</Button>
      {session && session.user && <p>{"Email: " + session.user.email}</p>}

      <Button onClick={() => signOut()}>Sign Out</Button>
      <Button className="ml-4" onClick={() => router.push("/test")}>Go to test page</Button> */
}
