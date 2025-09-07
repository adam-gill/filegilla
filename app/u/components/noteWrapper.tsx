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
import { SyncStatuses } from "@/app/u/types";

interface NoteWrapperProps {
  location: string[];
  initialContent: string;
  fileName: string;
  isPublic: boolean;
  shareName?: string;
  setSyncStatus: Dispatch<SetStateAction<SyncStatuses>>;
}

export default function NoteWrapper({
  location,
  initialContent,
  isPublic,
  shareName,
  fileName,
  setSyncStatus,
}: NoteWrapperProps) {
  const [content, setContent] = useState<string>(initialContent);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { data: session } = authClient.useSession();
  const canEdit = !!session?.user.id;

  const createFileBuffer = () => {
    const html = content.includes(filegillaHTMLId)
      ? content
      : content + `<div data-filegilla="${filegillaHTMLId}"></div>`;

    const fileBuffer = Buffer.from(html, "utf-8");

    return { fileBuffer };
  };

  const handleSave = async () => {
    setSyncStatus("loading");

    try {
      const { fileBuffer } = createFileBuffer();

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

      const presignedUrl = await presignedResponse.json();

      if (!presignedUrl.success) {
        toast({
          title: "Error",
          description: presignedUrl.message,
          variant: "destructive",
        });
        return;
      }

      const uploadResponse = await fetch(presignedUrl, {
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
      }
    } catch (error) {
      setSyncStatus("error");
      console.error(`error syncing document: ${error}`)
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
      handleSave();
    }, 500);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <SimpleEditor
        content={content}
        setContent={handleContentChange}
        canEdit={canEdit}
      />
    </>
  );
}
