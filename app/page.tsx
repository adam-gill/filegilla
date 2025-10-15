"use client";

import Link from "next/link";
import Typewriter from "typewriter-effect";

export default function Landing() {
  return (
    <main className="pt-16">
      <div className="flex flex-col w-full px-6 mx-auto max-w-7xl justify-between">
        <main className="flex flex-col items-center">
          <div className="w-full max-w-6xl max-md:text-4xl flex flex-col mt-8 text-6xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-gray-100 via-blue-400 to-blue-800 pb-4">
            private and secure cloud storage.
          </div>
          <div
            className={`text-center mt-8 not-visited:text-3xl transition-opacity duration-1000 ease-in-out `}
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

          <Link
            href={"/auth?signUp=1"}
            className="bg-gradient-to-r from-blue-800 via-blue-400 to-white text-black hover:brightness-90 font-medium mt-[300px] py-4 text-3xl text-center px-14 rounded-full hover:scale-105 transition-all duration-500 ease-in-out"
          >
            join now
          </Link>
          <p className="mt-2">{"join for free!"}</p>
        </main>

        <footer className="left-1/2 -translate-x-1/2 absolute bottom-0 mt-auto py-4">
          <h1 className="text-center">
            filegilla {new Date().getFullYear()}
            <span className="mx-2">&#x2022;</span>
            <Link href={"/privacy"}>
              <span className="underline">privacy policy</span>
            </Link>
            <span className="mx-2">&#x2022;</span>
            <Link href={"/terms"}>
              <span className="underline">terms of service</span>
            </Link>
          </h1>
        </footer>
      </div>
    </main>
  );
}
