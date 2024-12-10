import axios from "axios";
import { file, listResponse } from "filegilla";
import File from "./file";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/useAuth";
import { showToast } from "@/lib/showToast";
import { Skeleton } from "./ui/skeleton";
import { Search, X } from "lucide-react";
import { Input } from "./ui/input";

interface props {
  fileName: string | null;
}

const Files: React.FC<props> = ({ fileName }) => {
  const { session } = useAuth();
  const userId = session?.user.id;
  const [files, setFiles] = useState<file[] | undefined>(undefined);
  const [search, setSearch] = useState<string>("");
  const [result, setResult] = useState<file[] | undefined>([]);

  const loadFiles = async () => {
    try {
      if (userId) {
        const response = await axios.get(`/api/list/${userId}`);
        const data = response.data as listResponse;

        setFiles(data.files);
      }
    } catch (error) {
      console.log(error);
      showToast(
        "Failed to load your files.",
        "Please try again",
        "destructive"
      );
      setFiles([]);
    }
  };

  useEffect(() => {
    const handleSearchChange = () => {
      if (files) {
        const res = files.filter((f) =>
          f.name.toLowerCase().includes(search.toLowerCase())
        );

        search ? setResult(res) : setResult(undefined);

        console.log();
      }
    };

    handleSearchChange();
  }, [search, files]);

  useEffect(() => {
    if (userId) loadFiles();
  }, [userId, fileName]);

  if (!files) {
    return (
      <>
        <div className="flex flex-col w-full">
          <h1 className="flex w-full text-lg font-medium justify-start items-center mb-3">
            {session?.user && `Welcome to FileGilla, ${session.user.firstName}`}
          </h1>
          <div className="w-full flex flex-row flex-wrap items-center justify-center">
            {new Array(8).fill(0).map((_, index) => (
              <Skeleton
                key={index}
                className="flex w-64 h-28 rounded-lg bg-[#a0a0a0a0] my-2 mx-2"
              />
            ))}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="w-full">
        <div className="w-full flex flex-row justify-between mb-3">
          <h1 className="flex cc text-lg font-medium">
            {files.length !== 0 &&
              session?.user &&
              `Welcome to FileGilla, ${session.user.firstName}`}
          </h1>

          <div className="relative">
            {search === "" ? (
              <Search
                size={24}
                className="stroke-white absolute right-2 top-1/2 -translate-y-1/2"
              />
            ) : (
              <X
                size={24}
                className="stroke-white absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer"
                onClick={() => setSearch("")}
              />
            )}
            <Input
              className=""
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
              }}
            />
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-center">
          {files.length === 0 && (
            <h1 className="w-full text-center text-2xl ">
              No files yet. Happy uploading!
            </h1>
          )}
          {files && !result ? (
            <>
              {files.map((file, index) => (
                <File
                  key={index}
                  {...file}
                  userId={userId}
                  loadFiles={loadFiles}
                />
              ))}
            </>
          ) : (
            <>
              {result &&
                result.map((file, index) => (
                  <File
                    key={index}
                    {...file}
                    userId={userId}
                    loadFiles={loadFiles}
                  />
                ))}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Files;
