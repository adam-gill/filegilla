import { listFolderContents, validatePath } from "../actions";
import ItemsLayout from "../components/itemsLayout";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default async function PathPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const cleanSlug = decodeURIComponent(slug.join(",")).split(",");
  const { contents } = await listFolderContents(cleanSlug);
  const { valid, type } = await validatePath(cleanSlug);

  return (
    <main className="w-full">
      <Suspense
        fallback={
          <div className="flex flex-wrap w-full gap-4">
            {new Array(9).fill(0).map((_, index) => (
              <Skeleton className="w-xs h-[70px] rounded-xl" key={index} />
            ))}
          </div>
        }
      >
        <ItemsLayout
          contents={contents}
          location={cleanSlug}
          type={type}
          valid={valid}
        />
      </Suspense>
    </main>
  );
}
