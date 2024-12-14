"use client";

import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import Typewriter from "typewriter-effect";
import { useAuth } from "@/lib/useAuth";
import { TailSpin } from "react-loading-icons";
import { useRouter } from "next/navigation";
import Loading from "@/components/loading";

export default function Home() {
  const [hidden, setHidden] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const { status } = useAuth();
  const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

  useEffect(() => {
    const delayText = async () => {
      await delay(4000);
      setHidden(false);
    };
    delayText();
  }, [hidden]);

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  if (status === "loading") {
    return <Loading />;
  }

  if (status == "unauthenticated") {
    return (
      <div className="flex flex-col min-h-screen w-full px-8 mx-auto max-w-7xl">
        <nav className="w-full px-8 py-4 h-20 flex items-center justify-center">
          <ul className="w-full flex justify-between">
            <li className="flex items-center justify-center cursor-pointer">
              <Image
                src="/navLogo.png"
                width={40}
                height={32}
                alt="logo"
                className="mr-4 h-8 w-12"
              />
              <h1 className="text-2xl font-bold">FileGilla</h1>
            </li>
            <li className="flex cc">
              <Button
                className="w-24"
                disabled={loading}
                onClick={() => {
                  setLoading(true);
                  signIn("azure-ad-b2c");
                }}
                variant={"white"}
              >
                {loading ? (
                  <TailSpin
                    stroke="#000"
                    strokeWidth={2.5}
                    width={24}
                    height={24}
                    speed={2.5}
                  />
                ) : (
                  "Sign In"
                )}
              </Button>
            </li>
          </ul>
        </nav>

        <main className="flex-grow flex flex-col items-center">
          <div className="w-full h-[165px] max-w-[900px] mx-auto flex flex-col mt-16 text-7xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-400 to-blue-800 pb-4">
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
              signIn("azure-ad-b2c");
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

  return (
    <>
      <Loading />
    </>
  );
}


// lebron