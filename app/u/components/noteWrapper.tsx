import { SimpleEditor } from "@/components/tiptap/simple/simple-editor";
import { toast } from "@/hooks/use-toast";
import { authClient } from "@/lib/auth/auth-client";
import React, {
  useRef,
  useState,
  useEffect,
  Dispatch,
  SetStateAction,
} from "react";
import { filegillaHTMLId } from "@/app/u/helpers";
import { FolderItem, SyncStatuses } from "@/app/u/types";
import { Skeleton } from "@/components/ui/skeleton";

interface NoteWrapperProps {
  location: string[];
  initialContent: string;
  fileName: string;
  isPublic: boolean;
  shareName?: string;
  setSyncStatus: Dispatch<SetStateAction<SyncStatuses>>;
  setFile: Dispatch<SetStateAction<FolderItem | undefined>>;
}

export default function NoteWrapper({
  location,
  initialContent,
  isPublic,
  shareName,
  fileName,
  setSyncStatus,
  setFile,
}: NoteWrapperProps) {
  const [content, setContent] = useState<string>(
    initialContent.replace(/<div data-filegilla="[^"]*"><\/div>/g, "") ?? ""
  );
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { data: session } = authClient.useSession();
  const canEdit = !!session?.user.id;

  const createFileBuffer = (html: string) => {
    const htmlWithMarker = html.includes(filegillaHTMLId)
      ? html
      : html + `<div data-filegilla="${filegillaHTMLId}"></div>`;

    const fileBuffer = Buffer.from(htmlWithMarker, "utf-8");

    return { fileBuffer };
  };

  const handleSave = async (htmlToSave: string) => {
    setSyncStatus("loading");

    try {
      const { fileBuffer } = createFileBuffer(htmlToSave);

      const presignedResponse = await fetch("/api/upload/doc", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileLocation: location,
          isPublic: isPublic,
          fileName: fileName,
          shareName: shareName,
        }),
      });

      const data = await presignedResponse.json();

      if (!data.success) {
        toast({
          title: "Error",
          description: data.message,
          variant: "destructive",
        });
        return;
      }

      const uploadResponse = await fetch(data.presignedUrl, {
        method: "PUT",
        body: fileBuffer,
        headers: {
          "Content-Type": "text/html",
        },
      });

      if (!uploadResponse.ok) {
        setSyncStatus("error");
        toast({
          title: "error",
          description: "failed to sync document",
          variant: "destructive",
        });
      } else {
        setFile((prevFile) => {
          if (prevFile) {
            return {
              ...prevFile,
              size: fileBuffer.byteLength,
              lastModified: new Date(),
            };
          }
          return prevFile;
        });
        setSyncStatus("loaded");
      }
    } catch (error) {
      setSyncStatus("error");
      console.error(`error syncing document: ${error}`);
      toast({
        title: "error",
        description: "failed to sync document",
        variant: "destructive",
      });
    }
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      handleSave(newContent);
    }, 900);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const cleanedContent = initialContent.replace(
      /<div data-filegilla="[^"]*"><\/div>/g,
      ""
    );
    if (cleanedContent) {
      setContent(cleanedContent);
    }
  }, [initialContent]);

  return (
    <>
      {content !== undefined && canEdit !== undefined ? (
        <SimpleEditor
          content={content}
          setContent={handleContentChange}
          canEdit={canEdit}
        />
      ) : (
        <div className="flex flex-col">
          <div className="flex px- w-full">
            <Skeleton className="h-8 w-full bg-neutral-700/30!" />
          </div>
          <div className="flex flex-col gap-y-4 mt-10">
            <Skeleton className="h-8 w-[90%] bg-neutral-700/30!" />
            <Skeleton className="h-8 w-[50%] bg-neutral-700/30!" />
            <Skeleton className="h-8 w-[40%] bg-neutral-700/30!" />
            <Skeleton className="h-8 w-[60%] bg-neutral-700/30!" />
            <Skeleton className="h-8 w-[30%] bg-neutral-700/30!" />
            <Skeleton className="h-8 w-[40%] bg-neutral-700/30!" />
          </div>
        </div>
      )}
    </>
  );
}
