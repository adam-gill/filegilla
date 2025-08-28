'use client'

import { SimpleEditor } from "@/components/tiptap/simple/simple-editor"
import { useState } from "react"

export default function Note() {
  const [content, setContent] = useState<string>("");

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
  };

  return (
    <div style={{ height: 'calc(100vh - 64px)', overflow: 'hidden' }}>
      <SimpleEditor content={content} setContent={handleContentChange} />
    </div>
  );
}
