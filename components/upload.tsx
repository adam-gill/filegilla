"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import axios from "axios";
import { useAuth } from "@/lib/useAuth";
import Loading from "./loading";
import { showToast } from "@/lib/showToast";
interface Props {
  label: string;
  maxWidth: number;
  className?: string;
  fileName: string | null;
  setFileName: (value: string | null) => void;
}


const FileUpload: React.FC<Props> = ({ label, maxWidth, className, fileName, setFileName }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<FormData | null>(null);
  const { session } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    const newFormData = new FormData();
    if (file) newFormData.append("file", file);
    setFormData(newFormData);
    setFileName(file ? file.name : null);
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
    showToast(`Uploading ${fileName}...`, "", "default")

    try {
      setLoading(true);
      if (session?.user) {
        formData?.append("userId", session.user.id);
        await axios.post("api/upload/", formData);


        setLoading(false);
        showToast(`Successfully uploaded ${fileName}`, "", "good")
        clearFile()
      }
    } catch (error: any) {
      setLoading(false);
      showToast(`Failed to upload ${fileName} :(`, "Please try again...", "destructive")
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
        <Label
          htmlFor="file-upload"
          className="w-full block text-xl font-medium text-white text-center mb-2"
        >
          {label}
        </Label>
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
              className="w-full text-lg bg-white text-black border-black hover:bg-gray-100  transition-colors relative"
            >
              {!fileName ? (
                <>
                  <Upload className="w-5 h-5 mr-2" />
                  Choose file
                </>
              ) : (
                <>{fileName}</>
              )}
            </Button>
            {fileName && (
              <X
                onClick={() => clearFile()}
                className="absolute -right-8 cursor-pointer hover:scale-110 transition-all duration-300"
              />
            )}
          </div>
        </div>

        <Button
          onClick={() => onUpload()}
          className="w-full fg-grad text-black text-lg mt-4"
        >
          {loading ? (
            <>
              <Loading width={24} height={24} stroke={3} />
            </>
          ) : (
            "Upload"
          )}
        </Button>
      </div>
    </>
  );
};

export default FileUpload;
