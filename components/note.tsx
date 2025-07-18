'use client'

import { SimpleEditor } from "@/components/tiptap/simple/simple-editor"
import { useState, useRef } from "react"

export default function Note() {
  const [content, setContent] = useState<string>("");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);




  const handleContentChange = (newContent: string) => {
    setContent(newContent);
  };

  return (
    <div style={{ height: 'calc(100vh - 64px)', overflow: 'hidden' }}>
      <SimpleEditor content={content} setContent={handleContentChange} />
    </div>
  );
}
