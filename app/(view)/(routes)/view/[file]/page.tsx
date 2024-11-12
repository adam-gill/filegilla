"use client";

import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/useAuth";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;



const baseUrl = "https://filegillablobs.blob.core.windows.net/";

export default function FileViewer({
  params,
}: {
  params: { fileName: string };
}) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1);
  const { session } = useAuth();

  const fileType = params.fileName?.split(".").pop()?.toLowerCase();
  const fileUrl = baseUrl + session?.user.id + params?.fileName;

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  const nextPage = () => {
    if (pageNumber < (numPages || 0)) {
      setPageNumber(pageNumber + 1);
    }
  };

  const prevPage = () => {
    if (pageNumber > 1) {
      setPageNumber(pageNumber - 1);
    }
  };

  const zoomIn = () => setScale(scale + 0.1);
  const zoomOut = () => setScale(Math.max(0.1, scale - 0.1));

  const renderFileContent = () => {
    switch (fileType) {
      case "pdf":
        return (
          <Document file={fileUrl} onLoadSuccess={onDocumentLoadSuccess}>
            <Page pageNumber={pageNumber} scale={scale} />
          </Document>
        );
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return (
          <img
            src={fileUrl}
            alt={params.fileName}
            style={{ transform: `scale(${scale})` }}
          />
        );
      case "mp4":
      case "webm":
      case "ogg":
        return (
          <video src={fileUrl} controls style={{ width: `${scale * 100}%` }} />
        );
      default:
        return <p>Unsupported file type</p>;
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4 flex space-x-2">
        <Button onClick={prevPage} disabled={pageNumber <= 1}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button onClick={nextPage} disabled={pageNumber >= (numPages || 0)}>
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button onClick={zoomIn}>
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button onClick={zoomOut}>
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button asChild>
          <a href={fileUrl} download={params.fileName}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </a>
        </Button>
      </div>
      <div className="border rounded-lg p-4 max-w-full overflow-auto">
        {renderFileContent()}
      </div>
      {fileType === "pdf" && (
        <p className="mt-2">
          Page {pageNumber} of {numPages}
        </p>
      )}
    </div>
  );
}

// const View = ({ params }: { params: { file: string } }) => {
