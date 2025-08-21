import { Skeleton } from "@/components/ui/skeleton";
import { listFolderContents } from "./actions";
import AddContent from "./components/addContent";
import Info from "./components/info";
import ItemsLayout from "./components/itemsLayout";
import { Suspense } from "react";

export default async function Dashboard() {
  const { contents } = await listFolderContents([]);

  return (
    <main>
      <Info />
      <AddContent location={[]} />
      <Suspense
        fallback={
          <div className="flex flex-wrap w-full gap-4">
            {new Array(9).fill(0).map((_, index) => (
              <Skeleton className="w-xs h-[70px] rounded-xl" key={index} />
            ))}
          </div>
        }
      >
        <ItemsLayout className="mt-6" contents={contents} location={[]} />
      </Suspense>
    </main>
  );
}
