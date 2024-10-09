"use client";

import { Button } from "@/components/ui/button";
import { signIn, signOut } from "next-auth/react";
import { useState } from "react";
import { TailSpin } from "react-loading-icons";
import { useAuth } from "@/lib/useAuth";

const Dashboard = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const { session } = useAuth()

  return (
    <>
      <main>
        <h1 className="text-2xl mb-2">Dashboard</h1>
        <p>{!!session && "User Object:"}</p>
        <pre>{JSON.stringify(session?.user, null, 2)}</pre>

        <Button
          className="w-24 mr-2"
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
        <Button
          className="mt-2 w-24"
          disabled={loading}
          onClick={() => {
            setLoading(true);
            signOut();
          }}
          variant={"white"}
        >
          {loading ? (
            <TailSpin stroke={"#000"} width={28} height={28} speed={2} />
          ) : (
            "Sign Out"
          )}
        </Button>
      </main>
    </>
  );
};

export default Dashboard;
