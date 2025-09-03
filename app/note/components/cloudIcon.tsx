import { Check, LoaderCircle, X } from "lucide-react";
import Image from "next/image";

interface CloudIconProps {
  status: "loaded" | "loading" | "error";
}

export default function CloudIcon({ status }: CloudIconProps) {
  return (
    <div className="relative">
      <Image
        src={"/syncCloud.svg"}
        alt="Cloud Icon Showing Sync Status of Note"
        width={34}
        height={20}
      />
      {status === "loaded" && (
        <div className="absolute -bottom-1 left-1.5 w-3 h-3 rounded-full bg-green-500 flex items-center justify-center">
          <Check className="text-black stroke-[4]" size={9} />
        </div>
      )}
      {status === "loading" && (
        <div className="absolute -bottom-1 left-1.5 w-3 h-3 rounded-full bg-neutral-400 flex items-center justify-center">
          <LoaderCircle className="text-black stroke-[4] animate-spin" size={9} />
        </div>
      )}
      {status === "error" && (
        <div className="absolute -bottom-1 left-1.5 w-3 h-3 rounded-full bg-red-500 flex items-center justify-center">
          <X className="text-black stroke-[4]" size={9} />
        </div>
      )}
    </div>
  );
}
