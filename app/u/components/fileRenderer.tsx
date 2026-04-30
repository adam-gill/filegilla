import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { FileType, FolderItem, SyncStatuses } from "../types";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  Music,
  FileText,
  Download,
  Archive,
  File,
  Info,
} from "lucide-react";
import Image from "next/image";
import { getHTMLContent } from "@/app/u/actions";
import NoteWrapper from "@/app/u/components/noteWrapper";
import dynamic from "next/dynamic";

import type { ComponentType } from "react";

const PDFViewer = dynamic(
  () =>
    import("./pdfViewer.js") as unknown as Promise<{
      default: ComponentType<{ viewUrl: string }>;
    }>,
  { ssr: false },
);

interface FileRendererProps {
  viewUrl: string;
  location: string[];
  fileName: string;
  fileType: FileType;
  isPublic: boolean;
  filePreviewUrl?: string;
  shareName?: string;
  onDownload: () => void;
  setSyncStatus: Dispatch<SetStateAction<SyncStatuses>>;
  setFile: Dispatch<SetStateAction<FolderItem | undefined>>;
}

export default function FileRenderer({
  viewUrl,
  location,
  fileName,
  fileType,
  isPublic,
  filePreviewUrl,
  shareName,
  onDownload,
  setSyncStatus,
  setFile,
}: FileRendererProps) {
  const [error, setError] = useState<boolean>(false);
  const [content, setContent] = useState<string>("");

  const handleError = (): void => {
    setError(true);
  };

  useEffect(() => {
    const fetchHTML = async () => {
      const { html } = await getHTMLContent(
        location,
        isPublic,
        fileName,
        shareName,
      );
      if (html) {
        setSyncStatus("loaded");
        setContent(html);
      }
    };
    if (fileType === "filegilla") {
      fetchHTML();
    }
  }, [fileType, location, setSyncStatus, fileName, isPublic, shareName]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 rounded-lg border border-none">
        <AlertCircle className="w-12 h-12 text-gray-500 mb-4" />
        <p className="text-gray-400 text-center">
          Unable to preview this file.
          <br />
          Please download it to view the content.
        </p>
      </div>
    );
  }

  switch (fileType) {
    case "filegilla":
      return (
        <NoteWrapper
          initialContent={content}
          isPublic={isPublic}
          fileName={fileName}
          shareName={shareName}
          setSyncStatus={setSyncStatus}
          location={location}
          setFile={setFile}
        />
      );
    case "image":
      return (
        <div className="w-full rounded-lg border border-none p-4">
          <Image
            width={1000}
            height={1000}
            src={viewUrl}
            alt={fileName}
            className="max-w-full max-h-[70vh] mx-auto rounded"
            onError={handleError}
          />
        </div>
      );

    case "video":
      return (
        <div className="w-full rounded-lg border border-none p-4">
          <video
            controls
            preload="metadata"
            playsInline
            className="max-w-full max-h-[80vh] mx-auto rounded"
            onError={handleError}
          >
            <source src={viewUrl} />
            Your browser does not support the video tag.
          </video>
        </div>
      );

    case "audio":
      return (
        <div className=" rounded-lg border border-none p-8">
          <div className="flex flex-col items-center">
            {filePreviewUrl ? (
              <Image
                width={500}
                height={300}
                loading="eager"
                src={filePreviewUrl}
                alt={`${fileName} preview`}
                className="rounded-lg mb-6 w-auto h-auto"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              <Music className="w-16 h-16 text-green-400 mb-4" />
            )}
            <audio controls className="w-full max-w-md" onError={handleError}>
              <source src={viewUrl} />
              Your browser does not support the audio tag.
            </audio>
          </div>
        </div>
      );

    case "pdf":
      return <PDFViewer viewUrl={viewUrl} />;

    case "document":
      return (
        <div className="flex flex-col items-center justify-center h-96 rounded-lg border border-none">
          <FileText className="w-16 h-16 text-red-400 mb-4" />
          <p className="text-gray-300 font-medium mb-2">{fileName}</p>
          <p className="text-gray-500 text-sm text-center mb-4">
            Download Word/PowerPoint documents to view them
          </p>
          <Button
            variant="outline"
            className="bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <Download className="w-4 h-4 mr-2" />
            Download to View
          </Button>
        </div>
      );

    case "text":
      return (
        <div className="rounded-lg border border-none p-4 h-[70vh]">
          <iframe
            src={viewUrl}
            className="w-full h-full rounded bg-gray-800"
            title={fileName}
            onError={handleError}
          />
        </div>
      );

    case "archive":
      return (
        <div className="flex flex-col items-center justify-center h-96  rounded-lg border border-none">
          <Archive className="w-16 h-16 text-orange-400 mb-4" />
          <p className="text-gray-300 font-medium mb-2">{fileName}</p>
          <p className="text-gray-500 text-sm text-center mb-4">
            Archive files must be downloaded to extract
          </p>
          <Button
            onClick={onDownload}
            variant="outline"
            className="bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Archive
          </Button>
        </div>
      );

    default:
      return (
        <div className="flex flex-col items-center justify-center h-96 rounded-lg border border-none">
          <File className="w-16 h-16 text-gray-400 mb-4" />
          <p className="text-gray-300 font-medium mb-2">{fileName}</p>
          <p className="text-gray-500 text-sm text-center mb-4">
            Preview not available for this file type
          </p>
          <Button
            onClick={onDownload}
            variant="outline"
            className="cursor-pointer bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <Download className="w-4 h-4 mr-2" />
            Download File
          </Button>
        </div>
      );
  }
}
