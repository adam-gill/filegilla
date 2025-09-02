"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Download, Info, Trash2, MoreVertical, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FolderItem } from "@/app/u/types";
import { formatBytes, formatDate } from "@/lib/helpers";
import { toast } from "@/hooks/use-toast";
import { getFileType } from "@/app/u/helpers";
import GetFileIcon from "@/app/u/components/getFileIcon";
import FileRenderer from "@/app/u/components/fileRenderer";
import CopyText from "@/app/u/components/copyText";
import InfoDialog from "@/app/u/components/infoDialog";
import { getPublicDownloadUrl } from "../actions";
import { createPublicFileName } from "@/lib/aws/helpers";
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
import { authClient } from "@/lib/auth/auth-client";
import { deleteShareItem } from "@/app/u/actions";
import { useRouter } from "next/navigation";

interface FileViewerProps {
  file: FolderItem;
  shareName: string;
}

export default function SharedFileViewer({ file, shareName }: FileViewerProps) {
  const [isInfoOpen, setIsInfoOpen] = useState<boolean>(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
  const infoRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const filegillaLink = `${process.env.NEXT_PUBLIC_APP_URL!}/s/${shareName}`;
  const { data: session } = authClient.useSession();

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

  const handleDownload = useCallback(async () => {
    const { success, url } = await getPublicDownloadUrl(file.name, shareName);

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
        description: `successfully downloaded ${createPublicFileName(
          file.name,
          shareName
        )}`,
        variant: "good",
      });
    } else {
      toast({
        title: "error",
        description: `failed to download ${createPublicFileName(
          file.name,
          shareName
        )}`,
        variant: "destructive",
      });
    }
  }, [file.name, shareName]);

  const handleItemDeletion = async () => {
    try {
      if (file.etag) {
        const { success, message } = await deleteShareItem(
          file.name,
          shareName,
          file.etag
        );

        if (success) {
          toast({
            title: "success!",
            description: message,
            variant: "good",
          });
          router.push("/u");
        } else {
          toast({
            title: "error",
            description: message,
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      toast({
        title: "error",
        description: `unknown error deleting '${shareName}`,
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      <div className="text-white p-4 max-md:p-4 bg-neutral-900 rounded-lg">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            {file && (
              <div className="flex items-center gap-3">
                <GetFileIcon fileName={file.name} />
                <div>
                  <h1 className="text-xl font-semibold text-gray-100">
                    {file.name}
                  </h1>
                  <div className="text-sm text-gray-400 flex flex-col max-md:text-xs">
                    <p>{`${formatBytes(file?.size)} • Modified `}</p>
                    {file.lastModified && (
                      <p>{formatDate(file.lastModified)}</p>
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

                <div className="bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 cursor-pointer inline-flex items-center justify-center whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-950 disabled:pointer-events-none disabled:opacity-50 dark:focus-visible:ring-neutral-300 border shadow-sm hover:text-neutral-900 dark:border-neutral-800 dark:bg-neutral-950 dark:hover:bg-neutral-800 dark:hover:text-neutral-50 h-8 rounded-md w-[52px] text-xs">
                  {file.url ? (
                    <CopyText
                      textToCopy={filegillaLink}
                      showToast={true}
                      className="w-full"
                    />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  className="bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                </Button>

                {session &&
                  session.user.id &&
                  session.user.id === file.ownerId && (
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
                  )}
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
                      onClick={() =>
                        toast({
                          title: "success!",
                          description: `copied share link: ${filegillaLink}`,
                          variant: "good",
                        })
                      }
                      className="focus:bg-gray-700 focus:text-gray-200"
                    >
                      {file.url ? (
                        <CopyText
                          textToCopy={file.url}
                          className="mr-2"
                          isMinWidth={true}
                        />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                      copy
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="focus:bg-gray-700 focus:text-gray-200 cursor-pointer"
                      onClick={handleDownload}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      download
                    </DropdownMenuItem>
                    {session &&
                      session.user.id &&
                      session.user.id === file.ownerId && (
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
                      )}
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

      {/* TODO */}

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent className="!bg-white shadow-2xl shadow-gray-600 text-gray-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-black text-2xl">
              {`delete /s/${shareName}`}
            </AlertDialogTitle>
            <AlertDialogDescription className="!text-gray-600 text-base">
              {"remove this shared file from the public space"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="focus-visible:!ring-neutral-900 focus-visible:!ring-2 text-base !bg-transparent cursor-pointer !text-black hover:!bg-blue-100 trans">
              cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleItemDeletion}
              className="focus-visible:!ring-neutral-900 focus-visible:!ring-2 text-base !bg-red-600/85  cursor-pointer !text-white hover:!bg-white hover:!border-black hover:!text-black trans disabled:!bg-gray-300 disabled:!text-gray-500 disabled:cursor-not-allowed"
            >
              delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <InfoDialog
        isInfoOpen={isInfoOpen}
        setIsInfoOpen={setIsInfoOpen}
        item={file}
      />
    </div>
  );
}
