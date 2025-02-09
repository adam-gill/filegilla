import { copyToClipboard, delay } from "@/lib/helpers";
import { Button } from "./ui/button";
import { useState } from "react";
import { showToast } from "@/lib/showToast";
import { Copy, Check } from "lucide-react";

interface copyButtonProps {
    toastInfo: {
        title: string,
        description: string,
        variant: "good" | "destructive" | "default",
    },
    copyText: string,
}

const CopyButton: React.FC<copyButtonProps> = ({ toastInfo, copyText }) => {
  const [showAnimation, setShowAnimation] = useState<boolean>(false);
  const clipboardAnimation = async () => {
    setShowAnimation(true);
    await delay(1000);
    setShowAnimation(false);
  };

  return (
    <>
      <Button
        onClick={() => {
          copyToClipboard(copyText);
          clipboardAnimation();
          showToast(toastInfo.title, toastInfo.description, toastInfo.variant);
        }}
      >
        <Copy
          size={24}
          className={`h-4 w-4 cursor-pointer
          ${showAnimation ? "hidden" : "block"}
          
            `}
        />
        <Check
          size={24}
          className={`stroke-green-400 stroke-[3] h-4 w-4 cursor-pointer
           ${showAnimation ? "block" : "hidden"}
          `}
        />
      </Button>
    </>
  );
};

export default CopyButton;
