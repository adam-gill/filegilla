"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

interface CopyTextProps {
  textToCopy: string;
}

export default function CopyText({ textToCopy }: CopyTextProps) {
  const [showingAnimation, setShowingAnimation] = useState<boolean>(false);

  const delay = (ms: number): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(textToCopy);
        console.log("Copied using Clipboard API");
      }

      setShowingAnimation(true);
      await delay(1800);
      setShowingAnimation(false);
    } catch (error) {
      console.error("Failed to copy text to clipboard:", error);
    }
  };

  return (
    <div>
      {showingAnimation ? (
        <Check className="text-green-500 stroke-[2.5]" />
      ) : (
        <Copy
          className="cursor-pointer hover:stroke-[2.5] trans"
          onClick={handleCopy}
        />
      )}
    </div>
  );
}
