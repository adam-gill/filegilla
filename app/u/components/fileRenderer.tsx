import { useState } from "react";
import { FileType } from "../types";
import { Button } from "@/components/ui/button";
import { AlertCircle, Music, FileText, Download, Archive, File } from "lucide-react";
import Image from "next/image";

interface FileRendererProps {
    url: string;
    fileName: string;
    fileType: FileType;
    onDownload: () => void;
  }
  
  export default function FileRenderer({
    url,
    fileName,
    fileType,
    onDownload,
  }: FileRendererProps) {
    const [error, setError] = useState<boolean>(false);
  
    const handleError = (): void => {
      setError(true);
    };
  
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
      case "image":
        return (
          <div className="w-full rounded-lg border border-none p-4">
            <Image
              width={1000}
              height={1000}
              src={url}
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
              className="max-w-full max-h-[80vh] mx-auto rounded"
              onError={handleError}
            >
              <source src={url} />
              Your browser does not support the video tag.
            </video>
          </div>
        );
  
      case "audio":
        return (
          <div className=" rounded-lg border border-none p-8">
            <div className="flex flex-col items-center">
              <Music className="w-16 h-16 text-green-400 mb-4" />
              <audio controls className="w-full max-w-md" onError={handleError}>
                <source src={url} />
                Your browser does not support the audio tag.
              </audio>
            </div>
          </div>
        );
  
      case "pdf":
        return (
          <div className="w-full rounded-lg border border-none h-[70vh]">
            <iframe
              src={url}
              className="w-full h-full rounded-lg"
              title={fileName}
              onError={handleError}
            />
          </div>
        );
  
      case "document":
        return (
          <div className="flex flex-col items-center justify-center h-96 rounded-lg border border-none">
            <FileText className="w-16 h-16 text-red-400 mb-4" />
            <p className="text-gray-300 font-medium mb-2">{fileName}</p>
            <p className="text-gray-500 text-sm text-center mb-4">
              Word documents require download to view
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
              src={url}
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
  };