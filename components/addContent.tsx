"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import axios from "axios";
import { useAuth } from "@/lib/useAuth";
import { showToast } from "@/lib/showToast";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
interface Props {
  className?: string;
  fileName: string | null;
  setFileName: (value: string | null) => void;
}

const AddContent = ({
  className,
  setFileName,
}: Props) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { session } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [open, setOpen] = useState(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    const newFormData = new FormData();
    if (file && session?.user) {
      newFormData.append("file", file);
      newFormData.append("userId", JSON.stringify({ userId: session.user.id }));
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
        className={className}
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
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                className="w-full h-12 px-4 py-4 text-2xl max-sm:text-xl fg-grad text-black border-none relative hover:brightness-[115%] rounded-2xl transition-all duration-300"
              >
                {loading ? (
                  <span className="text-white text-lg">{uploadProgress}%</span>
                ) : (
                  <>
                    <Plus className="w-6 h-6 mr-2" strokeWidth={2} />
                    Add
                  </>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-40 p-0">
              <div className="flex flex-col">
                <Button
                  type="button"
                  variant="ghost"
                  className="justify-start rounded-none rounded-t-md"
                  onClick={() => {
                    setOpen(false);
                    handleButtonClick();
                  }}
                  disabled={loading}
                >
                  File
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="justify-start rounded-none rounded-b-md"
                  onClick={() => {
                    setOpen(false);
                    alert("Note option selected!");
                  }}
                >
                  Note
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </>
  );
};

export default AddContent;
