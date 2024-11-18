import FileViewer from "@/components/fileViewer";
import { Metadata } from "next";

type props = {
  params: Promise<{ fileName: string }>;
};

export async function generateMetadata({ params }: props): Promise<Metadata> {
  const fileName = (await params).fileName;
  return {
    title: `${decodeURIComponent(fileName)} - FileGilla`,
    icons: "/logoFav.png",
  };
}

export default function Viewer({ params }: { params: { fileName: string } }) {
  return (
    <>
        <FileViewer fileName={params.fileName} />
    </>
  );
}
