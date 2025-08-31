"use client";

import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Check, Copy } from "lucide-react";
import { useState } from "react";

interface CopyTextProps {
  textToCopy: string;
  className?: string;
  showToast?: boolean;
  isMinWidth?: boolean;
}

export default function CopyText({ textToCopy, className, showToast, isMinWidth }: CopyTextProps) {
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

      if (showToast) {
        toast({
          title: "success!",
          description: `copied share link: ${textToCopy}`,
          variant: "good",
        });
      }

      setShowingAnimation(true);
      await delay(1800);
      setShowingAnimation(false);
    } catch (error) {
      console.error("Failed to copy text to clipboard:", error);
    }
  };

  return (
    <div className={`${isMinWidth ? "" : "w-full"}`}>
      {showingAnimation ? (
        <Check className={cn("text-green-500 stroke-[2.5]", className)} />
      ) : (
        <Copy
          className={cn("cursor-pointer w-4 h-4", className)}
          onClick={handleCopy}
        />
      )}
    </div>
  );
}
