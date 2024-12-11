"use client";

import { useRef, useState, useEffect } from "react";
import {
  ChevronLeft,
  Dot,
  Download,
  Pencil,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/useAuth";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Skeleton } from "./ui/skeleton";
import { cleanDate, convertSize, handleDownload } from "@/lib/helpers";
import { deleteFile } from "@/lib/deleteFile";
import { showToast } from "@/lib/showToast";
import { AlertDialogComponent } from "./alert";
import { Input } from "./ui/input";
import { getFile } from "@/lib/getFile";
import { file, getFileResponse } from "filegilla";
import { renameFile } from "@/lib/renameFile";

type props = {
  fileName: string;
};

const FileViewer: React.FC<props> = ({ fileName }) => {
  const [scale, setScale] = useState<number>(1);
  const [file, setFile] = useState<file | null>(null);
  const [fileUrl, setFileUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [isEditing, setIsEditing] = useState(false);
  const [textContent, setTextContent] = useState<string>("");
  const [inputValue, setInputValue] = useState("100");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { session } = useAuth();
  const userId = session?.user.id;
  const router = useRouter();

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

  useEffect(() => {
    fetchFile();
  }, [userId, fileName]);

  const fileType = fileName.split(".").pop()?.toLowerCase();

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
      console.error('Error fetching text content:', error);
      setTextContent('Error loading text file');
    }
  };
  
  // Add useEffect to fetch text content when fileUrl changes and type is txt
  useEffect(() => {
    if (fileType === 'txt' && fileUrl) {
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
          <div className="w-full h-full overflow-auto p-4">
            <pre className="whitespace-pre-wrap text-sm">
              {textContent}
            </pre>
          </div>
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
                  src={fileUrl}
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
            <video className="h-full" src={fileUrl} controls />
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
        {fileName && file?.lastModified && file.sizeInBytes ? (
          <>
            <h1 className="flex cc font-bold text-3xl w-full text-center relative">
              <ChevronLeft
                onClick={() => router.back()}
                size={32}
                className="absolute left-8 top-1/2 -translate-y-1/2 cursor-pointer"
              />
              {decodeURIComponent(fileName)}
            </h1>
            <div className="text-lg flex cc mb-2">
              {cleanDate(file?.lastModified)}
              <Dot />
              {convertSize(file?.sizeInBytes)}
            </div>
          </>
        ) : (
          <div className="flex flex-col cc font-bold text-3xl pb-2 w-full text-center relative">
            <ChevronLeft
              onClick={() => router.back()}
              size={32}
              className="absolute left-8 top-1/2 -translate-y-1/2 cursor-pointer"
            />
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
              <Button onClick={() => handleDownload(fileUrl, fileName)}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <AlertDialogComponent
                title="Rename File"
                description={`Enter a new name for ${decodeURIComponent(
                  fileName
                )}`}
                popOver={true}
                isRename={true}
                triggerText={
                  <>
                    <Pencil className="h-4 w-4 mr-2" /> Rename
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
                    renameFile(userId!, decodeURIComponent(fileName), newName);
                    router.replace(`/view/${newName}`);
                  }
                }}
              />
              <AlertDialogComponent
                setOpen={() => {}}
                title="Are you absolutely sure?"
                description={`This action cannot be undone. This will permanently delete ${decodeURIComponent(
                  fileName
                )}.`}
                triggerText="Delete"
                onConfirm={() => {
                  showToast(`Deleting ${fileName}...`, "", "default");
                  if (session?.user.id)
                    deleteFile(decodeURIComponent(fileName), session.user.id);
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
