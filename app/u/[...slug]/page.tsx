import Link from "next/link";
import { listFolderContents, validatePath } from "../actions";
import AddContent from "../components/addContent";
import ItemsLayout from "../components/itemsLayout";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { UnlinkIcon } from "lucide-react";

export default async function PathPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const { contents } = await listFolderContents(slug);
  const { valid, type } = await validatePath(slug);

  const getPath = (slug: string[]) => {
    return "/u/" + slug.join("/");
  };

  return (
    <div className="w-full">
      <AddContent location={slug} />
      <div>{JSON.stringify(slug)}</div>
      <div>{`Valid: ${valid} Type: ${type}`}</div>
      <Suspense
        fallback={
          <div className="flex flex-wrap w-full gap-4">
            {new Array(9).fill(0).map((_, index) => (
              <Skeleton className="w-xs h-[70px] rounded-xl" key={index} />
            ))}
          </div>
        }
      >
        {valid && (
          <ItemsLayout className="mt-6" contents={contents} location={slug} />
        )}
      </Suspense>

      {!valid && (
        <div className="w-full items-center justify-center text-center text-xl mt-6">
          <div className="flex gap-2 w-full items-center justify-center">
            <div>{`path '${getPath(slug)}' not found`}</div>
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
