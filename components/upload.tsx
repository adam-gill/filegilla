"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import axios from "axios";
import { useAuth } from "@/lib/useAuth";

interface Props {
  label: string;
  maxWidth: number;
  className?: string;
}

const FileUpload: React.FC<Props> = ({ label, maxWidth, className }) => {
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<FormData | null>(null);
  const { session } = useAuth();
  const [message, setMessage] = useState<any>();

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
    try {
    if (session?.user) {
      formData?.append("userId", session.user.id)
        const response = await axios.post(
          "api/upload/",
          formData
        );

        // const data = response.data;
        // setMessage(data);
        console.log(response.data);
      }
    } catch (error: any) {
      console.log("Client Error" + error);
      setMessage("Error L");
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
          className="block text-lg font-medium text-white"
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
              className="w-4/5 text-lg bg-white text-black border-black hover:bg-gray-100  transition-colors"
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
                className="ml-2 cursor-pointer hover:scale-110 transition-all duration-300"
              />
            )}
          </div>
        </div>

        <Button
          onClick={() => onUpload()}
          className="w-4/5 fg-grad text-black text-lg mt-4"
        >
          Upload
        </Button>

        <p>{"message: " + message}</p>
      </div>
    </>
  );
};

export default FileUpload;
