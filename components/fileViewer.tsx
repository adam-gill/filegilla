"use client";

import { useState } from "react";
import { ChevronLeft, ZoomIn, ZoomOut, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/useAuth";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Skeleton } from "./ui/skeleton";
import { handleDownload } from "@/lib/helpers";

type props = {
  fileName: string;
};

const baseUrl = "https://filegillablobs.blob.core.windows.net/";

const FileViewer: React.FC<props> = ({ fileName }) => {
  const [scale, setScale] = useState(1);
  const { session } = useAuth();
  const router = useRouter();

  const fileType = fileName.split(".").pop()?.toLowerCase();
  let fileUrl: string | undefined = undefined;
  if (session?.user?.id && fileName) {
    fileUrl = baseUrl + "user-" + session?.user?.id + "/" + fileName;
  }

  const zoomIn = () => setScale(scale + 0.1);
  const zoomOut = () => setScale(Math.max(0.1, scale - 0.1));

  const renderFileContent = () => {
    switch (fileType) {
      case "pdf":
        return (
          <>
            {fileUrl && (
              <iframe
                style={{
                  width: "100%",
                  height: "127.5vh",
                  border: "none",
                  display: "block",
                  margin: "0 auto",
                  objectFit: "cover",
                }}
                src={`${fileUrl}#toolbar=0`}
              />
            )}
          </>
        );
      case "doc":
      case "docx":
      case "ppt":
      case "pptx":
        return (
          <iframe
            src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
              fileUrl || ""
            )}`}
            style={{
              width: "100%",
              height: "800px",
              border: "none",
              transform: `scale(${scale})`,
              transformOrigin: "top center",
            }}
            title="Document Viewer"
          />
        );
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return (
          <>
            {fileUrl ? (
              <Image
                src={fileUrl}
                width={400}
                height={400}
                alt={fileName}
                priority
                style={{ width: "auto", height: "auto"}}
              />
            ) : (
              <Skeleton className="w-[400px] h-[250px] bg-grayHover" />
            )}
          </>
        );
      case "mp4":
      case "webm":
      case "ogg":
      case "mov":
        return (
          <video src={fileUrl} controls style={{ width: `${scale * 100}%` }} />
        );
      case "wav":
      case "mp3":
        return (
          <audio src={fileUrl} controls style={{ width: `${scale * 100}%`}} />
        )
      default:
        return <p>Unsupported file type</p>;
    }
  };

  return (
    <div className="flex flex-col items-center w-full min-h-screen">
      {fileName && (
        <h1 className="font-bold text-3xl pb-4 w-full text-center relative">
          <ChevronLeft
            onClick={() => router.back()}
            size={32}
            className="absolute left-8 top-1/2 -translate-y-1/2 cursor-pointer"
          />
          {decodeURIComponent(fileName)}
        </h1>
      )}
      <div className="flex items-center justify-center rounded-lg p-4 w-full max-w-[80%] overflow-auto">
        {renderFileContent()}
      </div>
      <div className="mb-4 flex space-x-2 sticky">
        <Button onClick={zoomIn}>
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button onClick={zoomOut}>
          <ZoomOut className="h-4 w-4" />
        </Button>
        {fileUrl && (
          <>
            <Button onClick={() => handleDownload(fileUrl, fileName)}>
                <Download className="h-4 w-4 mr-2" />
                Download
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default FileViewer;

// TODO 
// Connect GetFile function from API to list info on view page and see about simplifying code with it
