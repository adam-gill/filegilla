import { Skeleton } from "@/components/ui/skeleton";
import { listFolderContents, validatePath } from "./actions";
import ItemsLayout from "./components/itemsLayout";
import { Suspense } from "react";
import Navigator from "./components/navigator";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

async function DashboardContent() {
  const { contents } = await listFolderContents([]);
  const { valid, type } = await validatePath(["/"]);

  return (
    <ItemsLayout contents={contents} location={[]} valid={valid} type={type} />
  );
}

export default function Dashboard() {
  return (
    <main>
      <Suspense
        fallback={
          <div>
            <div className="flex w-full justify-between items-center ">
              <Navigator location={[]} />
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
                <Skeleton className="w-xs h-[366px] rounded-xl" key={index} />
              ))}
            </div>
          </div>
        }
      >
        <DashboardContent />
      </Suspense>
    </main>
  );
}
