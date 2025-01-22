"use client";

import { useState } from "react";
import FileUpload from "@/components/upload";
import Files from "@/components/files";
import SearchBar from "@/components/search";

const Dashboard = () => {
  const [fileName, setFileName] = useState<string | null>("");
  const [search, setSearch] = useState<string>("");

  return (
    <>
      <div className="w-full py-10">
        <div className="w-full max-w-6xl px-6 mx-auto flex flex-col cc">
          <div className="flex w-full h-fit flex-row items-center justify-between sm:justify-center mb-6">
            <FileUpload
              fileName={fileName}
              setFileName={setFileName}
              className="max-w-[200px] sm:max-w-[50%] mr-2"
            />
            <SearchBar search={search} setSearch={setSearch} />
          </div>
          <Files fileName={fileName} search={search} />
        </div>
      </div>
    </>
  );
};

export default Dashboard;
