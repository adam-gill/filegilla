import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useCallback, useEffect, useRef, useState } from "react";
import { FolderItem } from "../types";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { listMoveFolders, moveItem } from "../actions";
import { Skeleton } from "@/components/ui/skeleton";
import { deepEqual, sortItems } from "@/lib/helpers";
import { toast } from "@/hooks/use-toast";

interface InfoDialogProps {
  item: FolderItem;
  location: string[];
  isMoveOpen: boolean;
  setIsMoveOpen: React.Dispatch<React.SetStateAction<boolean>>;
  newContents: FolderItem[];
  setNewContents: React.Dispatch<React.SetStateAction<FolderItem[]>>;
  setIsOptionsOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

const getCurrentLocation = (location: string[]) => {
  if (location.length === 0) {
    return `/u/${location.join("/")}`;
  }
  return `/u/${location.join("/")}/`;
};

export default function MoveDialog({
  isMoveOpen,
  setIsMoveOpen,
  item,
  location,
  setNewContents,
  newContents,
  setIsOptionsOpen,
}: InfoDialogProps) {
  const infoRef = useRef<HTMLDivElement>(null);
  const [currentLocation, setCurrentLocation] = useState<string[]>(location);
  const [directoryFolders, setDirectoryFolders] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const handleClickOutsideAlert = (event: MouseEvent) => {
      if (infoRef.current && !infoRef.current.contains(event.target as Node)) {
        setIsMoveOpen(false);
        setCurrentLocation(location);
      }
    };

    document.addEventListener("mousedown", handleClickOutsideAlert);
    return () => {
      document.removeEventListener("mousedown", handleClickOutsideAlert);
    };
  }, [setIsMoveOpen]);

  const listFolders = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const { success, folders, message } = await listMoveFolders(
        currentLocation
      );

      if (success && folders) {
        setDirectoryFolders(folders);
      } else {
        console.error(`error listing folders: ${message}`);
      }
    } catch (error) {
      console.error(
        `unknown error checking ${item.name} share status: ${error}`
      );
    } finally {
      setLoading(false);
    }
  }, [currentLocation]);

  useEffect(() => {
    if (isMoveOpen) {
      listFolders();
    }
  }, [isMoveOpen, listFolders, currentLocation]);

  const handleItemMove = async () => {
    setLoading(true);
    if (setIsOptionsOpen) {
      setIsOptionsOpen(false);
    }
    const savedContents = newContents;

    const itemName = item.name;
    setNewContents((prev) =>
      sortItems(prev.filter((itemObj) => itemObj.name !== itemName))
    );

    try {
      const { success, message } = await moveItem({
        sourceLocation: location,
        destinationLocation: currentLocation,
        itemName: item.name,
        itemType: item.type,
      });

      if (success) {
        setIsMoveOpen(false);
        setCurrentLocation(location);
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
        description: `unknown error moving ${item.name}: ${error}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AlertDialog open={isMoveOpen} onOpenChange={setIsMoveOpen}>
        <AlertDialogContent
          ref={infoRef}
          className="!bg-white shadow-2xl shadow-gray-600 text-gray-200"
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="text-black text-2xl m-0">
              {item && `move ${item.name}`}
            </AlertDialogTitle>
            <AlertDialogDescription className="!text-gray-600 text-base !m-0 hidden">
              {`current location : ${getCurrentLocation(currentLocation)}`}
            </AlertDialogDescription>
            <AlertDialogCancel
              onClick={() => {
                setCurrentLocation(location);
                setIsMoveOpen(false);
                setIsOptionsOpen && setIsOptionsOpen(false);
              }}
              className="!bg-transparent border-none shadow-none hover:!bg-neutral-200 absolute trans top-2 right-2 w-8 h-8 p-0 cursor-pointer"
            >
              <X className="text-black stroke-3 hover:scale-110 trans" />
            </AlertDialogCancel>
          </AlertDialogHeader>
          {loading ? (
            <div className="flex flex-col gap-y-2">
              {new Array(4).fill(0).map((_, index) => (
                <Skeleton
                  key={index}
                  className="h-8 w-full !bg-neutral-700/30"
                />
              ))}
            </div>
          ) : (
            <div className="text-black gap-y-2 flex flex-col">
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setCurrentLocation((prev) => prev.slice(0, -1))
                  }
                  className="cursor-pointer text-black hover:scale-110 trans disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={currentLocation.length === 0}
                >
                  <ChevronLeft className="stroke-[2.5]" />
                </button>
                <div className="flex items-center justify-center text-center">
                  <div className="flex flex-col items-center mb-0.5">{`move to: ${getCurrentLocation(
                    currentLocation
                  )}`}</div>
                </div>
              </div>

              {directoryFolders.map((folder, index) => (
                <div
                  onClick={() =>
                    setCurrentLocation((prev) => [...prev, folder])
                  }
                  key={index}
                  className="flex items-center justify-between shadow-lg p-1 rounded-lg bg-neutral-500/30 hover:bg-neutral-500/50 trans active:scale-95 cursor-pointer"
                >
                  <div className="ml-1 font-medium">{folder}</div>
                  <ChevronRight className="stroke-[2.5]" />
                </div>
              ))}
            </div>
          )}
          <AlertDialogAction
            className="!cursor-pointer active:scale-95 hover:text-white hover:!bg-black trans"
            onClick={handleItemMove}
            disabled={loading || deepEqual(location, currentLocation)}
          >
            move here
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
