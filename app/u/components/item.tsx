"use client";

import { useState, useRef, useEffect, Dispatch, SetStateAction } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  MoreVertical,
  Folder,
  FileText,
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
  X,
  ImagePlus,
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
import { formatBytes, formatDate, sortItems } from "@/lib/helpers";

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
  newContents: FolderItem[];
  setNewContents: Dispatch<SetStateAction<FolderItem[]>>;
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
    return <ImagePlus className="w-5 h-5 text-blue-400" />;
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
};

const getFileExtension = (fileName: string): string => {
  return "." + fileName.toLowerCase().split(".").pop();
};

export default function Item({
  item,
  location,
  setNewContents,
  newContents,
}: ItemProps) {
  const [isOptionsOpen, setIsOptionsOpen] = useState<boolean>(false);
  const [isRenameOpen, setIsRenameOpen] = useState<boolean>(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
  const [isInfoOpen, setIsInfoOpen] = useState<boolean>(false);
  const [renameName, setRenameName] = useState<string>(item.name);
  const [isRenaming, setIsRenaming] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string>("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (item.type === "file") {
      setRenameName(removeFileExtension(item.name));
    }
  }, [item.type, item.name, setRenameName]);

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

    // TODO - need state updates for file interactions setNewContent(something)
    const savedContents = newContents;

    try {
      const itemName = item.name;
      const fullRenameName =
        item.type === "file"
          ? renameName + getFileExtension(itemName)
          : renameName;

      setNewContents((prev) =>
        sortItems(
          prev.map((contentItem) => {
            if (contentItem.name === itemName) {
              const updatedItem = {
                ...contentItem,
                name: fullRenameName,
                lastModified: new Date(),
                path:
                  contentItem.path.substring(
                    0,
                    contentItem.path.lastIndexOf("/") + 1
                  ) + fullRenameName,
              };
              return updatedItem;
            }
            return contentItem;
          })
        )
      );

      const { success, message } = await renameItem(
        item.type,
        item.name,
        fullRenameName,
        location
      );

      if (success) {
        toast({
          title: "success!",
          description: message,
          variant: "good",
        });
      } else {
        setNewContents(sortItems(savedContents));
        toast({
          title: "error",
          description: message,
          variant: "destructive",
        });
      }
    } catch (error) {
      setNewContents(sortItems(savedContents));
      toast({
        title: "error",
        description: "Unknown server error" + error,
        variant: "destructive",
      });
    } finally {
      setIsRenaming(false);
    }
  };

  const handleDeletionClick = () => {
    setIsDeleteOpen(true);
    setIsOptionsOpen(false);
  };

  const handleItemDeletion = async () => {
    setIsOptionsOpen(false);
    setIsDeleteOpen(false);

    const savedContents = newContents;

    try {
      await Promise.resolve();

      const { success, message } = await deleteItem(
        item.type,
        item.name,
        location
      );

      if (success) {
        const itemName = item.name;
        setNewContents((prev) =>
          sortItems(prev.filter((item) => item.name !== itemName))
        );
        toast({
          title: "Success!",
          description: message,
          variant: "good",
        });
      } else {
        setNewContents(sortItems(savedContents));
        toast({
          title: "Error",
          description: message,
          variant: "destructive",
        });
      }
    } catch (error) {
      setNewContents(sortItems(savedContents));
      toast({
        title: "Error",
        description: `Unknown error deleting file: ${error}`,
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

  const getPath = (path: string): string => {
    const parts = path.split("/");
    return "/u/" + parts.slice(2).join("/");
  };

  const handleItemOpen = () => {
    router.push(`${pathname}/${item.name}`);
    setIsOptionsOpen(false);
  };

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger>
          <Card className="max-w-full group relative w-xs max-md:w-3xs border !border-neutral-700 hover:border-blue-400 transition-all duration-200 shadow-md shadow-neutral-900 hover:shadow-xl">
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
                    onClick={handleItemOpen}
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
                        <Button
                          onClick={handleItemOpen}
                          className="w-full flex justify-start !bg-black !text-gray-100 border-none cursor-pointer hover:!bg-gray-700"
                        >
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

                        <Button
                          onClick={() => {
                            setIsInfoOpen(true);
                            setIsOptionsOpen(false);
                          }}
                          className="w-full flex justify-start !bg-black !text-gray-100 border-none cursor-pointer hover:!bg-gray-700"
                        >
                          <Info className="mr-2 h-4 w-4 text-neutral-400" />
                          more info
                        </Button>
                      </div>
                      <div className="w-full h-px bg-neutral-700 my-1" />

                      <div className="px-1 pb-1">
                        <Button
                          className="w-full flex justify-start cursor-pointer border-none !text-gray-100 !bg-red-600/50 hover:!bg-red-600/80 trans"
                          onClick={handleDeletionClick}
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
          <ContextMenuItem
            onClick={handleItemOpen}
            className="cursor-pointer flex items-center px-3 py-2 text-sm hover:!bg-gray-700 rounded-sm text-gray-100"
          >
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

          <ContextMenuItem
            onClick={() => {
              setIsInfoOpen(true);
              setIsOptionsOpen(false);
            }}
            className="cursor-pointer flex items-center px-3 py-2 text-sm hover:!bg-gray-700 rounded-sm text-gray-100"
          >
            <Info className="mr-2 h-4 w-4" />
            more info
          </ContextMenuItem>

          <ContextMenuSeparator className="h-px bg-gray-600 my-1" />

          <ContextMenuItem
            onClick={handleDeletionClick}
            className="cursor-pointer flex items-center px-3 py-2 text-sm bg-red-600/50 hover:!bg-red-600/80 trans text-gray-100 rounded-sm"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      {/* Rename Dialog */}
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
              tabIndex={0}
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
                setValidationError("");
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleItemRename}
              disabled={
                !renameName.trim() ||
                isRenaming ||
                !!validationError ||
                removeFileExtension(item.name) === renameName
              }
              className="focus-visible:!ring-blue-500 focus-visible:!ring-2 text-base !bg-black cursor-pointer !text-white hover:!bg-white hover:!border-black hover:!text-black trans disabled:!bg-gray-300 disabled:!text-gray-500 disabled:cursor-not-allowed"
            >
              {isRenaming ? "Renaming..." : "Rename"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent className="!bg-white shadow-2xl shadow-gray-600 text-gray-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-black text-2xl">
              {`delete '${item.name}'`}
            </AlertDialogTitle>
            <AlertDialogDescription className="!text-gray-600 text-base">
              {item.type === "file"
                ? `this will permanently delete ${item.name}`
                : `this will permanently delete ${item.name} and all of its contents`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="focus-visible:!ring-neutral-900 focus-visible:!ring-2 text-base !bg-transparent cursor-pointer !text-black hover:!bg-blue-100 trans">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleItemDeletion}
              className="focus-visible:!ring-neutral-900 focus-visible:!ring-2 text-base !bg-red-600/85  cursor-pointer !text-white hover:!bg-white hover:!border-black hover:!text-black trans disabled:!bg-gray-300 disabled:!text-gray-500 disabled:cursor-not-allowed"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* More Info Dialog */}
      <AlertDialog open={isInfoOpen} onOpenChange={setIsInfoOpen}>
        <AlertDialogContent
          ref={infoRef}
          className="!bg-white shadow-2xl shadow-gray-600 text-gray-200"
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="text-black text-2xl">
              {`${item.name}`}
            </AlertDialogTitle>
            <AlertDialogDescription className="!text-gray-600 text-base">
              {`${item.type} information`}
            </AlertDialogDescription>
            <AlertDialogCancel className="!bg-transparent border-none shadow-none hover:!bg-neutral-200 absolute trans top-2 right-2 w-8 h-8 p-0 cursor-pointer">
              <X className="text-black stroke-3 hover:scale-110 trans" />
            </AlertDialogCancel>
          </AlertDialogHeader>
          <div className="w-full max-w-[580px] pb-4 text-gray-600">
            {item.size && (
              <div>
                <strong>item size: </strong>
                {formatBytes(item.size)}
              </div>
            )}
            {item.lastModified && (
              <div>
                <strong>last modified: </strong>
                {formatDate(item.lastModified)}
              </div>
            )}
            <div className="break-words overflow-hidden">
              <strong>item path: </strong>
              {getPath(item.path)}
            </div>
            {item.etag && (
              <div>
                <strong>uid: </strong> {item.etag.slice(1, -1)}
              </div>
            )}
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
