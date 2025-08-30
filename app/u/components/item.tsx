"use client";

import {
  useState,
  useRef,
  useEffect,
  Dispatch,
  SetStateAction,
  useCallback,
} from "react";
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
  Share,
  Info,
  SquareArrowOutUpRight,
  X,
  ImagePlus,
  Download,
} from "lucide-react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { usePathname, useRouter } from "next/navigation";
import {
  checkShareItem,
  deleteItem,
  getDownloadUrl,
  renameItem,
  shareItem,
} from "../actions";
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
import {
  formatBytes,
  formatDate,
  getFileExtension,
  randomId,
  removeFileExtension,
  sortItems,
  validateItemName,
} from "@/lib/helpers";
import { Skeleton } from "@/components/ui/skeleton";
import CopyText from "./copyText";

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
  const [isShareOpen, setIsShareOpen] = useState<boolean>(false);
  const [isConfirmDelete, setIsConfirmDelete] = useState<boolean>(false);
  const [renameName, setRenameName] = useState<string>(item.name);
  const [itemShareUrl, setItemShareUrl] = useState<string>("");
  const [itemShareName, setItemShareName] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
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

  const handleOptionsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOptionsOpen(!isOptionsOpen);
  };

  const handleItemRename = async () => {
    setIsLoading(true);

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
      setIsLoading(false);
    }
  };

  const handleDownload = useCallback(async () => {
    setIsOptionsOpen(false);

    try {
      const { success, url } = await getDownloadUrl([...location, item.name]);

      if (success && url) {
        // Download the file from the download url
        const link = document.createElement("a");
        link.href = url;
        link.download = item.name || "download";
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast({
          title: "success!",
          description: `successfully downloaded ${item.name}`,
          variant: "good",
        });
      } else {
        toast({
          title: "error",
          description: `failed to download ${item.name}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.log(error);
      toast({
        title: "error",
        description: `download failed: ${error}`,
      });
    }
  }, [location, item.name]);

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

      const itemName = item.name;
      setNewContents((prev) =>
        sortItems(prev.filter((item) => item.name !== itemName))
      );

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
        description: `Unknown error deleting ${item.type}: ${error}`,
        variant: "destructive",
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading) {
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

  const handleItemShare = async () => {
    setIsLoading(true);

    try {
      const { success, message, shareUrl } = await shareItem({
        itemName: item.name,
        itemType: item.type,
        location: location,
        shareName: itemShareName,
        sourceEtag: item.etag,
      });

      if (success && shareUrl) {
        toast({
          title: "success!",
          description: message,
          variant: "good",
        });
        setItemShareUrl(shareUrl);
      } else {
        toast({
          title: "error",
          description: message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "error",
        description: `unknown error sharing file: ${error}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const checkShareStatus = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    if (item.type === "file" && item.etag && item.name) {
      try {
        const { success, shareUrl, shareName } = await checkShareItem({
          itemName: item.name,
          itemType: item.type,
          sourceEtag: item.etag,
        });

        if (success && shareUrl && shareName) {
          setItemShareUrl(shareUrl);
          setItemShareName(shareName);
        } else {
          setItemShareUrl("");
        }
      } catch (error) {
        console.error(
          `unknown error checking ${item.name} share status: ${error}`
        );
      } finally {
        setIsLoading(false);
      }
    } else {
      try {
        const { success, shareUrl, shareName } = await checkShareItem({
          itemName: item.name,
          itemType: item.type,
        });

        if (success && shareUrl && shareName) {
          setItemShareUrl(shareUrl);
          setItemShareName(shareName);
        } else {
          setItemShareUrl("");
        }
      } catch (error) {
        console.error(
          `unknown error checking ${item.name} share status: ${error}`
        );
      } finally {
        setIsLoading(false);
      }
    }
  }, [item.name, item.type, item.etag]);

  useEffect(() => {
    if (isShareOpen) {
      checkShareStatus();
    }
  }, [isShareOpen, checkShareStatus]);

  useEffect(() => {
    setItemShareName(randomId());
  }, []);

  // TODO
  // const handleShareDelete = async () => {
  //   try {
  //   } catch (error) {
  //     toast({
  //       title: "error",
  //       description: `unknown error deleting share: ${error}`,
  //       variant: "destructive",
  //     });
  //   }
  // };

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

                        {item.type === "file" && (
                          <Button
                            onClick={handleDownload}
                            className="w-full flex justify-start !bg-black !text-gray-100 border-none cursor-pointer hover:!bg-gray-700"
                          >
                            <Download className="mr-2 h-4 w-4 text-neutral-400" />
                            download
                          </Button>
                        )}

                        <Button
                          onClick={() => {
                            setIsOptionsOpen(false);
                            setIsShareOpen(true);
                          }}
                          className="w-full flex justify-start !bg-black !text-gray-100 border-none cursor-pointer hover:!bg-gray-700"
                        >
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

          {item.type === "file" && (
            <ContextMenuItem
              onClick={handleDownload}
              className="cursor-pointer flex items-center px-3 py-2 text-sm hover:!bg-gray-700 rounded-sm text-gray-100"
            >
              <Download className="mr-2 h-4 w-4" />
              download
            </ContextMenuItem>
          )}

          <ContextMenuItem
            onClick={() => setIsShareOpen(true)}
            className="cursor-pointer flex items-center px-3 py-2 text-sm hover:!bg-gray-700 rounded-sm text-gray-100"
          >
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
                setValidationError(validateItemName(newName, item.type));
              }}
              onKeyDown={handleKeyPress}
              className={`text-base border-gray-600 text-black placeholder:text-gray-400 focus:border-gray-500 focus:ring-gray-500 ${
                validationError
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : ""
              }`}
              autoFocus
              disabled={isLoading}
            />
            {validationError && (
              <p className="text-red-500 text-sm mt-2">{validationError}</p>
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="focus-visible:!ring-blue-500 focus-visible:!ring-2 text-base !bg-transparent cursor-pointer !text-black hover:!bg-blue-100 trans"
              disabled={isLoading}
              onClick={() => {
                setValidationError("");
              }}
            >
              cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleItemRename}
              disabled={
                !renameName.trim() ||
                isLoading ||
                !!validationError ||
                removeFileExtension(item.name) === renameName
              }
              className="focus-visible:!ring-blue-500 focus-visible:!ring-2 text-base !bg-black cursor-pointer !text-white hover:!bg-white hover:!border-black hover:!text-black trans disabled:!bg-gray-300 disabled:!text-gray-500 disabled:cursor-not-allowed"
            >
              {isLoading ? "renaming..." : "rename"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Share Dialog */}
      <AlertDialog open={isShareOpen} onOpenChange={setIsShareOpen}>
        {isLoading ? (
          <>
            <AlertDialogContent className="!bg-white shadow-2xl shadow-gray-600 text-gray-200">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-black text-2xl">
                  <Skeleton className="h-7 w-3/5 !bg-neutral-900/10" />
                </AlertDialogTitle>
                <AlertDialogDescription className="!text-transparent absolute text-base">
                  loading...
                </AlertDialogDescription>
                <Skeleton className="h-10 w-4/5 !bg-neutral-900/10 my-4" />
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="!m-0 !bg-transparent focus-visible:!ring-black focus-visible:!ring-2 border-none shadow-none hover:!bg-neutral-200 absolute trans top-2 right-2 w-8 h-8 p-0 cursor-pointer">
                  <X className="text-black stroke-3 hover:scale-110 trans" />
                </AlertDialogCancel>

                <Skeleton className="w-[93px] h-[45px] !bg-neutral-900/10 !mr-3" />
                <AlertDialogAction
                  onClick={handleItemShare}
                  disabled={isLoading}
                  className="text-base !bg-neutral-900/10 !text-transparent border-none animate-pulse"
                >
                  share
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </>
        ) : (
          <>
            {itemShareUrl ? (
              <AlertDialogContent className="!bg-white shadow-2xl shadow-gray-600 text-gray-200">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-black text-2xl">
                    {`${
                      item.type === "file"
                        ? `${item.name} aka ${itemShareName}`
                        : `${itemShareName}`
                    } `}
                  </AlertDialogTitle>
                  <AlertDialogDescription className="!text-gray-600 text-base">
                    shared with the world
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="flex flex-row  items-center text-black gap-2">
                  <div className="text-black">{`${process.env.NEXT_PUBLIC_APP_URL}/s/${itemShareName}`}</div>
                  <CopyText
                    textToCopy={`${process.env.NEXT_PUBLIC_APP_URL}/s/${itemShareName}`}
                  />
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel className="!m-0 !bg-transparent focus-visible:!ring-black focus-visible:!ring-2 border-none shadow-none hover:!bg-neutral-200 absolute trans top-2 right-2 w-8 h-8 p-0 cursor-pointer">
                    <X className="text-black stroke-3 hover:scale-110 trans" />
                  </AlertDialogCancel>

                  <Button
                    onClick={() => setIsConfirmDelete(true)}
                    className={`${
                      isConfirmDelete ? "hidden" : "flex"
                    } focus-visible:!ring-black !m-0 focus-visible:!ring-2 text-base !bg-red-600/80 hover:!bg-red-500/90 cursor-pointer trans !text-white border-none trans disabled:!bg-gray-300 disabled:!text-gray-500 disabled:cursor-not-allowed`}
                  >
                    <Trash2 />
                  </Button>

                  <AlertDialogAction
                    onClick={() => {
                      setIsConfirmDelete(false);
                      console.log("delete");
                    }}
                    disabled={
                      !itemShareName.trim() || isLoading || !!validationError
                    }
                    className={`${
                      isConfirmDelete ? "!flex" : "!hidden"
                    } focus-visible:!ring-black focus-visible:!ring-2 text-base !bg-red-600/80 hover:!bg-red-500/90 cursor-pointer trans !text-white border-none trans disabled:!bg-gray-300 disabled:!text-gray-500 disabled:cursor-not-allowed`}
                  >
                    confirm delete?
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            ) : (
              <AlertDialogContent className="!bg-white shadow-2xl shadow-gray-600 text-gray-200">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-black text-2xl">
                    {`share ${item.name}`}
                  </AlertDialogTitle>
                  <AlertDialogDescription className="!text-gray-600 text-base">
                    create a permalink for <strong>{item.name}</strong>, or
                    leave it random. this will be accessible to anyone with the
                    link.
                  </AlertDialogDescription>
                  <div className="text-black">
                    {`preview:`}{" "}
                    <strong>{`${process.env.NEXT_PUBLIC_APP_URL}/s/${itemShareName}`}</strong>
                  </div>
                </AlertDialogHeader>
                <div className="pb-4">
                  {itemShareUrl && <p className="text-black">{itemShareUrl}</p>}
                  <Input
                    type="text"
                    tabIndex={0}
                    placeholder={"share name"}
                    value={itemShareName}
                    onChange={(e) => {
                      const newName = e.target.value;
                      setItemShareName(newName);
                      setValidationError(validateItemName(newName, item.type));
                    }}
                    onKeyDown={handleKeyPress}
                    className={`text-base border-gray-600 text-black placeholder:text-gray-400 focus:border-gray-500 focus:ring-gray-500 ${
                      validationError
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                        : ""
                    }`}
                    autoFocus
                    disabled={isLoading}
                  />
                  {validationError && (
                    <p className="text-red-500 text-sm mt-2">
                      {validationError}
                    </p>
                  )}
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel
                    className="focus-visible:!ring-blue-500 focus-visible:!ring-2 text-base !bg-transparent cursor-pointer !text-black hover:!bg-blue-100 trans"
                    disabled={isLoading}
                    onClick={() => {
                      setValidationError("");
                      setItemShareName(randomId());
                    }}
                  >
                    cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleItemShare}
                    disabled={
                      !itemShareName.trim() || isLoading || !!validationError
                    }
                    className="focus-visible:!ring-blue-500 focus-visible:!ring-2 text-base !bg-[linear-gradient(to_left,#f3f4f6,#60a5fa,#1d4ed8)] cursor-pointer hover:scale-105 trans !text-black border-none hover:!bg-white hover:!border-black hover:!text-black trans disabled:!bg-gray-300 disabled:!text-gray-500 disabled:cursor-not-allowed"
                  >
                    {isLoading ? "sharing..." : "share"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            )}
          </>
        )}
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
              cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleItemDeletion}
              className="focus-visible:!ring-neutral-900 focus-visible:!ring-2 text-base !bg-red-600/85  cursor-pointer !text-white hover:!bg-white hover:!border-black hover:!text-black trans disabled:!bg-gray-300 disabled:!text-gray-500 disabled:cursor-not-allowed"
            >
              delete
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
