import { file } from "filegilla";
import Link from "next/link";
import { BsThreeDotsVertical } from "react-icons/bs";
import { Button } from "./ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";
import { showToast } from "@/lib/showToast";
import { deleteFile } from "@/lib/deleteFile";
import { cleanDate, cleanName, convertSize, getFileIconJSX, handleDownload } from "@/lib/helpers";

interface fileProps extends file {
  userId: string | undefined;
  loadFiles: () => Promise<void>;
}

const File = ({
  name,
  sizeInBytes,
  lastModified,
  blobUrl,
  md5hash,
  userId,
  loadFiles,
}: fileProps) => {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <>
      <div
        className="flex relative flex-col w-full max-w-64 border-2 border-white rounded-lg p-2 cc my-2 mx-2"
        data-md5={md5hash}
      >
        <div className="absolute top-2 left-2">{getFileIconJSX(name)}</div>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 p-1 hover:bg-[#a0a0a06f] hover:text-white transition-all duration-300 rounded-full"
            >
              <BsThreeDotsVertical className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 shadow-md z-50" sideOffset={5}>
            <div className="flex flex-col space-y-1">
              <Button variant="ghost" className="justify-start" asChild>
                <Link href={"/view/" + name} className="w-full">
                  Open
                </Link>
              </Button>
              <Button
                onClick={() => {
                  showToast(`Downloading ${name}...`, "", "default");
                  handleDownload(blobUrl, name);
                  setOpen(false);
                }}
                variant="ghost"
                className="justify-start w-full"
              >
                Download
              </Button>
              <Button
                variant="ghost"
                className="justify-start cursor-not-allowed"
              >
                Rename
              </Button>
              <Button
                onClick={() => {
                  setOpen(false);
                  deleteFile(name, userId!, loadFiles);
                  showToast(`Deleting ${name}...`, "", "default");
                }}
                variant="ghost"
                className="justify-start text-red-600 hover:bg-red-600 hover:text-white"
              >
                Delete
              </Button>
            </div>
          </PopoverContent>
        </Popover>
        <Link href={"/view/" + name} className="flex flex-col cc py-2 px-4">
          <p>{cleanName(name)}</p>
          <p>{convertSize(sizeInBytes)}</p>
          <p>{cleanDate(lastModified)}</p>
        </Link>
      </div>
    </>
  );
};

export default File;
