import { listFolderContents, validatePath } from "../actions";
import ItemsLayout from "../components/itemsLayout";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import Navigator from "../components/navigator";
import { isFilePage } from "../helpers";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

async function DashboardContent({ path }: { path: string[] }) {
  if (!path) {
    return;
  } else {
    const { contents } = await listFolderContents(path);
    const { valid, type } = await validatePath(path);

    return (
      <ItemsLayout
        contents={contents}
        location={path}
        valid={valid}
        type={type}
      />
    );
  }
}

export default async function PathPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string[] }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { slug } = await params;
  const paramsObject = await searchParams;
  const isFgDoc = paramsObject["fg"] === "1";
  const cleanSlug = decodeURIComponent(slug.join(",")).split(",");

  return (
    <main className="w-full">
      <Suspense
        fallback={
          <>
            {isFilePage(cleanSlug) || isFgDoc ? (
              <div>
                <div className="min-h-screen p-6">
                  <div className="max-w-6xl mx-auto">
                    <div className="flex flex-row w-full justify-between">
                      <div className="w-1/2 max-md:w-4/5 flex flex-col gap-y-3">
                        <Skeleton className="w-full max-md:w-4/5 h-10" />
                        <Skeleton className="w-[200px] h-6" />
                        <Skeleton className="w-[300px] h-6" />
                      </div>
                      <div className="w-1/2 max-md:w-1/5 flex items-start justify-end gap-4">
                        <Skeleton className="w-[52px] h-[40px] max-md:hidden" />
                        <Skeleton className="w-[52px] h-[40px] max-md:hidden" />
                        <Skeleton className="w-[52px] h-[40px] max-md:hidden" />
                        <Skeleton className="w-[52px] h-[40px] max-md:hidden" />
                        <Skeleton className="w-[52px] h-[40px]" />
                      </div>
                    </div>
                    <Skeleton className="w-full h-[600px] mt-8" />
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex w-full justify-between items-center">
                  <Navigator location={cleanSlug} />
                  <Button
                    type="button"
                    variant={"pretty"}
                    className="cursor-pointer w-full max-w-[150px] h-12 px-4 py-4 text-3xl text-black border-none relative hover:brightness-[115%] rounded-2xl transition-all duration-300 outline-none focus-visible:ring-0"
                    disabled={true}
                  >
                    <>
                      <Plus className="w-8 h-8 mr-2" strokeWidth={2} />
                      add
                    </>
                  </Button>
                </div>
                <div className="flex flex-wrap w-full gap-4 items-start justify-center mt-4">
                  {new Array(9).fill(0).map((_, index) => (
                    <Skeleton
                      className="w-xs h-[366px] rounded-xl"
                      key={index}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        }
      >
        <DashboardContent path={cleanSlug} />
      </Suspense>
    </main>
  );
}
