"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/useAuth";
import Loading from "@/components/loading";
import { useRouter } from "next/navigation";
import FileUpload from "@/components/upload";
import Files from "@/components/files";

const Dashboard = () => {
  const [fileName, setFileName] = useState<string | null>("");
  const { status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  if (status === "loading") {
    return <Loading />;
  }

  if (status === "authenticated") {
    return (
      <>
        <div className="w-full py-10">
          <div className="w-full max-w-6xl px-6 mx-auto">
            <Files fileName={fileName} />

            {/* file upload */}
            <FileUpload
              fileName={fileName}
              setFileName={setFileName}
              label="File Upload"
              maxWidth={500}
              className="my-8"
            />
          </div>
        </div>
      </>
    );
  }
};

export default Dashboard;
