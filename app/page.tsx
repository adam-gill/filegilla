"use client";

import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import Typewriter from "typewriter-effect";

export default function Home() {
  const [hidden, setHidden] = useState<boolean>(true);
  const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

  useEffect(() => {
    const delayText = async () => {
      await delay(4000);
      setHidden(false);
    };
    delayText();
  }, [hidden]);

  return (
    <div className="flex flex-col min-h-screen w-full px-8 mx-auto max-w-7xl">
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
            <Button
              onClick={() => signIn("azure-ad-b2c")}
              variant={"secondary"}
            >
              Sign In
            </Button>
          </li>
        </ul>
      </nav>

      <main className="flex-grow flex flex-col items-center">
        <div className="w-full h-[165px] max-w-[900px] mx-auto flex flex-col mt-16 text-7xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-400 to-blue-800 pb-4">
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

        <h1
          className={`text-center mt-8 text-2xl transition-opacity duration-1000 ease-in-out ${
            hidden ? "opacity-0 invisible" : "opacity-100 visible"
          }`}
        >
          All of your storage needs in one place
        </h1>

        <h1>Join for Free Today</h1>

        <Button variant={"pretty"} className="mt-40 py-8 text-4xl px-20 rounded-full hover:scale-105 transition-all duration-500 ease-in-out">Join Now</Button>
      </main>

      <footer className="mt-auto py-4">
        <h1 className="text-center">
          Copyright © {new Date().getFullYear()} FileGilla
          <span className="mx-2">&#x2022;</span>
          <Link href={"/privacy"}>
            <span className="underline">Privacy Policy</span>
          </Link>
          <span className="mx-2">&#x2022;</span>
          <Link href={"/terms"}>
            <span className="underline">Terms of Service</span>
          </Link>
        </h1>
      </footer>
    </div>
  );
}

// need to edit auth profiles for edited user data ****

// const { data: session, status } = useSession();
// const router = useRouter();

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
