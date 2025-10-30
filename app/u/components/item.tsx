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
  Trash2,
  Edit,
  Share,
  Info,
  SquareArrowOutUpRight,
  Download,
  Copy,
  FolderInput,
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
  copyAndPasteItem,
  deleteItem,
  getDownloadUrl,
  renameItem,
} from "@/app/u/actions";
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
  addCopyToFileName,
  getFileExtension,
  removeFileExtension,
  sortItems,
  validateItemName,
} from "@/lib/helpers";
import ShareDialog from "@/app/u/components/shareDialog";
import InfoDialog from "@/app/u/components/infoDialog";
import GetFileIcon from "@/app/u/components/getFileIcon";
import MoveDialog from "@/app/u/components/moveDialog";
import { FolderItem } from "@/app/u/types";
import Image from "next/image";
import { truncateFileName } from "../helpers";

interface ItemProps {
  item: FolderItem;
  newContents: FolderItem[];
  setNewContents: Dispatch<SetStateAction<FolderItem[]>>;
  location: string[];
}

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
  const [isMoveOpen, setIsMoveOpen] = useState<boolean>(false);
  const [renameName, setRenameName] = useState<string>(item.name);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string>("");
  const previewUrl = item.previewUrl;
  const dropdownRef = useRef<HTMLDivElement>(null);
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

    if (item.type === "folder") {
      try {
        toast({
          title: "preparing download",
          description: "creating zip file for folder...",
          variant: "default",
        });

        const response = await fetch("/api/download-folder", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            location: [...location, item.name],
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Download failed");
        }

        const blob = await response.blob();

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${item.name}.zip`;
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        window.URL.revokeObjectURL(url);

        toast({
          title: "success!",
          description: `successfully downloaded ${item.name} as zip file`,
          variant: "good",
        });
      } catch (error) {
        console.log(error);
        toast({
          title: "error",
          description: `download failed: ${error}`,
          variant: "destructive",
        });
      }
    } else {
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
    }
  }, [location, item.name, item.type]);

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
        description: `unknown error deleting ${item.type}: ${error}`,
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

  const handleItemOpen = () => {
    router.push(`${pathname}/${item.name}`);
    setIsOptionsOpen(false);
  };

  const handleItemCopyAndPaste = async () => {
    setIsOptionsOpen(false);
    const savedContents = newContents;

    try {
      const itemName = item.name;

      setNewContents((prev) => [
        ...prev,
        {
          name: addCopyToFileName(itemName),
          path: item.path,
          type: item.type,
          etag: item.etag,
          lastModified: item.lastModified,
          size: item.size,
          isFgDoc: item.isFgDoc,
          previewUrl: item.previewUrl,
        },
      ]);

      const { success, message } = await copyAndPasteItem(itemName, location);

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
        description: `failed to make a copy of file: ${error}`,
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger>
          <Card className="max-w-full group relative w-xs max-md:w-3xs border !border-neutral-700 hover:border-blue-400 transition-all duration-200 shadow-md shadow-neutral-900 hover:shadow-xl">
            <CardContent
              className={`p-0 h-full flex flex-col-reverse relative ${item.type === "file" ? "flex-col-reverse" : "flex-col"}`}
            >
              {item.type === "file" && (
                <div className="w-full h-[318px] overflow-hidden rounded-b-xl flex justify-center relative">
                  <Image
                    onClick={handleItemOpen}
                    src={previewUrl || "/defaultPreview.svg"}
                    alt={ previewUrl ? "default file preview" : "file preview"}
                    fill
                    className="object-contain cursor-pointer"
                    sizes="318px"
                    unoptimized
                  />
                </div>
              )}

              {/* Top Banner */}
              <div
                className={`flex items-center justify-between p-3 ${item.type === "file" ? "rounded-t-xl w-full max-w-full z-10 bg-neutral-950/90" : ""}`}
              >
                {/* Icon and Name */}
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className="flex-shrink-0">
                    {item.type === "folder" ? (
                      <Folder className="w-5 h-5 text-blue-400" />
                    ) : (
                      <GetFileIcon
                        fileName={item.name}
                        isFgDoc={item.isFgDoc}
                      />
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

                        <Button
                          onClick={() => {
                            setIsOptionsOpen(false);
                            setTimeout(() => {
                              setIsMoveOpen(true);
                            }, 100);
                          }}
                          className="w-full flex justify-start !bg-black !text-gray-100 border-none cursor-pointer hover:!bg-gray-700"
                        >
                          <FolderInput className="mr-2 h-4 w-4 text-neutral-400" />
                          move
                        </Button>

                        <Button
                          onClick={handleDownload}
                          className="w-full flex justify-start !bg-black !text-gray-100 border-none cursor-pointer hover:!bg-gray-700"
                        >
                          <Download className="mr-2 h-4 w-4 text-neutral-400" />
                          download
                        </Button>

                        {item.type === "file" && (
                          <Button
                            onClick={handleItemCopyAndPaste}
                            className="w-full flex justify-start !bg-black !text-gray-100 border-none cursor-pointer hover:!bg-gray-700"
                          >
                            <Copy className="mr-2 h-4 w-4 text-neutral-400" />
                            make a copy
                          </Button>
                        )}

                        {item.type === "file" && (
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
                        )}

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

          <ContextMenuItem
            onClick={() => {
              setIsOptionsOpen(false);
              setTimeout(() => {
                setIsMoveOpen(true);
              }, 100);
            }}
            className="cursor-pointer flex items-center px-3 py-2 text-sm hover:!bg-gray-700 rounded-sm text-gray-100"
          >
            <FolderInput className="mr-2 h-4 w-4" />
            move
          </ContextMenuItem>

          <ContextMenuItem
            onClick={handleDownload}
            className="cursor-pointer flex items-center px-3 py-2 text-sm hover:!bg-gray-700 rounded-sm text-gray-100"
          >
            <Download className="mr-2 h-4 w-4" />
            download
          </ContextMenuItem>

          {item.type === "file" && (
            <ContextMenuItem
              onClick={handleItemCopyAndPaste}
              className="cursor-pointer flex items-center px-3 py-2 text-sm hover:!bg-gray-700 rounded-sm text-gray-100"
            >
              <Copy className="mr-2 h-4 w-4" />
              make a copy
            </ContextMenuItem>
          )}

          {item.type === "file" && (
            <ContextMenuItem
              onClick={() => setIsShareOpen(true)}
              className="cursor-pointer flex items-center px-3 py-2 text-sm hover:!bg-gray-700 rounded-sm text-gray-100"
            >
              <Share className="mr-2 h-4 w-4" />
              share
            </ContextMenuItem>
          )}

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
              {`enter a new name for ${truncateFileName(item.name)}`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4 max-w-[380px]">
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
      <ShareDialog
        item={item}
        location={location}
        isShareOpen={isShareOpen}
        setIsShareOpen={setIsShareOpen}
      />

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

      <InfoDialog
        isInfoOpen={isInfoOpen}
        setIsInfoOpen={setIsInfoOpen}
        item={item}
      />

      <MoveDialog
        isMoveOpen={isMoveOpen}
        setIsMoveOpen={setIsMoveOpen}
        item={item}
        location={location}
        setNewContents={setNewContents}
        newContents={newContents}
        setIsOptionsOpen={setIsOptionsOpen}
      />
    </>
  );
}
