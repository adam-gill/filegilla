"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";
import Typewriter from "typewriter-effect";
import { TailSpin } from "react-loading-icons";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";

export default function Home() {
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();


  return (
    <div className="flex flex-col min-h-screen w-full px-8 mx-auto max-w-7xl">
      <Navbar />

      <main className="flex-grow flex flex-col items-center">
        <div className="w-full h-[165px] max-w-[900px] mx-auto flex flex-col mt-16 text-7xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-gray-100 via-blue-400 to-blue-800 pb-4">
          Storage in the Cloud with Privacy and Security
        </div>
        <div
          className={`text-center mt-8 text-3xl transition-opacity duration-1000 ease-in-out `}
        >
          <Typewriter
            options={{
              strings: [
                "All of your storage needs in one place.",
                "Complete data privacy and security.",
                "Engineered with love.",
              ],
              autoStart: true,
              loop: true,
              delay: 60,
              deleteSpeed: 50,
            }}
          />
        </div>

        <Button
          disabled={loading}
          onClick={() => {
            setLoading(true);
            router.push("/signin");
          }}
          variant={"pretty"}
          className="mt-36 w-72 py-8 text-3xl px-20 rounded-full hover:scale-105 transition-all duration-500 ease-in-out"
        >
          {loading ? (
            <TailSpin
              stroke="#000"
              strokeWidth={2.5}
              width={48}
              height={48}
              speed={2.5}
            />
          ) : (
            "Join Now"
          )}
        </Button>
        <p className="mt-2">{"Join for free!"}</p>
      </main>

      <footer className="mt-auto py-4">
        <h1 className="text-center">
          FileGilla {new Date().getFullYear()}
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