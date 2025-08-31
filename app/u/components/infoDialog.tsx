import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useEffect, useRef } from "react";
import { FolderItem } from "../types";
import { formatBytes, formatDate } from "@/lib/helpers";
import { X } from "lucide-react";

interface InfoDialogProps {
  item: FolderItem;
  isInfoOpen: boolean;
  setIsInfoOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function InfoDialog({
  isInfoOpen,
  setIsInfoOpen,
  item,
}: InfoDialogProps) {
  const infoRef = useRef<HTMLDivElement>(null);

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
  }, [setIsInfoOpen]);

  const getPath = (path: string): string => {
    const parts = path.split("/");
    return "/u/" + parts.slice(2).join("/");
  };

  return (
    <>
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
            {item.path && (
              <div className="break-words overflow-hidden">
                <strong>item path: </strong>
                {getPath(item.path)}
              </div>
            )}
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
