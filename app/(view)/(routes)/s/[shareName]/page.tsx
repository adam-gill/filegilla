import { getPublicFileResponse } from "@/app/api/getPublicFile/route";
import FileViewer from "@/components/fileViewer";
import axios from "axios";
import { Metadata } from "next";
import { getFileSize } from "./actions";

type props = {
  params: Promise<{ shareName: string }>;
};

export async function generateMetadata({ params }: props): Promise<Metadata> {
  const shareName = (await params).shareName;
  const fileSize = await getFileSize(shareName);

  // Use your environment variable or fallback to localhost
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  console.log(baseUrl);

  return {
    title: `${decodeURIComponent(shareName)} - FileGilla`,
    icons: "/logoFav.png",
    openGraph: {
      title: `${decodeURIComponent(shareName)} - FileGilla`,
      description: fileSize,
      images: ['/ogLogo.png'],
    },
    metadataBase: new URL(baseUrl),
  };
}

export default async function Viewer(props: {
  params: Promise<{ shareName: string }>;
}) {
  const params = await props.params;
  let data: getPublicFileResponse;

  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/getPublicFile`,
      {
        params: {
          shareName: params.shareName,
        },
      }
    );

    data = response.data;
  } catch (error: any) {
    if (error.status && error.status === 404) {
      data = {
        status: 404,
      };
    } else {
      data = {
        status: 500,
      };
    }
  }

  return (
    <>
      <FileViewer fileName={params.shareName} publicFileData={data} />
    </>
  );
}
