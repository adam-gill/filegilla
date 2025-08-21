"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  MoreVertical,
  Folder,
  FileText,
  Image,
  Video,
  Music,
  Archive,
  File,
  Trash2,
  Edit,
  Copy,
  Share,
  Info,
  SquareArrowOutUpRight,
} from "lucide-react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { usePathname, useRouter } from "next/navigation";
import { deleteItem, renameItem } from "../actions";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
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

// Type for folder contents
interface FolderItem {
  name: string;
  type: "file" | "folder";
  size?: number;
  lastModified?: Date;
  path: string;
  etag?: string;
}

interface ItemProps {
  item: FolderItem;
  location: string[];
}

const getFileIcon = (fileName: string) => {
  const extension = fileName.toLowerCase().split(".").pop();

  // Image files
  if (
    ["jpg", "jpeg", "png", "gif", "bmp", "svg", "webp", "ico"].includes(
      extension || ""
    )
  ) {
    return <Image className="w-5 h-5 text-blue-400" />;
  }

  // Video files
  if (
    ["mp4", "avi", "mov", "wmv", "flv", "webm", "mkv", "m4v"].includes(
      extension || ""
    )
  ) {
    return <Video className="w-5 h-5 text-purple-400" />;
  }

  // Audio files
  if (
    ["mp3", "wav", "flac", "aac", "ogg", "wma", "m4a"].includes(extension || "")
  ) {
    return <Music className="w-5 h-5 text-green-400" />;
  }

  // Archive files
  if (["zip", "rar", "7z", "tar", "gz", "bz2"].includes(extension || "")) {
    return <Archive className="w-5 h-5 text-orange-400" />;
  }

  // Document files
  if (["pdf", "doc", "docx", "txt", "rtf", "odt"].includes(extension || "")) {
    return <FileText className="w-5 h-5 text-red-400" />;
  }

  // Default file icon
  return <File className="w-5 h-5 text-gray-400" />;
};

const removeFileExtension = (name: string): string => {
  const lastDotIndex = name.lastIndexOf(".");
  
  if (lastDotIndex <= 0 || lastDotIndex === name.length - 1) {
    return name;
  }
  
  return name.substring(0, lastDotIndex);
}

const getFileExtension = (fileName: string): string => {
  return "." + fileName.toLowerCase().split(".").pop();
}

export default function Item({ item, location }: ItemProps) {
  const [isOptionsOpen, setIsOptionsOpen] = useState<boolean>(false);
  const [isRenameOpen, setIsRenameOpen] = useState<boolean>(false);
  const [renameName, setRenameName] = useState<string>(removeFileExtension(item.name));
  const [isRenaming, setIsRenaming] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string>("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();


  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOptionsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const validateItemName = (name: string): string => {
    if (!name.trim()) {
      return "";
    }

    // Check for invalid characters
    const invalidChars = /[<>:"/\\|?*\x00-\x1f]/;
    if (invalidChars.test(name)) {
      return `${item.type} name cannot contain: < > : " / \\ | ? * or control characters`;
    }

    // Check for leading/trailing dots
    if (name.startsWith(" ") || name.endsWith(" ")) {
      return `${item.type} name cannot start or end with spaces`;
    }

    // Check for consecutive spaces
    if (name.includes("  ")) {
      return `${item.type} name cannot contain consecutive spaces`;
    }

    if (name.length > 255) {
      return `${item.type} name cannot exceed 255 characters`;
    }

    return "";
  };

  const handleOptionsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOptionsOpen(!isOptionsOpen);
  };

  const handleItemRename = async () => {
    setIsRenaming(true);

    try {

      const fullRenameName = item.type === "file" ? renameName + getFileExtension(renameName) : renameName

      const { success, message } = await renameItem(
        item.type,
        item.name,
        fullRenameName,
        location
      );

      if (success) {
        toast({
          title: "Success!",
          description: message,
          variant: "good",
        });

        router.refresh();
      } else {
        toast({
          title: "Error",
          description: message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Unknown server error" + error,
        variant: "destructive",
      });
    } finally {
      setIsRenaming(false);
    }
  };

  const handleItemDeletion = async () => {
    setIsOptionsOpen(false);

    const { success, message } = await deleteItem(
      item.type,
      item.name,
      location
    );

    if (success) {
      toast({
        title: "Success!",
        description: message,
        variant: "good",
      });
      router.refresh();
    } else {
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isRenaming) {
      handleItemRename();
    } else if (e.key === "Escape") {
      setIsRenameOpen(false);
      setRenameName("");
    }
  };

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger>
          <Card className="group relative w-xs border !border-neutral-700 hover:border-blue-400 transition-all duration-200 shadow-lg hover:shadow-xl">
            <CardContent className="p-0 h-full flex flex-col">
              {/* Top Banner */}
              <div className="flex items-center justify-between p-3">
                {/* Icon and Name */}
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className="flex-shrink-0">
                    {item.type === "folder" ? (
                      <Folder className="w-5 h-5 text-blue-400" />
                    ) : (
                      getFileIcon(item.name)
                    )}
                  </div>

                  {/* Name with truncation */}
                  <div
                    title={item.name}
                    onClick={() => router.push(`${pathname}/${item.name}`)}
                    className="cursor-pointer flex-1 min-w-0"
                  >
                    <p className="text-base font-medium text-gray-100 truncate">
                      {item.name}
                    </p>
                  </div>
                </div>

                {/* Options Button - Always visible */}
                <div className="flex-shrink-0 ml-2 relative" ref={dropdownRef}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="cursor-pointer h-8 w-8 p-0 hover:bg-gray-600 text-gray-300 hover:text-white"
                    onClick={handleOptionsClick}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>

                  {/* Dropdown Menu */}
                  {isOptionsOpen && (
                    <div className="absolute bg-black right-0 top-full mt-1 min-w-[200px] rounded-md shadow-lg border !z-100 border-neutral-700">
                      <div className="px-1 pt-1">
                        <Button className="w-full flex justify-start !bg-black !text-gray-100 border-none cursor-not-allowed hover:!bg-gray-700">
                          <SquareArrowOutUpRight className="mr-2 h-4 w-4 text-neutral-400" />
                          open
                        </Button>
                        <Button
                          onClick={() => {
                            setIsRenameOpen(true);
                            setIsOptionsOpen(false);
                          }}
                          className="w-full flex justify-start !bg-black !text-gray-100 border-none cursor-pointer hover:!bg-gray-700"
                        >
                          <Edit className="mr-2 h-4 w-4 text-neutral-400" />
                          rename
                        </Button>

                        <Button className="w-full flex justify-start !bg-black !text-gray-100 border-none cursor-not-allowed hover:!bg-gray-700">
                          <Copy className="mr-2 h-4 w-4 text-neutral-400" />
                          make a copy
                        </Button>

                        <Button className="w-full flex justify-start !bg-black !text-gray-100 border-none cursor-not-allowed hover:!bg-gray-700">
                          <Share className="mr-2 h-4 w-4 text-neutral-400" />
                          share
                        </Button>

                        <Button className="w-full flex justify-start !bg-black !text-gray-100 border-none cursor-not-allowed hover:!bg-gray-700">
                          <Info className="mr-2 h-4 w-4 text-neutral-400" />
                          more info
                        </Button>
                      </div>
                      <div className="w-full h-px bg-neutral-700 my-1" />

                      <div className="px-1 pb-1">
                        <Button
                          className="w-full flex justify-start cursor-pointer border-none !text-gray-100 !bg-red-600/50 hover:!bg-red-600/80 trans"
                          onClick={handleItemDeletion}
                        >
                          <Trash2 className="mr-2 h-4 w-4 text-neutral-400" />
                          delete
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </ContextMenuTrigger>

        {/* Right-click Context Menu */}
        <ContextMenuContent className="!z-100 min-w-[200px] bg-black rounded-md shadow-lg border border-neutral-700 p-1">
          <ContextMenuItem className="cursor-not-allowed flex items-center px-3 py-2 text-sm hover:!bg-gray-700 rounded-sm text-gray-100">
            <SquareArrowOutUpRight className="mr-2 h-4 w-4" />
            open
          </ContextMenuItem>
          <ContextMenuItem
            onClick={() => {
              setIsRenameOpen(true);
              setIsOptionsOpen(false);
            }}
            className="cursor-pointer flex items-center px-3 py-2 text-sm hover:!bg-gray-700 rounded-sm text-gray-100"
          >
            <Edit className="mr-2 h-4 w-4" />
            rename
          </ContextMenuItem>

          <ContextMenuItem className="cursor-not-allowed flex items-center px-3 py-2 text-sm hover:!bg-gray-700 rounded-sm text-gray-100">
            <Copy className="mr-2 h-4 w-4" />
            make a copy
          </ContextMenuItem>

          <ContextMenuItem className="cursor-not-allowed flex items-center px-3 py-2 text-sm hover:!bg-gray-700 rounded-sm text-gray-100">
            <Share className="mr-2 h-4 w-4" />
            share
          </ContextMenuItem>

          <ContextMenuItem className="cursor-not-allowed flex items-center px-3 py-2 text-sm hover:!bg-gray-700 rounded-sm text-gray-100">
            <Info className="mr-2 h-4 w-4" />
            more info
          </ContextMenuItem>

          <ContextMenuSeparator className="h-px bg-gray-600 my-1" />

          <ContextMenuItem
            onClick={handleItemDeletion}
            className="cursor-pointer flex items-center px-3 py-2 text-sm bg-red-600/50 hover:!bg-red-600/80 trans text-gray-100 rounded-sm"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      <AlertDialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
        <AlertDialogContent className="!bg-white shadow-2xl shadow-gray-600 text-gray-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-black text-2xl">
              {`rename ${item.type}`}
            </AlertDialogTitle>
            <AlertDialogDescription className="!text-gray-600 text-base">
              {`enter a new name for ${item.name}`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Input
              type="text"
              placeholder={`${item.type} name`}
              value={renameName}
              onChange={(e) => {
                const newName = e.target.value;
                setRenameName(newName);
                setValidationError(validateItemName(newName));
              }}
              onKeyDown={handleKeyPress}
              className={`text-base border-gray-600 text-black placeholder:text-gray-400 focus:border-gray-500 focus:ring-gray-500 ${
                validationError
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : ""
              }`}
              autoFocus
              disabled={isRenaming}
            />
            {validationError && (
              <p className="text-red-500 text-sm mt-2">{validationError}</p>
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="focus-visible:!ring-blue-500 focus-visible:!ring-2 text-base !bg-transparent cursor-pointer !text-black hover:!bg-blue-100 trans"
              disabled={isRenaming}
              onClick={() => {
                setRenameName("");
                setValidationError("");
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleItemRename}
              disabled={!renameName.trim() || isRenaming || !!validationError || removeFileExtension(item.name) === renameName}
              className="focus-visible:!ring-blue-500 focus-visible:!ring-2 text-base !bg-black cursor-pointer !text-white hover:!bg-white hover:!border-black hover:!text-black trans disabled:!bg-gray-300 disabled:!text-gray-500 disabled:cursor-not-allowed"
            >
              {isRenaming ? "Renaming..." : "Rename"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
