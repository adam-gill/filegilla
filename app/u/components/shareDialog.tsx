import {
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { validateItemName, randomId } from "@/lib/helpers";
import { X, Trash2, Info } from "lucide-react";
import CopyText from "./copyText";
import { FolderItem } from "../types";
import {
  changeShareFeaturedStatus,
  checkShareItem,
  deleteShareItem,
  shareItem,
} from "../actions";
import { toast } from "@/hooks/use-toast";
import { useCallback, useEffect, useState } from "react";
import { truncateFileName } from "../helpers";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import MobileTooltip from "@/components/mobileTooltip";

interface ShareDialogProps {
  item: FolderItem;
  location: string[];
  isShareOpen: boolean;
  setIsShareOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function ShareDialog({
  item,
  location,
  isShareOpen,
  setIsShareOpen,
}: ShareDialogProps) {
  const [isConfirmDelete, setIsConfirmDelete] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [itemShareName, setItemShareName] = useState<string>("");
  const [itemShareUrl, setItemShareUrl] = useState<string>("");
  const [isFeatured, setIsFeatured] = useState<boolean>(false);

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

  const handleShareFeatureChange = async () => {
    try {
      const tempIsFeatured = !isFeatured;
      setIsFeatured((prev) => !prev);
      const { success, message } = await changeShareFeaturedStatus(
        itemShareName,
        tempIsFeatured
      );

      if (!success) {
        toast({
          title: "error",
          description: `error changing share's featured status: ${message}`,
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "error",
        description: "unknown error changing share's featured status",
        variant: "destructive",
      });
    }
  };

  const handleShareDelete = async () => {
    try {
      if (item.etag) {
        const { success, message } = await deleteShareItem(
          item.name,
          itemShareName,
          item.etag
        );

        if (success) {
          toast({
            title: "success!",
            description: message,
            variant: "good",
          });
          setItemShareName(randomId());
          setItemShareUrl("");
        } else {
          toast({
            title: "error",
            description: message,
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      toast({
        title: "error",
        description: `unknown error deleting share: ${error}`,
        variant: "destructive",
      });
    }
  };

  const checkShareStatus = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    if (item.type === "file" && item.etag && item.name) {
      try {
        const { success, shareUrl, shareName, isFeatured } =
          await checkShareItem(item.name, item.etag);

        if (success && shareUrl && shareName && isFeatured) {
          setItemShareUrl(shareUrl);
          setItemShareName(shareName);
          setIsFeatured(isFeatured);
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

  useEffect(() => {
    console.log("isFeatured", isFeatured);
  }, [isFeatured]);

  return (
    <>
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
                  <AlertDialogTitle className="text-black text-2xl truncate">
                    {`${
                      item.type === "file"
                        ? `${item.name} aka /s/${itemShareName}`
                        : `${itemShareName}`
                    } `}
                  </AlertDialogTitle>
                  <AlertDialogDescription className="!text-gray-600 text-base">
                    shared with the world
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="flex flex-col  items-start text-black gap-2">
                  <div className="flex flex-row items-center gap-2">
                    <div className="text-black">{`${process.env.NEXT_PUBLIC_APP_URL}/s/${itemShareName}`}</div>
                    <CopyText
                      textToCopy={`${process.env.NEXT_PUBLIC_APP_URL}/s/${itemShareName}`}
                    />
                  </div>
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <Skeleton className="h-[20px] w-[125px]" />
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="feature-in-posts"
                        onClick={handleShareFeatureChange}
                        checked={isFeatured}
                      />
                      <Label
                        className="text-neutral-800"
                        htmlFor="feature-in-posts"
                      >
                        {"feature in /posts?"}
                      </Label>
                      <MobileTooltip
                        trigger={<Info className="w-4 h-4 text-neutral-800" />}
                        content={
                          <p>
                            Checking this box will feature this item in the
                            /posts page. If you don't check it, the file will
                            still be public, but only users with the link will
                            be able to access it.
                          </p>
                        }
                      />
                    </div>
                  )}
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel
                    onClick={() => setIsConfirmDelete(false)}
                    className="!m-0 !bg-transparent focus-visible:!ring-black focus-visible:!ring-2 border-none shadow-none hover:!bg-neutral-200 absolute trans top-2 right-2 w-8 h-8 p-0 cursor-pointer"
                  >
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
                      handleShareDelete();
                      setIsConfirmDelete(false);
                    }}
                    disabled={
                      !itemShareName.trim() || isLoading || !!validationError
                    }
                    className={`${
                      isConfirmDelete ? "!flex mb-2" : "!hidden"
                    } focus-visible:!ring-black focus-visible:!ring-2 text-base !bg-red-600/80 hover:!bg-red-500/90 cursor-pointer trans !text-white border-none trans disabled:!bg-gray-300 disabled:!text-gray-500 disabled:cursor-not-allowed`}
                  >
                    confirm delete?
                  </AlertDialogAction>
                </AlertDialogFooter>
                {isConfirmDelete && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full text-center pb-2 text-black text-sm">
                    {"(this will only delete the shared version)"}
                  </span>
                )}
              </AlertDialogContent>
            ) : (
              <AlertDialogContent className="!bg-white shadow-2xl shadow-gray-600 text-gray-200">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-black text-2xl">
                    {`share ${truncateFileName(item.name)}`}
                  </AlertDialogTitle>
                  <AlertDialogDescription className="!text-gray-600 text-base text-left">
                    create a permalink for{" "}
                    <strong>{truncateFileName(item.name)}</strong>, or leave it
                    random. this will be accessible to anyone with the link.
                  </AlertDialogDescription>
                  <div className="text-black text-left text-wrap max-w-[380px]">
                    {`preview:`}{" "}
                    <strong>{`${process.env.NEXT_PUBLIC_APP_URL}/s/${itemShareName}`}</strong>
                  </div>
                </AlertDialogHeader>
                <div>
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

                  <div className="flex items-center space-x-2 mt-2">
                    <Switch
                      id="feature-in-posts"
                      onClick={() => setIsFeatured((prev) => !prev)}
                      checked={isFeatured}
                    />
                    <Label
                      className="text-neutral-800"
                      htmlFor="feature-in-posts"
                    >
                      {"feature in /posts?"}
                    </Label>
                    <MobileTooltip
                      trigger={<Info className="w-4 h-4 text-neutral-800" />}
                      content={
                        <p>
                          Checking this box will feature this item in the /posts
                          page. If you don't check it, the file will still be
                          public, but only users with the link will be able to
                          access it.
                        </p>
                      }
                    />
                  </div>
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
    </>
  );
}
