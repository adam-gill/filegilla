import { cn } from "@/lib/utils";
import { FolderItem } from "../actions";
import Item from "./item";

interface ItemsLayoutProps {
    contents: FolderItem[];
    className?: string;
}

export default function ItemsLayout({ contents, className }: ItemsLayoutProps) {



    const sortedContents = contents.sort((a, b) => {
        if (a.type === b.type) {
            return 0;
        }
        return a.type === 'folder' ? -1 : 1;
    });

    return (
        <div className={cn("flex flex-wrap w-full gap-4", className)}>
            {sortedContents.map((content, index) => (
                <Item key={index} item={content} />
            ))}
        </div>
    )
}