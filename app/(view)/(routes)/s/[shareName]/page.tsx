import { getPublicFileResponse } from "@/app/api/getPublicFile/route";
import FileViewer from "@/components/fileViewer";
import axios from "axios";
import { Metadata } from "next";

type props = {
    params: Promise<{ shareName: string }>;
  };


export async function generateMetadata({ params }: props): Promise<Metadata> {
    const shareName = (await params).shareName;
    return {
      title: `${decodeURIComponent(shareName)} - FileGilla`,
      icons: "/logoFav.png",
    };
  }

  export default async function Viewer(props: { params: Promise<{ shareName: string }> }) {
    const params = await props.params;

    console.log(`${process.env.NEXT_PUBLIC_APP_URL}/api/getPublicFile`)
    const response = await axios.get(`${process.env.NEXT_PUBLIC_APP_URL}/api/getPublicFile`, {
        params: {
            shareName: params.shareName
        }
    });

    const data = response.data as getPublicFileResponse
    return (
      <>
          <FileViewer fileName={params.shareName} publicFileData={data} />
      </>
    );
  }