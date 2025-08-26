"use client";

import React, { useState, useEffect, ReactNode, useCallback } from "react";
import {
  Video,
  Music,
  Archive,
  FileText,
  File,
  Download,
  Info,
  Edit3,
  Trash2,
  AlertCircle,
  Share,
  Images,
  MoreVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FileData, FileMetadata } from "../types";
import { formatBytes, formatDate } from "@/lib/helpers";
import { getFile } from "../actions";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";

interface FileViewerProps {
  location: string[];
}

interface FileResponse {
  url?: string;
  fileMetadata?: FileMetadata;
}

type FileType =
  | "image"
  | "video"
  | "audio"
  | "pdf"
  | "document"
  | "text"
  | "archive"
  | "unknown";

interface FileRendererProps {
  url: string;
  fileName: string;
  fileType: FileType;
}

const getFileData = async (location: string[]): Promise<FileResponse> => {
  const { success, url, fileMetadata } = await getFile(location);

  if (success) {
    return { url: url, fileMetadata: fileMetadata };
  } else {
    return { url: undefined, fileMetadata: undefined };
  }
};

const getFileIcon = (fileName: string): ReactNode => {
  const extension = fileName.toLowerCase().split(".").pop();

  // Image files
  if (
    ["jpg", "jpeg", "png", "gif", "bmp", "svg", "webp", "ico"].includes(
      extension || ""
    )
  ) {
    return <Images className="w-5 h-5 text-blue-400" />;
  }

  // Video files
  if (
    ["mp4", "avi", "mov", "wmv", "flv", "webm", "mkv", "m4v"].includes(
      extension || ""
    )
  ) {
    return <Video className="w-5 h-5 text-purple-400" />;
  }

  // Audio files
  if (
    ["mp3", "wav", "flac", "aac", "ogg", "wma", "m4a"].includes(extension || "")
  ) {
    return <Music className="w-5 h-5 text-green-400" />;
  }

  // Archive files
  if (["zip", "rar", "7z", "tar", "gz", "bz2"].includes(extension || "")) {
    return <Archive className="w-5 h-5 text-orange-400" />;
  }

  // Document files
  if (["pdf", "doc", "docx", "txt", "rtf", "odt"].includes(extension || "")) {
    return <FileText className="w-5 h-5 text-red-400" />;
  }

  // Default file icon
  return <File className="w-5 h-5 text-gray-400" />;
};

const getFileType = (fileName: string): FileType => {
  const extension = fileName.toLowerCase().split(".").pop();

  if (
    ["jpg", "jpeg", "png", "gif", "bmp", "svg", "webp", "ico"].includes(
      extension || ""
    )
  ) {
    return "image";
  }
  if (
    ["mp4", "avi", "mov", "wmv", "flv", "webm", "mkv", "m4v"].includes(
      extension || ""
    )
  ) {
    return "video";
  }
  if (
    ["mp3", "wav", "flac", "aac", "ogg", "wma", "m4a"].includes(extension || "")
  ) {
    return "audio";
  }
  if (["pdf"].includes(extension || "")) {
    return "pdf";
  }
  if (["doc", "docx"].includes(extension || "")) {
    return "document";
  }
  if (["txt", "rtf", "odt", "md"].includes(extension || "")) {
    return "text";
  }
  if (["zip", "rar", "7z", "tar", "gz", "bz2"].includes(extension || "")) {
    return "archive";
  }
  return "unknown";
};

const getPath = (path: string[]): string => {
  return "/u/" + path.slice(2).join("/");
};

const FileRenderer = ({ url, fileName, fileType }: FileRendererProps) => {
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
        <div className="rounded-lg border border-none p-4">
          <iframe
            src={url}
            className="w-full h-96 rounded bg-gray-800"
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
            variant="outline"
            className="bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <Download className="w-4 h-4 mr-2" />
            Download File
          </Button>
        </div>
      );
  }
};

export default function FileViewer({ location }: FileViewerProps) {
  const [loading, setLoading] = useState<boolean>(true);
  const [file, setFile] = useState<FileData>();

  const fetchFile = useCallback(async (): Promise<void> => {
    try {
      const { url, fileMetadata } = await getFileData(location);
      setFile({
        name: location[location.length - 1],
        path: getPath(location),
        metadata: fileMetadata || {},
        url: url,
      });
    } catch (error) {
      console.error("Error fetching file URL:", error);
    } finally {
      setLoading(false);
    }
  }, [location]);

  useEffect(() => {
    fetchFile();
  }, [fetchFile]);

  if (loading) {
    return (
      <div>
        <div className="min-h-screen p-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-row w-full">
              <div className="w-1/2 flex flex-col gap-y-3">
                <Skeleton className="w-full h-10" />
                <Skeleton className="w-[200px] h-6" />
                <Skeleton className="w-[300px] h-6" />
              </div>
              <div className="w-1/2 flex items-start justify-end gap-4">
                <Skeleton className="w-[52px] h-[40px]" />
                <Skeleton className="w-[52px] h-[40px]" />
                <Skeleton className="w-[52px] h-[40px]" />
                <Skeleton className="w-[52px] h-[40px]" />
                <Skeleton className="w-[52px] h-[40px]" />
              </div>
            </div>
            <Skeleton className="w-full h-[600px] mt-8" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="text-white p-6 max-md:p-4 bg-neutral-900 rounded-lg">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            {file && (
              <div className="flex items-center gap-3">
                {getFileIcon(file.name)}
                <div>
                  <h1 className="text-xl font-semibold text-gray-100">
                    {file.name}
                  </h1>
                  <div className="text-sm text-gray-400 flex flex-col max-md:text-xs">
                    <p>{`${formatBytes(file?.metadata.size)} • Modified `}</p>
                    {file.metadata.lastModified && (
                      <p>{formatDate(file.metadata.lastModified)}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {/* Desktop Action Buttons - Hidden on mobile */}
              <div className="hidden md:flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  <Edit3 className="w-4 h-4" />
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  <Share className="w-4 h-4" />
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  <Download className="w-4 h-4" />
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  <Info className="w-4 h-4" />
                </Button>
              </div>

              {/* Mobile Dropdown Menu - Visible only on mobile */}
              <div className="md:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="bg-gray-800 border-gray-600 text-gray-300"
                  >
                    <DropdownMenuItem className="focus:bg-gray-700 focus:text-gray-200">
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem className="focus:bg-gray-700 focus:text-gray-200">
                      <Share className="w-4 h-4 mr-2" />
                      Share
                    </DropdownMenuItem>
                    <DropdownMenuItem className="focus:bg-gray-700 focus:text-gray-200">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </DropdownMenuItem>
                    <DropdownMenuItem className="focus:bg-gray-700 text-red-400 focus:text-red-300">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                    <DropdownMenuItem className="focus:bg-gray-700 focus:text-gray-200">
                      <Info className="w-4 h-4 mr-2" />
                      Info
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          {/* File Preview */}
          {file && file.url && (
            <FileRenderer
              url={file.url}
              fileName={file.name}
              fileType={getFileType(file.name)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
