"use client";

import { cn } from "@/lib/utils";
import { FolderItem } from "../types";
import Item from "./item";
import { BrushCleaning, UnlinkIcon } from "lucide-react";
import { useState } from "react";
import Navigator from "./navigator";
import AddContent from "./addContent";
import FileViewer from "./fileViewer";
import { sortContents } from "@/lib/helpers";
import Link from "next/link";

interface ItemsLayoutProps {
  contents: FolderItem[];
  className?: string;
  location: string[];
  type: "file" | "folder" | null;
  valid: boolean;
}

export default function ItemsLayout({
  contents,
  className,
  location,
  type,
  valid,
}: ItemsLayoutProps) {
  const initialContents = sortContents(contents);
  const [newContents, setNewContents] = useState<FolderItem[]>(initialContents);

  const getPath = (slug: string[]) => {
    return "/u/" + slug.join("/");
  };

  return (
    <div className={className}>
      <div className="w-full flex items-center justify-between max-md:items-start max-md:flex-col-reverse mb-3">
        <Navigator location={location} />
        {type === "folder" && (
          <AddContent
            location={location}
            setNewContents={setNewContents}
            newContents={newContents}
          />
        )}
      </div>

      {/* TODO - Need global search function (file names) - will involve beefy script */}

      {/* path not valid */}
      {!valid && (
        <div className="w-full items-center justify-center text-center text-xl mt-6">
          <div className="flex gap-2 w-full items-center justify-center">
            <div>{`path '${getPath(location)}' not found`}</div>
            <UnlinkIcon size={32} />
          </div>
          <Link
            className="text-white underline font-medium cursor-pointer"
            href={"/u"}
          >
            return home
          </Link>
        </div>
      )}

      {/* render file */}
      {valid && type === "file" ? (
        <FileViewer location={location} />
      ) : (
        <>
          {valid && (
            <>
              {newContents.length === 0 ? (
                <div className="w-full items-center justify-center text-center text-xl">
                  <div className="flex items-center justify-center flex-row gap-2 w-full">
                    <div>No items here...</div>
                    <BrushCleaning size={32} />
                  </div>
                </div>
              ) : (
                <div
                  className={cn(
                    "flex flex-wrap w-full gap-4 items-center justify-start max-md:justify-center",
                    className
                  )}
                >
                  {newContents.map((content, index) => (
                    <Item
                      key={index}
                      item={content}
                      location={location}
                      setNewContents={setNewContents}
                      newContents={newContents}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
