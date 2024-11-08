import { file } from "filegilla";
import Link from "next/link";
import {
  GrDocumentImage,
  GrDocumentPdf,
  GrDocumentWord,
  GrDocumentVideo,
  GrDocumentZip,
  GrDocumentText,
} from "react-icons/gr";
import { BsThreeDotsVertical } from "react-icons/bs";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import axios from "axios";
import { useState } from "react";
import { showToast } from "@/lib/showToast";

interface fileProps extends file {
  userId: string | undefined;
  loadFiles: () => Promise<void>;
}

const File = ({ name, sizeInBytes, lastModified, blobUrl, md5hash, userId, loadFiles }: fileProps) => {

  const [open, setOpen] = useState<boolean>(false);

  const deleteFile = async (fileName: string) => {
    try {
      if (userId && fileName) {
        await axios.delete("/api/deleteFile", {
          data: {
            userId: userId,
            blobName: fileName,
          }
        })
        loadFiles();

        showToast(`Successfully deleted ${fileName}!`, "", "good")
      }
    } catch (error) {
      console.log("File deletion error: " + error)
    }
  }

  const convertSize = (size: number) => {
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];

    if (size === 0) return "0 Byte";

    const i = Math.floor(Math.log(size) / Math.log(1024));
    return Math.round(size / Math.pow(1024, i)) + " " + sizes[i];
  };


  const cleanName = (name: string): string => {
    if (name.length > 17) {
      name = name.slice(0, 16) + "...";
    }

    return name;
  };


  const cleanDate = (dateString: string): string => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      year: "2-digit",
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    };

    return date.toLocaleDateString(undefined, options);
  };

  const fileIcons = (name: string) => {
    const lastPeriodIndex = name.lastIndexOf(".");
    if (lastPeriodIndex === -1) return <GrDocumentText />;

    const fileExtension = name.slice(lastPeriodIndex + 1);

    if (fileExtension === "pdf") {
      return <GrDocumentPdf />;
    } else if (fileExtension === "doc" || fileExtension === "docx") {
      return <GrDocumentWord />;
    } else if (
      fileExtension === "png" ||
      fileExtension === "jpg" ||
      fileExtension === "jpeg"
    ) {
      return <GrDocumentImage />;
    } else if (
      fileExtension === "mov" ||
      fileExtension === "mp4" ||
      fileExtension == "webm"
    ) {
      return <GrDocumentVideo />;
    } else if (
      fileExtension === "zip" ||
      fileExtension === "xz" ||
      fileExtension === "gz"
    ) {
      return <GrDocumentZip />;
    } else {
      return <GrDocumentText />;
    }
  };

  return (
    <>
      <div
        className="flex relative flex-col w-full max-w-64 border-2 border-white rounded-lg p-2 cc my-2 mx-2"
        data-md5={md5hash}
      >
        <div className="absolute top-2 left-2">{fileIcons(name)}</div>
        <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="absolute top-2 right-2 p-1 hover:bg-[#a0a0a06f] hover:text-white transition-all duration-300 rounded-full">
            <BsThreeDotsVertical className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56 shadow-md z-50" sideOffset={5}>
          <div className="flex flex-col space-y-1">
            <Button variant="ghost" className="justify-start" asChild>
              <Link href={blobUrl} className="w-full">
                Open
              </Link>
            </Button>
            <Button variant="ghost" className="justify-start">
              Download
            </Button>
            <Button variant="ghost" className="justify-start">
              Rename
            </Button>
            <Button onClick={() => {
              setOpen(false);
              deleteFile(name);
              showToast(`Deleting ${name}...`, "", "default");
              }} variant="ghost" className="justify-start text-red-600 hover:bg-red-600 hover:text-white">
              Delete
            </Button>
          </div>
        </PopoverContent>
      </Popover>
        <Link href={blobUrl} className="flex flex-col cc py-2 px-4">
          <p>{cleanName(name)}</p>
          <p>{convertSize(sizeInBytes)}</p>
          <p>{cleanDate(lastModified)}</p>
        </Link>
      </div>
    </>
  );
};

export default File;
