"use client";

import { SimpleEditor } from "@/components/tiptap/simple/simple-editor";
import { useState, useEffect, useRef } from "react";
import { syncNote } from "../actions";
import CloudIcon from "./cloudIcon";
import { toast } from "@/hooks/use-toast";

interface NoteProps {
  initialNoteData: string | undefined;
}

export default function Note({ initialNoteData }: NoteProps) {
  const [content, setContent] = useState<string>(initialNoteData ?? "");
  const [syncStatus, setSyncStatus] = useState<"loaded" | "loading" | "error">(
    initialNoteData ? "loaded" : "loading"
  );
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    setSyncStatus("loading");

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(async () => {
      const { success, message } = await syncNote(newContent);

      if (success) {
        setSyncStatus("loaded");
      } else {
        toast({
          title: "error syncing note",
          description: `please try again. error: ${message}`,
          variant: "destructive",
        });
        setSyncStatus("error");
      }
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
    <div style={{ height: "calc(100vh - 64px)", overflow: "hidden" }}>
      <div className="px-6 font-bold text-lg pb-4 flex items-center gap-3">
        <div>personal notepad</div>
        <CloudIcon status={syncStatus} />
      </div>
      <SimpleEditor content={content} setContent={handleContentChange} />
    </div>
  );
}
