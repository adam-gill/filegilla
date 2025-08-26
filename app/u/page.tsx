import { Skeleton } from "@/components/ui/skeleton";
import { listFolderContents, validatePath } from "./actions";
import ItemsLayout from "./components/itemsLayout";
import { Suspense } from "react";

export default async function Dashboard() {
  const { contents } = await listFolderContents([]);
  const { valid, type } = await validatePath(["/"]);

  return (
    <main>
      <Suspense
        fallback={
          <div className="flex flex-wrap w-full gap-4">
            {new Array(9).fill(0).map((_, index) => (
              <Skeleton className="w-xs h-[70px] rounded-xl" key={index} />
            ))}
          </div>
        }
      >
        <ItemsLayout contents={contents} location={[]} valid={valid} type={type} />
      </Suspense>
    </main>
  );
} //test
