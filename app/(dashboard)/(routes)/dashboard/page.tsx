"use client";

import { Button } from "@/components/ui/button";
import { signIn, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { TailSpin } from "react-loading-icons";
import { useAuth } from "@/lib/useAuth";
import Loading from "@/components/loading";
import { useRouter } from "next/navigation";
import FileUpload from "@/components/upload";
import Files from "@/components/files";

const Dashboard = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const { session, status } = useAuth();
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/")
    }
  }, [status])

  if (status === "loading") {
    return <Loading />
  }

  if (status === "authenticated") {
    return (
      <>
        <div className="w-full py-10">
          <div className="w-full max-w-6xl px-6 mx-auto">
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

          {/* file upload */}
          <FileUpload label="File Upload" maxWidth={500} className="my-8"/>

          <Files />

          </div>
        </div>
      </>
    );
  }
};

export default Dashboard;
