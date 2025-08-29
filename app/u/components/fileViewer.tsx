"use client";

import React, {
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useRef,
} from "react";
import {
  Video,
  Music,
  Archive,
  FileText,
  File,
  Download,
  Info,
  Trash2,
  AlertCircle,
  Share,
  Images,
  MoreVertical,
  Pencil,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FileData, FileMetadata } from "../types";
import {
  formatBytes,
  formatDate,
  getFileExtension,
  removeFileExtension,
  validateItemName,
} from "@/lib/helpers";
import { deleteItem, getDownloadUrl, getFile, renameItem } from "../actions";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { toast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

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

const getPath = (path: string[] | string): string => {
  if (typeof path === "string") {
    return path;
  } else if (Array.isArray(path)) {
    return "/u/" + path.join("/");
  } else {
    return "";
  }
};

interface FileRendererProps {
  url: string;
  fileName: string;
  fileType: FileType;
  onDownload: () => void;
}

const FileRenderer = ({
  url,
  fileName,
  fileType,
  onDownload,
}: FileRendererProps) => {
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

export default function FileViewer({ location }: FileViewerProps) {
  const [loading, setLoading] = useState<boolean>(true);
  const [isRenameOpen, setIsRenameOpen] = useState<boolean>(false);
  const [isInfoOpen, setIsInfoOpen] = useState<boolean>(false);
  const [isRenaming, setIsRenaming] = useState<boolean>(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
  const [renameName, setRenameName] = useState<string>(
    removeFileExtension(location[location.length - 1]) || ""
  );
  const [validationError, setValidationError] = useState<string>("");
  const [file, setFile] = useState<FileData>();
  const infoRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const handleDownload = useCallback(async () => {
    const { success, url } = await getDownloadUrl(location);

    if (success && url) {
      // Download the file from the download url
      const link = document.createElement("a");
      link.href = url;
      link.download = file?.name || "download";
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "success!",
        description: `successfully downloaded ${file?.name}`,
        variant: "good",
      });
    } else {
      toast({
        title: "error",
        description: `failed to download ${file?.name}`,
        variant: "destructive",
      });
    }
  }, [location, file?.name]);

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

  const handleItemRename = async () => {
    setIsRenaming(true);

    if (file) {
      const savedFile = file;
      try {
        const itemName = file.name;
        const fullRenameName = renameName + getFileExtension(itemName);

        setFile({
          ...file,
          name: fullRenameName,
          metadata: {
            ...file.metadata,
            lastModified: new Date(),
          },
        });

        const { success, message } = await renameItem(
          "file",
          itemName,
          fullRenameName,
          location.slice(0, -1)
        );

        if (success) {
          router.replace(
            `/u/${location.slice(0, -1).join("/")}/${fullRenameName}`
          );
          toast({
            title: "success!",
            description: message,
            variant: "good",
          });
        } else {
          setFile(savedFile);
          setRenameName(savedFile.name);
          toast({
            title: "error",
            description: message,
            variant: "destructive",
          });
        }
      } catch (error) {
        setFile(savedFile);
        setRenameName(savedFile.name);
        toast({
          title: "error",
          description: "Unknown server error" + error,
          variant: "destructive",
        });
      } finally {
        setIsRenaming(false);
      }
    } else {
      setRenameName(location[location.length - 1]);
      toast({
        title: "error",
        description: "file not found",
        variant: "destructive",
      });
      return;
    }
  };

  const handleItemDeletion = async () => {
    setIsDropdownOpen(false);
    setIsDeleteOpen(false);

    try {
      if (file) {
        const { success, message } = await deleteItem(
          "file",
          file.name,
          location.slice(0, -1)
        );

        if (success) {
          toast({
            title: "Success!",
            description: message,
            variant: "good",
          });
          router.replace(`/u/${location.slice(0, -1).join("/")}`);
        } else {
          toast({
            title: "Error",
            description: message,
            variant: "destructive",
          });
        }
      } else {
        throw new Error("file not found");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Unknown error deleting file: ${error}`,
        variant: "destructive",
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isRenaming) {
      handleItemRename();
    } else if (e.key === "Escape") {
      setIsRenameOpen(false);
      setRenameName("");
    }
  };

  // Close dropdown when clicking outside of the more info alert dialog
  useEffect(() => {
    const handleClickOutsideAlert = (event: MouseEvent) => {
      if (infoRef.current && !infoRef.current.contains(event.target as Node)) {
        setIsInfoOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutsideAlert);
    return () => {
      document.removeEventListener("mousedown", handleClickOutsideAlert);
    };
  }, []);

  if (loading) {
    return (
      <div>
        <div className="min-h-screen p-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-row w-full justify-between">
              <div className="w-1/2 max-md:w-4/5 flex flex-col gap-y-3">
                <Skeleton className="w-full max-md:w-4/5 h-10" />
                <Skeleton className="w-[200px] h-6" />
                <Skeleton className="w-[300px] h-6" />
              </div>
              <div className="w-1/2 max-md:w-1/5 flex items-start justify-end gap-4">
                <Skeleton className="w-[52px] h-[40px] max-md:hidden" />
                <Skeleton className="w-[52px] h-[40px] max-md:hidden" />
                <Skeleton className="w-[52px] h-[40px] max-md:hidden" />
                <Skeleton className="w-[52px] h-[40px] max-md:hidden" />
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
                  onClick={() => setIsInfoOpen(true)}
                  variant="outline"
                  size="sm"
                  className="bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 cursor-pointer"
                >
                  <Info className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => {
                    setIsRenameOpen(true);
                  }}
                  variant="outline"
                  size="sm"
                  className="bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 cursor-pointer"
                >
                  <Pencil className="w-4 h-4" />
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 cursor-pointer"
                >
                  <Share className="w-4 h-4" />
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  className="bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                </Button>

                <Button
                  onClick={() => {
                    setIsDeleteOpen(true);
                    setIsDropdownOpen(false);
                  }}
                  variant="outline"
                  size="sm"
                  className="!bg-red-600/85 border-gray-600 text-gray-300 hover:!bg-red-600 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              {/* Mobile Dropdown Menu - Visible only on mobile */}
              <div className="md:hidden">
                <DropdownMenu
                  open={isDropdownOpen}
                  onOpenChange={setIsDropdownOpen}
                >
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
                    <DropdownMenuItem
                      onClick={() => {
                        setIsInfoOpen(true);
                        setIsDropdownOpen(false);
                      }}
                      className="focus:bg-gray-700 focus:text-gray-200"
                    >
                      <Info className="w-4 h-4 mr-2" />
                      info
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setIsDropdownOpen(false);
                        setTimeout(() => {
                          setIsRenameOpen(true);
                        }, 100);
                        setIsDeleteOpen(false);
                      }}
                      className="focus:bg-gray-700 focus:text-gray-200"
                    >
                      <Pencil className="w-4 h-4 mr-2" />
                      rename
                    </DropdownMenuItem>
                    <DropdownMenuItem className="focus:bg-gray-700 focus:text-gray-200">
                      <Share className="w-4 h-4 mr-2" />
                      share
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="focus:bg-gray-700 focus:text-gray-200 cursor-pointer"
                      onClick={handleDownload}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      download
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setIsDeleteOpen(true);
                        setIsDropdownOpen(false);
                      }}
                      className="cursor-pointer text-white bg-red-600/85 focus:bg-gray-700 hover:bg-red-600 focus:text-red-300"
                    >
                      <Trash2 className="w-4 h-4 mr-2 text-white" />
                      delete
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
              onDownload={handleDownload}
            />
          )}
        </div>
      </div>

      {/* Rename Dialog */}
      <AlertDialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
        <AlertDialogContent className="!bg-white shadow-2xl shadow-gray-600 text-gray-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-black text-2xl">
              rename file
            </AlertDialogTitle>
            <AlertDialogDescription className="!text-gray-600 text-base">
              {file?.name && `enter a new name for ${file.name}`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Input
              type="text"
              tabIndex={0}
              placeholder={"file name"}
              value={renameName}
              onChange={(e) => {
                const newName = e.target.value;
                setRenameName(newName);
                setValidationError(validateItemName(newName, "file"));
              }}
              onKeyDown={handleKeyPress}
              className={`text-base border-gray-600 text-black placeholder:text-gray-400 focus:border-gray-500 focus:ring-gray-500 ${
                validationError
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : ""
              }`}
              autoFocus
              disabled={isRenaming}
            />
            {validationError && (
              <p className="text-red-500 text-sm mt-2">{validationError}</p>
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="focus-visible:!ring-blue-500 focus-visible:!ring-2 text-base !bg-transparent cursor-pointer !text-black hover:!bg-blue-100 trans"
              disabled={isRenaming}
              onClick={() => {
                setValidationError("");
                setIsRenameOpen(false);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleItemRename}
              disabled={
                !renameName.trim() ||
                isRenaming ||
                !!validationError ||
                removeFileExtension(file?.name) === renameName
              }
              className="focus-visible:!ring-blue-500 focus-visible:!ring-2 text-base !bg-black cursor-pointer !text-white hover:!bg-white hover:!border-black hover:!text-black trans disabled:!bg-gray-300 disabled:!text-gray-500 disabled:cursor-not-allowed"
            >
              {isRenaming ? "Renaming..." : "Rename"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent className="!bg-white shadow-2xl shadow-gray-600 text-gray-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-black text-2xl">
              {`delete '${file?.name}'`}
            </AlertDialogTitle>
            <AlertDialogDescription className="!text-gray-600 text-base">
              {`this will permanently delete ${file?.name}`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="focus-visible:!ring-neutral-900 focus-visible:!ring-2 text-base !bg-transparent cursor-pointer !text-black hover:!bg-blue-100 trans">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleItemDeletion}
              className="focus-visible:!ring-neutral-900 focus-visible:!ring-2 text-base !bg-red-600/85  cursor-pointer !text-white hover:!bg-white hover:!border-black hover:!text-black trans disabled:!bg-gray-300 disabled:!text-gray-500 disabled:cursor-not-allowed"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* More Info Dialog */}
      <AlertDialog open={isInfoOpen} onOpenChange={setIsInfoOpen}>
        <AlertDialogContent
          ref={infoRef}
          className="!bg-white shadow-2xl shadow-gray-600 text-gray-200"
        >
          {file && (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle className="text-black text-2xl">
                  {`${file.name}`}
                </AlertDialogTitle>
                <AlertDialogDescription className="!text-gray-600 text-base">
                  file information
                </AlertDialogDescription>
                <AlertDialogCancel className="!bg-transparent border-none shadow-none hover:!bg-neutral-200 absolute trans top-2 right-2 w-8 h-8 p-0 cursor-pointer">
                  <X className="text-black stroke-3 hover:scale-110 trans" />
                </AlertDialogCancel>
              </AlertDialogHeader>
              <div className="w-full max-w-[580px] pb-4 text-gray-600">
                {file.metadata.size && (
                  <div>
                    <strong>item size: </strong>
                    {formatBytes(file.metadata.size)}
                  </div>
                )}
                {file.metadata.lastModified && (
                  <div>
                    <strong>last modified: </strong>
                    {formatDate(file.metadata.lastModified)}
                  </div>
                )}
                <div className="break-words overflow-hidden">
                  <strong>item path: </strong>
                  {getPath(file.path)}
                </div>
                {file.metadata.etag && (
                  <div>
                    <strong>uid: </strong> {file.metadata.etag.slice(1, -1)}
                  </div>
                )}
              </div>
            </>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
