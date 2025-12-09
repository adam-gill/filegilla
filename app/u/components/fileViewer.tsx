"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Download,
  Info,
  Trash2,
  Share,
  MoreVertical,
  Pencil,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FileMetadata, FolderItem } from "@/app/u/types";
import {
  delay,
  formatBytes,
  formatDate,
  getFileExtension,
  removeFileExtension,
  validateItemName,
} from "@/lib/helpers";
import {
  deleteItem,
  getDownloadUrl,
  getFile,
  renameItem,
} from "@/app/u/actions";
import { Skeleton } from "@/components/ui/skeleton";
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
import ShareDialog from "@/app/u/components/shareDialog";
import { getFileType, truncateFileName } from "@/app/u/helpers";
import GetFileIcon from "@/app/u/components/getFileIcon";
import InfoDialog from "@/app/u/components/infoDialog";
import FileRenderer from "@/app/u/components/fileRenderer";
import CloudIcon from "@/app/note/components/cloudIcon";

interface FileViewerProps {
  location: string[];
}

interface FileResponse {
  url?: string;
  fileMetadata?: FileMetadata;
}

const getFileData = async (location: string[]): Promise<FileResponse> => {
  const { success, url, fileMetadata } = await getFile(location);

  if (success) {
    return { url: url, fileMetadata: fileMetadata };
  } else {
    return { url: undefined, fileMetadata: undefined };
  }
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

export default function FileViewer({ location }: FileViewerProps) {
  const [loading, setLoading] = useState<boolean>(true);
  const [isRenameOpen, setIsRenameOpen] = useState<boolean>(false);
  const [isInfoOpen, setIsInfoOpen] = useState<boolean>(false);
  const [isRenaming, setIsRenaming] = useState<boolean>(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
  const [isShareOpen, setIsShareOpen] = useState<boolean>(false);
  const [renameName, setRenameName] = useState<string>(
    removeFileExtension(location[location.length - 1]) || ""
  );
  const [validationError, setValidationError] = useState<string>("");
  const [syncStatus, setSyncStatus] = useState<"loaded" | "loading" | "error">(
    "loading"
  );
  const [file, setFile] = useState<FolderItem>();
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
        type: "file",
        etag: fileMetadata?.etag,
        lastModified: fileMetadata?.lastModified,
        fileType: fileMetadata?.fileType,
        size: fileMetadata?.size,
        url: url,
        isFgDoc: fileMetadata?.isFgDoc,
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
          lastModified: new Date(),
        });

        const { success, message } = await renameItem(
          "file",
          itemName,
          fullRenameName,
          location.slice(0, -1)
        );

        if (success) {
          if (file.isFgDoc) {
            await delay(500); // bandage fix, next redirects to old page after the redirect for some reason
            router.replace(
              `/u/${location.slice(0, -1).join("/")}/${fullRenameName}`
            );
          } else {
            router.replace(
              `/u/${location.slice(0, -1).join("/")}/${fullRenameName}`
            );
          }
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
                <Skeleton className="w-14 h-10 max-md:hidden" />
                <Skeleton className="w-14 h-10 max-md:hidden" />
                <Skeleton className="w-14 h-10 max-md:hidden" />
                <Skeleton className="w-14 h-10 max-md:hidden" />
                <Skeleton className="w-14 h-10" />
              </div>
            </div>
            <Skeleton className="w-full h-[600px] mt-8" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full">
      <div
        className={`${
          file?.isFgDoc ? "bg-transparent p-0" : "p-4"
        } rounded-lg h-full`}
      >
        <div className="max-w-6xl mx-auto min-h-[calc(100vh-250px-64px)] h-full">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            {file && (
              <div className="flex items-center gap-3 overflow-hidden">
                <ChevronLeft
                  className="cursor-pointer w-6 h-6 stroke-3 mr-2"
                  onClick={() =>
                    router.push(`/u/${location.slice(0, -1).join("/")}`)
                  }
                />
                <GetFileIcon fileName={file.name} isFgDoc={file.isFgDoc} />
                <div className="min-w-0 flex-1">
                  <h1 className="text-xl font-semibold truncate">
                    {file.name}
                  </h1>
                  <div className="text-sm text-black dark:text-gray-500 flex flex-col max-md:text-xs">
                    <p>{`${formatBytes(file?.size)} • Modified `}</p>
                    {file.lastModified && (
                      <p>{formatDate(file.lastModified)}</p>
                    )}
                  </div>
                </div>
                {file.isFgDoc && <CloudIcon status={syncStatus} />}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-start justify-start gap-2">
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
                  onClick={() => setIsShareOpen(true)}
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
                  className="bg-red-600/85! border-gray-600 text-gray-300 hover:bg-red-600! cursor-pointer"
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
                    <DropdownMenuItem
                      onClick={() => {
                        setIsDropdownOpen(false);
                        setTimeout(() => {
                          setIsShareOpen(true);
                        }, 100);
                        setIsDeleteOpen(false);
                      }}
                      className="focus:bg-gray-700 focus:text-gray-200"
                    >
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
              viewUrl={file.url}
              location={location}
              fileName={file.name}
              fileType={getFileType(file.name, file.isFgDoc)}
              onDownload={handleDownload}
              isPublic={false}
              setSyncStatus={setSyncStatus}
              setFile={setFile}
            />
          )}
        </div>
      </div>

      {/* Rename Dialog */}
      <AlertDialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
        <AlertDialogContent className="bg-white! shadow-2xl shadow-gray-600 text-gray-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-black text-2xl">
              rename file
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600! text-base">
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
              className="focus-visible:ring-blue-500! focus-visible:ring-2! text-base bg-transparent! cursor-pointer text-black! hover:bg-blue-100! trans"
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
              className="focus-visible:ring-blue-500! focus-visible:ring-2! text-base bg-black! cursor-pointer text-white! hover:bg-white! hover:border-black! hover:text-black! trans disabled:bg-gray-300! disabled:text-gray-500! disabled:cursor-not-allowed"
            >
              {isRenaming ? "Renaming..." : "Rename"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent className="bg-white! shadow-2xl shadow-gray-600 text-gray-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-black text-2xl">
              {`delete '${truncateFileName(file?.name || "")}'`}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600! text-base">
              {`this will permanently delete ${truncateFileName(file?.name || "")}`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="focus-visible:ring-neutral-900! focus-visible:ring-2! text-base bg-transparent! cursor-pointer text-black! hover:bg-blue-100! trans">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleItemDeletion}
              className="focus-visible:ring-neutral-900! focus-visible:ring-2! text-base bg-red-600/85!  cursor-pointer text-white! hover:bg-white! hover:border-black! hover:text-black! trans disabled:bg-gray-300! disabled:text-gray-500! disabled:cursor-not-allowed"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {file && (
        <InfoDialog
          isInfoOpen={isInfoOpen}
          setIsInfoOpen={setIsInfoOpen}
          item={file}
        />
      )}

      {file && (
        <ShareDialog
          item={file}
          location={location.slice(0, -1)}
          isShareOpen={isShareOpen}
          setIsShareOpen={setIsShareOpen}
        />
      )}
    </div>
  );
}
