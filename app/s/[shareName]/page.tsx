import { Metadata } from "next";
import { getOgData, getSharedFile } from "../actions";
import { Suspense } from "react";
import SharedFileViewer from "../components/sharedFileViewer";
import { Skeleton } from "@/components/ui/skeleton";
import { viewsText } from "@/lib/helpers";

interface ShareViewerProps {
  params: Promise<{ shareName: string }>;
}

export async function generateMetadata({
  params,
}: ShareViewerProps): Promise<Metadata> {
  const shareName = (await params).shareName;
  const { username, imgUrl, views } = await getOgData(shareName);

  const sharedBy = username
    ? `shared by ${username}`
    : `shared on filegilla`;

  const viewsLabel = viewsText(Number(views));
  const description = `${sharedBy}${viewsLabel ? ` | ${viewsLabel}` : ""}`;
  const image = imgUrl ? imgUrl : "/ogLogo.png";

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return {
    title: `${decodeURIComponent(shareName)} - filegilla`,
    icons: "/logoFav.png",
    description: description,
    openGraph: {
      title: `${decodeURIComponent(shareName)} - filegilla`,
      description: description,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
        },
      ],
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

async function ShareContent({ shareName }: { shareName: string }) {
  const { initialFile } = await getSharedFile(shareName);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
  const response = await fetch(`${baseUrl}/api/views`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ shareName: shareName }),
  });
  const data = await response.json();
  const views = data.views;

  if (!initialFile) {
    return (
      <div className="min-h-[70vh] w-full flex items-center justify-center text-center">
        <div className="text-2xl font-medium">{`404 - '${shareName}' not found`}</div>
      </div>
    );
  }

  return (
    <SharedFileViewer
      initialFile={initialFile}
      shareName={shareName}
      views={views}
    />
  );
}

export default async function ShareViewer({ params }: ShareViewerProps) {
  const shareName = (await params).shareName;

  return (
    <main>
      <Suspense fallback={<LoadingScreen />}>
        <ShareContent shareName={shareName} />
      </Suspense>
    </main>
  );
}
