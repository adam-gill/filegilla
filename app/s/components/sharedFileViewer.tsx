"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Download, Info, MoreVertical, Copy, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FolderItem } from "@/app/u/types";
import { formatBytes, formatDate, viewsText } from "@/lib/helpers";
import { toast } from "@/hooks/use-toast";
import { getFileType } from "@/app/u/helpers";
import GetFileIcon from "@/app/u/components/getFileIcon";
import FileRenderer from "@/app/u/components/fileRenderer";
import CopyText from "@/app/u/components/copyText";
import InfoDialog from "@/app/u/components/infoDialog";
import { getPublicDownloadUrl } from "../actions";
import { createPublicFileName } from "@/lib/aws/helpers";
import { authClient } from "@/lib/auth/auth-client";
import { deleteShareItem } from "@/app/u/actions";
import { useRouter } from "next/navigation";
import CloudIcon from "@/app/note/components/cloudIcon";
import ShareDialog from "@/app/u/components/shareDialog";

interface FileViewerProps {
  initialFile: FolderItem;
  shareName: string;
  views?: number;
}

export default function SharedFileViewer({
  initialFile,
  shareName,
  views,
}: FileViewerProps) {
  const [file, setFile] = useState<FolderItem | undefined>(initialFile);
  const [isInfoOpen, setIsInfoOpen] = useState<boolean>(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [isShareOpen, setIsShareOpen] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<"loaded" | "loading" | "error">(
    "loading"
  );
  const [mounted, setMounted] = useState(false);
  const infoRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const filegillaLink =
    process.env.NODE_ENV === "production"
      ? `https://filegilla.com/s/${shareName}`
      : `http://localhost:3000/s/${shareName}`;
  const { data: session } = authClient.useSession();

  // Set mounted to true on client to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

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
    if (!file) return;
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
          file?.name || "file",
          shareName
        )}`,
        variant: "good",
      });
    } else {
      toast({
        title: "error",
        description: `failed to download ${createPublicFileName(
          file?.name || "file",
          shareName
        )}`,
        variant: "destructive",
      });
    }
  }, [file, shareName]);

  const handleItemDeletion = async () => {
    try {
      if (file?.etag) {
        const { success, message } = await deleteShareItem(
          file?.name || "",
          shareName,
          file?.etag || ""
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
        description: `unknown error deleting '${shareName}: ${error}`,
        variant: "destructive",
      });
    }
  };

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
                  <p>{viewsText(Number(views))}</p>
                </div>
                {file.isFgDoc && <CloudIcon status={syncStatus} />}
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
                  variant="outline"
                  size="sm"
                  className="bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 cursor-pointer"
                  disabled={!file?.url}
                >
                  {file?.url ? (
                    <CopyText
                      textToCopy={filegillaLink}
                      showToast={true}
                      className="w-full"
                    />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  className="bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                </Button>

                {mounted &&
                  session &&
                  session.user.id &&
                  session.user.id === file?.ownerId && (
                    <Button
                      onClick={() => {
                        setIsShareOpen(true);
                        setIsDropdownOpen(false);
                      }}
                      variant="outline"
                      size="sm"
                      className="bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 cursor-pointer"
                    >
                      <Settings className="w-4 h-4" />
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
                      {file?.url ? (
                        <CopyText
                          textToCopy={file?.url || ""}
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
                    {mounted &&
                      session &&
                      session.user.id &&
                      session.user.id === file?.ownerId && (
                        <DropdownMenuItem
                          onClick={() => {
                            setIsShareOpen(true);
                            setIsDropdownOpen(false);
                          }}
                          className="focus:bg-gray-700 focus:text-gray-200 cursor-pointer"
                        >
                          <Settings className="w-4 h-4 mr-2" />
                          settings
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
              viewUrl={file.url}
              location={[]}
              fileName={file.name}
              fileType={getFileType(file.name, file.isFgDoc)}
              onDownload={handleDownload}
              isPublic={true}
              shareName={shareName}
              setSyncStatus={setSyncStatus}
              setFile={setFile}
            />
          )}
        </div>
      </div>

      <InfoDialog
        isInfoOpen={isInfoOpen}
        setIsInfoOpen={setIsInfoOpen}
        item={file}
      />

      {file && (
        <ShareDialog
          item={file}
          location={undefined}
          isShareOpen={isShareOpen}
          setIsShareOpen={setIsShareOpen}
          isSharePage={true}
        />
      )}
    </div>
  );
}
