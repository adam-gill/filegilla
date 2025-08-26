"use client";

import { useState, useRef, Dispatch, SetStateAction, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Folder, Upload, FolderPlus, FileText } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/tiptap/tiptap-ui-primitive/dropdown-menu";
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
import { createFolder } from "../actions";
import { toast } from "@/hooks/use-toast";
import { FolderItem } from "../types";
import { sortItems } from "@/lib/helpers";

interface AddContentProps {
  location: string[];
  newContents: FolderItem[];
  setNewContents: Dispatch<SetStateAction<FolderItem[]>>;
}

export default function AddContent({
  location,
  setNewContents,
  newContents,
}: AddContentProps) {
  const [isFolderDialogOpen, setIsFolderDialogOpen] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderNameInputRef = useRef<HTMLInputElement>(null);

  // Folder name validation function
  const validateFolderName = (name: string): string => {
    if (!name.trim()) {
      return "";
    }

    // Check for invalid characters
    const invalidChars = /[<>:"/\\|?*\x00-\x1f]/;
    if (invalidChars.test(name)) {
      return 'Folder name cannot contain: < > : " / \\ | ? * or control characters';
    }

    // Check for leading/trailing spaces
    if (name.startsWith(" ") || name.endsWith(" ")) {
      return "Folder name cannot start or end with spaces";
    }

    if (name.includes("  ")) {
      return "Folder name cannot have consecutive spaces";
    }

    if (name.length > 255) {
      return "Folder name cannot exceed 255 characters";
    }

    return "";
  };

  const uploadFileWithProgress = (
    file: File,
    presignedUrl: string
  ): Promise<boolean> => {
    return new Promise((resolve) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          setUploadProgress(Math.round(percentComplete));
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(true);
        } else {
          console.error(`Upload failed with status: ${xhr.status}`);
          resolve(false);
        }
      });

      xhr.addEventListener("error", () => {
        console.error("Upload error occurred");
        resolve(false);
      });

      xhr.open("PUT", presignedUrl);
      xhr.setRequestHeader(
        "Content-Type",
        file.type || "application/octet-stream"
      );
      xhr.send(file);
    });
  };

  const handleFilesUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const fileInfo = Array.from(files).map((file) => ({
        name: file.name,
        type: file.type || "application/octet-stream",
        size: file.size,
      }));

      const presignedResponse = await fetch("/api/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          files: fileInfo,
          location: location,
        }),
      });

      const presignedResult = await presignedResponse.json();

      if (!presignedResult.success) {
        toast({
          title: "Error",
          description: presignedResult.message,
          variant: "destructive",
        });
        return;
      }

      const uploadedFiles: FolderItem[] = [];
      const failedFiles: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const presignedUrlData = presignedResult.presignedUrls[i];
        const presignedUrl = presignedUrlData.url || presignedUrlData;

        const success = await uploadFileWithProgress(file, presignedUrl);

        if (success) {
          const folderItem: FolderItem = {
            name: file.name,
            type: "file",
            size: file.size,
            lastModified: new Date(file.lastModified),
            path: "private/userId/" + location.join("/") + "/" + file.name,
            fileType: file.type || "application/octet-stream",
          };
          console.log(folderItem);
          uploadedFiles.push(folderItem);
        } else {
          failedFiles.push(file.name);
        }
      }

      if (uploadedFiles.length === 0) {
        toast({
          title: "Error",
          description: "Failed to upload any files. Please try again.",
          variant: "destructive",
        });
      } else {
        setNewContents((prev) => sortItems([...uploadedFiles, ...prev]));

        if (failedFiles.length > 0) {
          toast({
            title: "Partial Success",
            description: `Successfully uploaded ${
              uploadedFiles.length
            } files. Failed to upload: ${failedFiles.join(", ")}`,
            variant: "good",
          });
        } else {
          toast({
            title: "Success!",
            description: `Successfully uploaded ${uploadedFiles.length} file${
              uploadedFiles.length > 1 ? "s" : ""
            }.`,
            variant: "good",
          });
        }
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Error",
        description: "Failed to upload files. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }

    event.target.value = "";
  };

  const handleFolderUpload = () => {
    console.log("Folder upload clicked");
  };

  const handleNewDocument = () => {
    console.log("New document clicked");
  };

  const handleCreateFolder = async () => {
    if (!folderName.trim()) return;

    setIsCreating(true);
    const error = validateFolderName(folderName);
    if (error) {
      setValidationError(error);
      return;
    }

    const savedContents = newContents;

    const newFolderItem: FolderItem = {
      name: folderName.trim(),
      type: "folder",
      lastModified: new Date(),
      path: `private/userId/${location.join("/")}${
        location.length === 0 ? "" : "/"
      }${folderName.trim()}/`,
    };

    setNewContents((prev) => sortItems([newFolderItem, ...prev]));

    try {
      const { success, message } = await createFolder(
        folderName.trim(),
        location
      );
      if (success) {
        toast({
          title: "Success!",
          description: `Folder '${folderName}' was successfully created.`,
          variant: "good",
        });
        setFolderName("");
        setValidationError("");
        setIsFolderDialogOpen(false);
      } else {
        setNewContents(sortItems(savedContents));
        toast({
          title: "Error",
          description: `Failed to create folder. Error: ${message}`,
          variant: "destructive",
        });
        setValidationError(message);
      }
    } catch {
      setNewContents(sortItems(savedContents));
      toast({
        title: "Error",
        description: "Failed to create folder. Error: Unknown",
        variant: "destructive",
      });
      setValidationError("An unexpected error occurred");
    } finally {
      setIsCreating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isCreating) {
      handleCreateFolder();
    } else if (e.key === "Escape") {
      setIsFolderDialogOpen(false);
      setFolderName("");
    }
  };

  useEffect(() => {
    if (isFolderDialogOpen) {
      requestAnimationFrame(() => {
        if (folderNameInputRef.current) {
          folderNameInputRef.current.focus();
          folderNameInputRef.current.select();
        }
      });
    }
  }, [isFolderDialogOpen]);

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFilesUpload}
        multiple
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant={"pretty"}
            className="cursor-pointer w-full max-w-[150px] h-12 px-4 py-4 text-3xl text-black border-none relative hover:brightness-[115%] rounded-2xl transition-all duration-300 outline-none focus-visible:ring-0"
            disabled={isUploading}
          >
            {isUploading ? (
              <div className="flex items-center justify-center w-full h-full">
                <div className="relative w-8 h-8 mr-2">
                  <svg
                    className="w-8 h-8 transform -rotate-90"
                    viewBox="0 0 32 32"
                  >
                    <circle
                      cx="16"
                      cy="16"
                      r="14"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                      className="text-transparent"
                    />
                    <circle
                      cx="16"
                      cy="16"
                      r="14"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 14}`}
                      strokeDashoffset={`${
                        2 * Math.PI * 14 * (1 - uploadProgress / 100)
                      }`}
                      className="text-black transition-all duration-300 ease-out"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <span className="inset-0 flex items-center justify-center text-2xl font-medium text-black">
                  {uploadProgress}%
                </span>
              </div>
            ) : (
              <>
                <Plus className="w-8 h-8 mr-2" strokeWidth={2} />
                add
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="!z-100 w-56 !bg-gray-900 border border-gray-600 !rounded-lg !shadow-lg !shadow-gray-800 p-1">
          <DropdownMenuItem
            className="flex items-center gap-3 px-3 py-2 text-sm text-gray-200 hover:bg-gray-800 rounded cursor-pointer outline-none"
            onSelect={() => {
              fileInputRef.current?.click();
            }}
            disabled={isUploading}
          >
            <Upload className="w-4 h-4" />
            Upload files
          </DropdownMenuItem>
          <DropdownMenuItem
            className="flex items-center gap-3 px-3 py-2 text-sm text-gray-200 hover:bg-gray-800 rounded cursor-pointer outline-none"
            onSelect={handleFolderUpload}
            disabled={isUploading}
          >
            <Folder className="w-4 h-4" />
            Upload folder
          </DropdownMenuItem>
          <DropdownMenuItem
            className="flex items-center gap-3 px-3 py-2 text-sm text-gray-200 hover:bg-gray-800 rounded cursor-pointer outline-none"
            onSelect={() => {
              setIsFolderDialogOpen(true);
            }}
            disabled={isUploading}
          >
            <FolderPlus className="w-4 h-4" />
            New folder
          </DropdownMenuItem>
          <DropdownMenuItem
            className="flex items-center gap-3 px-3 py-2 text-sm text-gray-200 hover:bg-gray-800 rounded cursor-pointer outline-none"
            onSelect={handleNewDocument}
            disabled={isUploading}
          >
            <FileText className="w-4 h-4" />
            New document
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog
        open={isFolderDialogOpen}
        onOpenChange={setIsFolderDialogOpen}
      >
        <AlertDialogContent className="!bg-white shadow-2xl shadow-gray-600 text-gray-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-black text-2xl">
              Create New Folder
            </AlertDialogTitle>
            <AlertDialogDescription className="!text-gray-600 text-base">
              Enter a name for your new folder
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            {/* TODO - make this automatically focus the cursor int the text input */}
            <Input
              ref={folderNameInputRef}
              tabIndex={-1}
              type="text"
              placeholder="Folder name"
              value={folderName}
              onChange={(e) => {
                const newName = e.target.value;
                setFolderName(newName);
                setValidationError(validateFolderName(newName));
              }}
              onKeyDown={handleKeyPress}
              className={`text-base border-gray-600 text-black placeholder:text-gray-400 focus:border-gray-500 focus:ring-gray-500 ${
                validationError
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : ""
              }`}
              autoFocus
              disabled={isCreating}
            />
            {validationError && (
              <p className="text-red-500 text-sm mt-2">{validationError}</p>
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="focus-visible:!ring-blue-500 focus-visible:!ring-2 text-base !bg-transparent cursor-pointer !text-black hover:!bg-blue-100 trans"
              disabled={isCreating}
              onClick={() => {
                setFolderName("");
                setValidationError("");
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCreateFolder}
              disabled={!folderName.trim() || isCreating || !!validationError}
              className="focus-visible:!ring-blue-500 focus-visible:!ring-2 text-base !bg-black cursor-pointer !text-white hover:!bg-white hover:!border-black hover:!text-black trans disabled:!bg-gray-300 disabled:!text-gray-500 disabled:cursor-not-allowed"
            >
              {isCreating ? "Creating..." : "Create"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
