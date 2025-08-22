import Link from "next/link";
import { listFolderContents, validatePath } from "../actions";
import AddContent from "../components/addContent";
import ItemsLayout from "../components/itemsLayout";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { UnlinkIcon } from "lucide-react";
import ItemViewer from "../components/fileViewer";

export default async function PathPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const cleanSlug = decodeURIComponent(slug.join(",")).split(",");
  const { contents } = await listFolderContents(cleanSlug);
  const { valid, type } = await validatePath(cleanSlug);

  const getPath = (slug: string[]) => {
    return "/u/" + slug.join("/");
  };

  return (
    <div className="w-full">
      <AddContent location={cleanSlug} />

      {valid && type === "file" && (
        <div>
          <ItemViewer location={cleanSlug} />
        </div>
      )}

      <Suspense
        fallback={
          <div className="flex flex-wrap w-full gap-4">
            {new Array(9).fill(0).map((_, index) => (
              <Skeleton className="w-xs h-[70px] rounded-xl" key={index} />
            ))}
          </div>
        }
      >
        {type === "folder" && (
          <ItemsLayout
            className="mt-6"
            contents={contents}
            location={cleanSlug}
          />
        )}
      </Suspense>

      {!valid && (
        <div className="w-full items-center justify-center text-center text-xl mt-6">
          <div className="flex gap-2 w-full items-center justify-center">
            <div>{`path '${getPath(cleanSlug)}' not found`}</div>
            <UnlinkIcon size={32} />
          </div>
          <Link className="underline font-medium cursor-pointer" href={"/u"}>
            return home
          </Link>
        </div>
      )}
    </div>
  );
}
