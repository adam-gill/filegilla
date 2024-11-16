"use client";

import { useRef } from "react";
import { ChevronLeft, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/useAuth";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Skeleton } from "./ui/skeleton";
import { handleDownload } from "@/lib/helpers";
import { deleteFile } from "@/lib/deleteFile";
import { showToast } from "@/lib/showToast";
import { AlertDialogComponent } from "./alert";

type props = {
  fileName: string;
};

const baseUrl = "https://filegillablobs.blob.core.windows.net/";

const FileViewer: React.FC<props> = ({ fileName }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { session } = useAuth();
  const router = useRouter();

  const fileType = fileName.split(".").pop()?.toLowerCase();
  let fileUrl: string | undefined = undefined;
  if (session?.user?.id && fileName) {
    fileUrl = baseUrl + "user-" + session?.user?.id + "/" + fileName;
  }

  const renderFileContent = () => {
    switch (fileType) {
      case "pdf":
        return (
          <>
            {fileUrl && (
              <iframe
                src={`${fileUrl}#toolbar=0`}
                style={{
                  width: "100%",
                  height: "100%", // Adjust this value as needed
                  border: "none",
                  display: "block",
                }}
                title="PDF Viewer"
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
              height: "100%",
              border: "none",
              transformOrigin: "top center",
            }}
            title="Document Viewer"
          />
        );
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
      case "svg":
        return (
          <>
            {fileUrl ? (
              <Image
                src={fileUrl}
                width={400}
                height={400}
                alt={fileName}
                priority
                style={{ width: "auto", height: "auto" }}
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
        return <video src={fileUrl} controls />;
      case "wav":
      case "mp3":
        return <audio src={fileUrl} controls />;
      default:
        return <p>Unsupported file type</p>;
    }
  };

  return (
    <div className="w-full h-full relative">
      <div className="flex flex-col items-center w-full h-full mb-14">
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
        <div
          ref={containerRef}
          className="flex items-start justify-center rounded-lg p-4 w-full max-w-[860px] overflow-hidden"
          style={{ height: fileType === "pdf" || fileType === "docx" || fileType === "doc" ? "calc(860px * 1.29" : "100%" }}
        >
          {renderFileContent()}
        </div>

        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 bg-background/80 backdrop-blur-sm p-2 rounded-lg shadow-lg">
          {fileUrl && (
            <>
              <Button onClick={() => handleDownload(fileUrl, fileName)}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <AlertDialogComponent
                title="Are you absolutely sure?"
                description={`This action cannot be undone. This will permanently delete ${decodeURIComponent(
                  fileName
                )}.`}
                triggerText="Delete"
                onConfirm={() => {
                  showToast(`Deleting ${fileName}...`, "", "default");
                  if (session?.user.id) deleteFile(decodeURIComponent(fileName), session.user.id);
                  router.push("/dashboard");
                }}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileViewer;

// TODO
// Connect GetFile function from API to list info on view page and see about simplifying code with it
// deleteFile(
//   decodeURIComponent(fileName),
//   session?.user?.id!
// );
// router.push("/dashboard");
