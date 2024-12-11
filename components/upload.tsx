"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import axios from "axios";
import { useAuth } from "@/lib/useAuth";
import Loading from "./loading";
import { showToast } from "@/lib/showToast";
interface Props {
  maxWidth: number;
  className?: string;
  fileName: string | null;
  setFileName: (value: string | null) => void;
}

const FileUpload: React.FC<Props> = ({
  maxWidth,
  className,
  fileName,
  setFileName,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<FormData | null>(null);
  const { session } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    console.log(file);
    const newFormData = new FormData();
    if (file && session?.user) {
      newFormData.append("file", file);
      newFormData.append("userId", JSON.stringify({ userId: session.user.id }));

      onUpload(file.name, newFormData);
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
    setFormData(null);
  };

  const onUpload = async (newFileName: string, newFormData: FormData) => {
    showToast(`Uploading ${newFileName}...`, "", "default");

    try {
      setLoading(true);
      console.log(newFormData);
      const azureFunctionURL =
        process.env.NEXT_PUBLIC_AZURE_UPLOAD_FUNCTION_URL!;
      if (newFormData) await axios.post(azureFunctionURL, newFormData);

      setLoading(false);
      showToast(`Successfully uploaded ${newFileName}`, "", "good");
      clearFile();
      setFileName(newFileName);
    } catch (error: any) {
      setLoading(false);
      showToast(
        `Failed to upload ${newFileName} :(`,
        "Please try again...",
        "destructive"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        className={cn("w-full", className)}
        style={{ maxWidth: `${maxWidth}px` }}
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
              className="w-full py-7 px-7 text-2xl fg-grad text-black border-none relative hover:brightness-[115%] rounded-2xl transition-all duration-300"
            >
              {loading ? (
                <Loading width={24} height={24} stroke={3} />
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
