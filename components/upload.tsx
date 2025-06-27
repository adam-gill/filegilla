"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import axios from "axios";
import { useAuth } from "@/lib/useAuth";
import { showToast } from "@/lib/showToast";
interface Props {
  className?: string;
  fileName: string | null;
  setFileName: (value: string | null) => void;
}

const FileUpload: React.FC<Props> = ({
  className,
  setFileName,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { session } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    const newFormData = new FormData();
    if (file && session?.user) {
      newFormData.append("file", file);
      newFormData.append("userId", JSON.stringify({ userId: session.user.id }));
      // onUpload(file.name, newFormData);
      onUpload();
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const clearFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setFileName(null);
  };

  const onUpload = async () => {
    // Get the file from the input
    const file = fileInputRef.current?.files?.[0];
    if (!file || !session?.user) {
      showToast("No file selected or user not authenticated", "", "destructive");
      return;
    }

    const userId = session?.user.id;

    showToast(`Uploading ${file.name}...`, "", "default");
    setLoading(true);

    try {
      const { data } = await axios.post("/api/getPresignedUrl", {
        userId: userId,
        fileName: file.name,
      });
      
      if (!data.success || !data.url) {
        throw new Error("Failed to get presigned URL");
      }
      
      const presignedUrl = data.url;

      await axios.put(presignedUrl, file, {
        headers: {
          'x-ms-blob-type': 'BlockBlob',
          'Content-Type': file.type,
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          }
        },
      });

      showToast(`Successfully uploaded ${file.name}`, "", "good");
      clearFile();
      setFileName(file.name);
      setUploadProgress(0);
    } catch (error: any) {
      console.error("Upload error:", error);
      showToast(
        `Failed to upload ${file?.name ?? "file"} :(`,
        error.message || "Please try again...",
        "destructive"
      );
      setUploadProgress(0);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div
        className={cn("w-full", className)}
      >
        <div className="relative">
          <Input
            type="file"
            id="file-upload"
            className="sr-only"
            onChange={handleFileChange}
            ref={fileInputRef}
            aria-describedby="file-description"
          />
          <div className="flex flex-row items-center">
            <Button
              type="button"
              onClick={handleButtonClick}
              className="w-full py-7 px-7 sm:py-5 sm:px-4 sm:text-xl text-2xl fg-grad text-black border-none relative hover:brightness-[115%] rounded-2xl transition-all duration-300"
            >
              {loading ? (
                <span className="text-white text-lg">{uploadProgress}%</span>
              ) : (
                <>
                  <Upload className="w-5 h-5 mr-2" strokeWidth={2.75} />
                  Upload
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default FileUpload;
