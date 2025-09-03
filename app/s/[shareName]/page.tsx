import { Metadata } from "next";
import { getSharedFile } from "../actions";
import { Suspense } from "react";
import SharedFileViewer from "../components/sharedFileViewer";
import { Skeleton } from "@/components/ui/skeleton";

interface ShareViewerProps {
  params: Promise<{ shareName: string }>;
}

export async function generateMetadata({
  params,
}: ShareViewerProps): Promise<Metadata> {
  const shareName = (await params).shareName;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return {
    title: `${decodeURIComponent(shareName)} - filegilla`,
    icons: "/logoFav.png",
    openGraph: {
      title: `${decodeURIComponent(shareName)} - filegilla`,
      description: `user shared file - ${shareName}`,
      images: ["/ogLogo.png"],
    },
    metadataBase: new URL(baseUrl),
  };
}

const LoadingScreen = () => {
  return (
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
  );
};

export default async function ShareViewer({ params }: ShareViewerProps) {
  const shareName = (await params).shareName;
  const { file } = await getSharedFile(shareName);
  console.log(file);

  return (
    <main>
      <Suspense fallback={<LoadingScreen />}>
        {file && <SharedFileViewer file={file} shareName={shareName} />}
      </Suspense>

      {!file && (
        <div className="min-h-[70vh] w-full flex items-center justify-center text-center">
          <div className="text-2xl font-medium">{`404 - '${shareName}' not found`}</div>
        </div>
      )}
    </main>
  );
}
