"use client";

import { useState } from "react";
import FileUpload from "@/components/upload";
import Files from "@/components/files";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";

const Dashboard = () => {
  const [fileName, setFileName] = useState<string | null>("");
  const [search, setSearch] = useState<string>("");

  return (
    <>
      <div className="w-full py-10">
        <div className="w-full max-w-6xl px-6 mx-auto flex flex-col cc">
          {/* file upload */}
          <div className="flex w-full h-fit flex-row items-center justify-between mb-6">
            <FileUpload
              fileName={fileName}
              setFileName={setFileName}
              maxWidth={200}
            />

            <div className="w-fit flex flex-row items-center ml-4">
              <div className="relative block">
                {search === "" ? (
                  <Search size={24} className="stroke-white absolute right-2 top-1/2 -translate-y-1/2" />
                ) : (
                  <X
                    size={24}
                    className="stroke-white cursor-pointer absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={() => setSearch("")}
                  />
                )}
                <Input
                  className="max-w-[256px]"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                  }}
                />
              </div>
            </div>
          </div>

          <Files fileName={fileName} search={search} />
        </div>
      </div>
    </>
  );
};

export default Dashboard;

