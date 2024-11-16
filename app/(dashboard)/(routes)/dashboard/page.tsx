"use client";

import { useState } from "react";
import FileUpload from "@/components/upload";
import Files from "@/components/files";

const Dashboard = () => {
  const [fileName, setFileName] = useState<string | null>("");

  return (
    <>
      <div className="w-full py-10">
        <div className="w-full max-w-6xl px-6 mx-auto">
          <Files fileName={fileName} />

          {/* file upload */}
          <div className="w-full flex items-center justify-center">
            <FileUpload
              fileName={fileName}
              setFileName={setFileName}
              label="File Upload"
              maxWidth={500}
              className="my-8 "
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
