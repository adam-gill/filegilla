import { cn } from "@/lib/utils";
import { FolderItem } from "../types";
import Item from "./item";
import { BrushCleaning } from "lucide-react";

interface ItemsLayoutProps {
  contents: FolderItem[];
  className?: string;
  location: string[];
}

export default function ItemsLayout({
  contents,
  className,
  location,
}: ItemsLayoutProps) {
  const sortedContents = contents.sort((a, b) => {
    if (a.type === b.type) {
      return 0;
    }
    return a.type === "folder" ? -1 : 1;
  });

  return (
    <div className={className}>
      {sortedContents.length === 0 ? (
        <div className="w-full items-center justify-center text-center text-xl">
          <div className="flex items-center justify-center flex-row gap-2 w-full">
            <div>No items here...</div>
            <BrushCleaning size={32} />
          </div>
        </div>
      ) : (
        <div className={cn("flex flex-wrap w-full gap-4", className)}>
          {sortedContents.map((content, index) => (
            <Item key={index} item={content} location={location} />
          ))}
        </div>
      )}
    </div>
  );
}
