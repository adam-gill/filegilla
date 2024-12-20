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
import { renameFile } from "@/lib/renameFile";
import {
  cleanDate,
  cleanName,
  convertSize,
  getFileIconJSX,
  handleDownload,
} from "@/lib/helpers";
import { AlertDialogComponent } from "./alert";

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
        className="flex relative flex-col w-full max-w-[256px] border-2 border-white rounded-lg p-2 cc"
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
              <Button
                onClick={() => setOpen(false)}
                variant="ghost"
                className="justify-start"
                asChild
              >
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
              <AlertDialogComponent
                title="Rename File"
                description={`Enter a new name for ${decodeURIComponent(name)}`}
                variant="ghost"
                popOver={true}
                isRename={true}
                triggerText="Rename"
                confirmText="Rename"
                setOpen={setOpen}
                inputProps={{
                  defaultValue: decodeURIComponent(name),
                  placeholder: "Enter new filename",
                }}
                onConfirm={(newName) => {
                  if (newName) {
                    showToast(`Renaming ${name}...`, "", "default");
                    setOpen(false);
                    renameFile(userId!, name, newName, loadFiles);
                  }
                }}
              />
              <AlertDialogComponent
                title="Are you absolutely sure?"
                variant="destructive"
                setOpen={setOpen}
                popOver={true}
                description={`This action cannot be undone. This will permanently delete ${decodeURIComponent(
                  name
                )}.`}
                triggerText="Delete"
                onConfirm={() => {
                  showToast(`Deleting ${name}...`, "", "default");
                  setOpen(false);
                  deleteFile(name, userId!, loadFiles);
                }}
              />
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
