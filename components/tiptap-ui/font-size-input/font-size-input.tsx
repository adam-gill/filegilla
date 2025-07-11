"use client";

import * as React from "react";

// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-tiptap-editor";

// --- Styles ---
import "./font-size-input.scss";

export function FontSizeInput() {
  const editor = useTiptapEditor();
  const [inputValue, setInputValue] = React.useState("16");

  const currentFontSize = editor?.getAttributes("fontSize").size || "16";

  React.useEffect(() => {
    if (editor) {
      setInputValue(currentFontSize);
    }
  }, [currentFontSize, editor]);

  if (!editor) {
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
  };

  const handleInputBlur = () => {
    const numValue = parseInt(inputValue, 10);
    if (!isNaN(numValue) && numValue > 0 && numValue <= 200) {
      editor.commands.setFontSize(numValue.toString());
    } else {
      // Reset to current font size if invalid
      setInputValue(currentFontSize);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleInputBlur();
    }
  };

  return (
    <div className="tiptap-font-size-input">
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        onKeyDown={handleKeyDown}
        className="tiptap-font-size-input-field tiptap-button-text"
        placeholder="16"
        aria-label="Font size"
        title="Font size"
      />
    </div>
  );
} 