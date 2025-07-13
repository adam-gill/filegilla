'use client'

import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor"
import { useState, useCallback, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { saveNote, loadNote } from "@/app/(main)/(routes)/note/actions"

export default function Note() {
  const { data: session } = useSession();
  const [content, setContent] = useState<string>("");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (session?.user?.id) {
      const fetchNote = async () => {
        const response = await loadNote(session.user.id);
        if (response.success) {
          setContent(response.note_data || "");
        } else {
          console.error(response.message);
        }
      };
      fetchNote();
    }
  }, [session]);

  const debouncedSave = useCallback((newContent: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(async () => {
      if (session?.user?.id) {
        const response = await saveNote(session.user.id, newContent);
        if (response.success) {
          console.log("Note saved to DB");
        } else {
          console.error("Failed to save note:", response.message);
        }
      } else {
        console.log("User not logged in, cannot save");
      }
    }, 500);
  }, [session]);

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    debouncedSave(newContent);
  };

  return (
    <div style={{ height: 'calc(100vh - 64px)', overflow: 'hidden' }}>
      <SimpleEditor content={content} setContent={handleContentChange} />
    </div>
  );
}
