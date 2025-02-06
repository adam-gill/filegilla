"use client";

import { useRef, useState, useEffect } from "react";
import {
  Check,
  ChevronLeft,
  Copy,
  Dot,
  Download,
  Pencil,
  Share,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/useAuth";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Skeleton } from "./ui/skeleton";
import {
  ag_uuid,
  cleanDate,
  convertSize,
  copyToClipboard,
  delay,
  extractFileExtension,
  handleDownload,
  stripFileExtension,
  stripToken,
} from "@/lib/helpers";
import { deleteFile } from "@/lib/deleteFile";
import { showToast } from "@/lib/showToast";
import { AlertDialogComponent } from "./alert";
import { Input } from "./ui/input";
import { getFile } from "@/lib/getFile";
import { file, getFileResponse } from "filegilla";
import { renameFile } from "@/lib/renameFile";
import { getPublicFileResponse } from "@/app/api/getPublicFile/route";
import { shareFileOp } from "@/lib/shareFileOp";
import { cn } from "@/lib/utils";

type props = {
  fileName: string;
  publicFileData?: getPublicFileResponse;
};

const FileViewer: React.FC<props> = ({ fileName, publicFileData }) => {
  const [scale, setScale] = useState<number>(1);
  const [file, setFile] = useState<file | undefined>(undefined);
  const [fileUrl, setFileUrl] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [isEditing, setIsEditing] = useState(false);
  const [textContent, setTextContent] = useState<string>("");
  const [inputValue, setInputValue] = useState("100");
  const [open, setOpen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { session } = useAuth();
  const userId = session?.user.id;
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [showAnimation, setShowAnimation] = useState<boolean>(false);

  const router = useRouter();
  const uuid = ag_uuid();

  const fetchFile = async () => {
    setLoading(true);

    if (userId && fileName) {
      const data: getFileResponse = await getFile(userId, fileName);
      if (data.file) {
        setFile(data.file);
        setFileUrl(data.file.blobUrl + data.sasToken);
      }
      setLoading(false);
    }
    setLoading(false);
  };

  const file404: file = {
    name: `Could not find file "${fileName}"`,
    blobUrl: "",
    lastModified: "",
    md5hash: "",
    sizeInBytes: 0,
  };

  const file500: file = {
    name: `Server error fetching file "${fileName}"`,
    blobUrl: "",
    lastModified: "",
    md5hash: "",
    sizeInBytes: 0,
  };

  useEffect(() => {
    setLoading(true);
    setIsOwner(
      (publicFileData?.owner && userId && publicFileData?.owner === userId) ||
        !publicFileData
    );
    console.log(
      "isOwner: ",
      publicFileData?.owner === userId || publicFileData?.status !== 200
    );
    console.log("owner statement truthy:", publicFileData?.owner === userId);
    console.log("publicFileData truthy:", publicFileData?.status !== 200);
    console.log(publicFileData?.owner, userId);
    if (publicFileData) {
      if (publicFileData.status === 200) {
        setFile(publicFileData.file);
        setFileUrl(publicFileData.url);
      } else if (publicFileData.status === 404) {
        setFile(file404);
        setFileUrl("");
      } else if (publicFileData.status === 500) {
        setFile(file500);
        setFileUrl("");
      }
      setLoading(false);
    } else {
      fetchFile();
    }
    setLoading(false);
  }, [userId, fileName, publicFileData]);

  const fileType = publicFileData
    ? file?.name.split(".").pop()?.toLowerCase()
    : fileName.split(".").pop()?.toLowerCase();

  const fileTitle = !publicFileData
    ? decodeURIComponent(fileName)
    : publicFileData.status === 200
    ? decodeURIComponent(fileName) + "." + fileType
    : decodeURIComponent(fileName);

  const updateScale = (value: number) => {
    const newScale = Math.max(0.1, Math.min(10, value / 100));
    setScale(newScale);
    setInputValue(Math.round(newScale * 100).toString());
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace("%", "");
    setInputValue(value);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const numValue = parseFloat(inputValue);
      if (!isNaN(numValue)) {
        updateScale(numValue);
      }
      setIsEditing(false);
      if (inputRef.current) {
        inputRef.current.blur();
      }
    }
  };

  const handleInputFocus = () => {
    setIsEditing(true);
    if (inputRef.current) {
      inputRef.current.select();
    }
  };

  const handleInputBlur = () => {
    setIsEditing(false);
    const numValue = parseFloat(inputValue);
    if (!isNaN(numValue)) {
      updateScale(numValue);
    } else {
      setInputValue(Math.round(scale * 100).toString());
    }
  };

  const handleZoomIn = () => {
    updateScale(Math.round(scale * 100) + 5);
  };

  const handleZoomOut = () => {
    updateScale(Math.round(scale * 100) - 5);
  };

  const fetchTextContent = async (url: string) => {
    try {
      const response = await fetch(url);
      const text = await response.text();
      setTextContent(text);
    } catch (error) {
      console.error(`Error fetching text content: ${open ? "" : ""}`, error);
      setTextContent("Error loading text file");
    }
  };

  const clipboardAnimation = async () => {
    setShowAnimation(true);
    await delay(1000);
    setShowAnimation(false);
  };

  // Add useEffect to fetch text content when fileUrl changes and type is txt
  useEffect(() => {
    if (fileType === "txt" && fileUrl) {
      fetchTextContent(fileUrl);
    }
  }, [fileUrl, fileType]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.select();
    }
  }, [isEditing]);

  const isImage = () => {
    return (
      fileType === "jpg" ||
      fileType === "jpeg" ||
      fileType === "png" ||
      fileType === "gif" ||
      fileType === "svg"
    );
  };

  const renderFileContent = () => {
    if (publicFileData) {
      if (publicFileData.status === 404) {
        return <p className="text-2xl font-bold">{"404 - File not found"}</p>;
      } else if (publicFileData.status === 500) {
        return <p className="text-2xl font-bold">{"500 - Server error"}</p>;
      }
    }

    switch (fileType) {
      case "pdf":
        return (
          <>
            {fileUrl != "" && (
              <iframe
                src={`${fileUrl}#toolbar=0`}
                style={{
                  width: "100%",
                  height: "100%",
                  border: "none",
                  display: "block",
                }}
                title="PDF Viewer"
              />
            )}
          </>
        );
      case "txt":
        return (
          <>
            <textarea
              className="w-full h-full p-2 bg-neutral-700 text-sm focus:outline-none font-mono rounded-md resize-none"
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
            />
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
      case "webp":
        return (
          <>
            {fileUrl != "" ? (
              <div
                className="flex cc w-full h-full"
                style={{ overflow: "auto", width: "100%", height: "100%" }}
              >
                <Image
                  src={fileUrl!}
                  width={400}
                  height={400}
                  alt={fileName}
                  priority
                  style={{
                    width: "fit",
                    height: "fit",
                    maxWidth: "100%",
                    maxHeight: "100%",
                    transform: `scale(${scale})`,
                  }}
                />
              </div>
            ) : (
              <Skeleton className="w-full h-full p-4 bg-grayHover" />
            )}
          </>
        );
      case "mp4":
      case "webm":
      case "ogg":
      case "mov":
        return (
          <div className="w-full h-full flex cc">
            <video
              className="h-full"
              src={fileUrl}
              controls
              playsInline
              preload="auto"
            />
          </div>
        );
      case "wav":
      case "mp3":
        return <audio src={fileUrl} controls />;
      default:
        return <p className="text-2xl font-bold">Unsupported file type</p>;
    }
  };

  const calcHeight = (type: string | undefined): string => {
    switch (type) {
      case "pdf":
      case "docx":
      case "doc":
        return "calc(860px * 1.29)";
      case "ppt":
      case "pptx":
        return "calc(100vh - 220px)";
      default:
        return "calc(100vh - 220px)";
    }
  };

  return (
    <div className="w-full h-full flex relative">
      <div className="flex flex-grow flex-col items-center justify-center w-full h-full px-4">
        {(fileName && file?.sizeInBytes && file.lastModified) ||
        publicFileData?.status === 404 ||
        publicFileData?.status === 500 ? (
          <>
            <h1
              className={cn(
                "flex cc font-bold text-3xl w-full text-center relative",
                !file?.lastModified && !file?.sizeInBytes ? "mb-4" : ""
              )}
            >
              {publicFileData && (
                <ChevronLeft
                  onClick={() => router.back()}
                  size={32}
                  className="absolute left-8 top-1/2 -translate-y-1/2 cursor-pointer"
                />
              )}
              {fileTitle}
            </h1>
            <div className="text-lg flex cc mb-2">
              {file?.lastModified && file.sizeInBytes && (
                <>
                  {cleanDate(file?.lastModified)}
                  <Dot />
                  {convertSize(file?.sizeInBytes)}
                </>
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-col cc font-bold text-3xl pb-2 w-full text-center relative">
            <Skeleton className="w-72 h-9 bg-grayHover" />
            <div className="flex items-center justify-between gap-8 mt-2">
              <Skeleton className="w-36 h-7 bg-grayHover mb-2" />
            </div>
          </div>
        )}
        <div
          ref={containerRef}
          className="flex cc shadow-[0_0_10px_rgba(255,255,255,0.3)] bg-neutral-700 flex-grow items-start justify-center rounded-lg p-4 w-full max-w-[860px] overflow-hidden mb-20"
          style={{ height: calcHeight(fileType) }}
        >
          {loading ? (
            <>
              <Skeleton className="w-full h-full bg-grayHover" />
            </>
          ) : (
            renderFileContent()
          )}
        </div>

        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 bg-background/80 backdrop-blur-sm p-2 rounded-lg shadow-lg">
          {fileUrl != "" && (
            <>
              {isImage() && (
                <>
                  <Button onClick={handleZoomOut} aria-label="Zoom out">
                    <ZoomOut className="flex cc h-4 w-4" />
                  </Button>
                  <Input
                    ref={inputRef}
                    className="flex bg-neutral-900 border border-white focus-visible:ring-0 outline-none active:outline-none cc text-center w-20 py-2 h-9 text-md text-white"
                    value={isEditing ? inputValue : `${inputValue}%`}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    onKeyDown={handleInputKeyDown}
                    aria-label="Zoom level"
                  />
                  <Button onClick={handleZoomIn} aria-label="Zoom in">
                    <ZoomIn className="flex cc h-4 w-4" />
                  </Button>
                </>
              )}
              <Button onClick={() => handleDownload(fileUrl!, fileName)}>
                <Download className="h-4 w-4" />
              </Button>
              {isOwner && (
                <AlertDialogComponent
                  title="Rename File"
                  description={`Enter a new name for ${decodeURIComponent(
                    fileName
                  )}`}
                  popOver={true}
                  isRename={true}
                  triggerText={
                    <>
                      <Pencil className="h-4 w-4" />
                    </>
                  }
                  confirmText="Rename"
                  setOpen={() => {}}
                  inputProps={{
                    defaultValue: decodeURIComponent(fileName),
                    placeholder: "Enter new filename",
                  }}
                  onConfirm={(newName) => {
                    if (newName) {
                      showToast(
                        `Renaming ${decodeURIComponent(fileName)}...`,
                        "",
                        "default"
                      );
                      renameFile(
                        userId!,
                        decodeURIComponent(fileName),
                        newName
                      );
                      router.replace(`/view/${newName}`);
                    }
                  }}
                />
              )}
              {!publicFileData && (
                <AlertDialogComponent
                  title="Share"
                  description={`Select a name to share ${decodeURIComponent(
                    fileName
                  )} as, or leave it random. This value must be unique amongst all users.`}
                  popOver={true}
                  type="share"
                  isRename={true}
                  triggerText={<Share className="h-4 w-4" />}
                  confirmText="Share"
                  setOpen={setOpen}
                  inputProps={{
                    defaultValue: uuid + extractFileExtension(fileName),
                    placeholder: "Enter new filename",
                  }}
                  onConfirm={(shareName) => {
                    if (shareName) {
                      shareFileOp(
                        userId!,
                        stripToken(fileUrl!),
                        stripFileExtension(shareName),
                        "create",
                        uuid
                      );
                      showToast(
                        `Making ${name} public as filegilla.com/s/${encodeURIComponent(
                          shareName
                        )}`,
                        "",
                        "default"
                      );
                      setOpen(false);
                    }
                  }}
                />
              )}
              {publicFileData && (
                <Button
                  onClick={() => {
                    copyToClipboard(window.location.href);
                    clipboardAnimation();
                    showToast(
                      "Link Copied!",
                      `${window.location.href}`,
                      "good"
                    );
                  }}
                >
                  <Copy
                    size={24}
                    className={`h-4 w-4 cursor-pointer
          ${showAnimation ? "hidden" : "block"}
          
            `}
                  />
                  <Check
                    size={24}
                    className={`stroke-green-400 stroke-[3] h-4 w-4 cursor-pointer
           ${showAnimation ? "block" : "hidden"}
          `}
                  />
                </Button>
              )}
              {isOwner && (
                <AlertDialogComponent
                  setOpen={() => {}}
                  variant={"destructive"}
                  title="Are you absolutely sure?"
                  description={`This action cannot be undone. This will permanently delete ${decodeURIComponent(
                    fileName
                  )}.`}
                  triggerText=""
                  type="delete"
                  onConfirm={() => {
                    showToast(`Deleting ${fileName}...`, "", "default");
                    if (session?.user.id)
                      deleteFile(decodeURIComponent(fileName), session.user.id);
                    router.push("/dashboard");
                  }}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileViewer;
