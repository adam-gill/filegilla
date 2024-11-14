"use client";

import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/useAuth";
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = 'node_modules/pdfjs-dist/build/pdf.worker.js';

const baseUrl = "https://filegillablobs.blob.core.windows.net/";

export default function FileViewer({
  params,
}: {
  params: { fileName: string };
}) {
  const [scale, setScale] = useState(1);
  const [pageNumber, setPageNumber] = useState(1);
  const [numPages, setNumPages] = useState<number | null>(null);
  const { session } = useAuth();

  const fileType = params.fileName?.split(".").pop()?.toLowerCase();
  let fileUrl: string | undefined = undefined;
  if (session?.user?.id && params?.fileName) {
    fileUrl = baseUrl + "user-" + session?.user?.id + "/" + params?.fileName;
  }

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const prevPage = () => {
    setPageNumber((prev) => Math.max(1, prev - 1));
  };

  const nextPage = () => {
    setPageNumber((prev) => Math.min(numPages || prev, prev + 1));
  };

  const zoomIn = () => setScale(scale + 0.1);
  const zoomOut = () => setScale(Math.max(0.1, scale - 0.1));

  const renderFileContent = () => {
    switch (fileType) {
      case "pdf":
        return (
          <Document
            file={fileUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            className="flex justify-center"
          >
            <Page
              pageNumber={pageNumber}
              scale={scale}
              className="shadow-lg"
              renderTextLayer={true}
              renderAnnotationLayer={true}
            />
          </Document>
        );
      case "doc":
      case "docx":
        return (
          <iframe
            src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl || '')}`}
            style={{
              width: '100%',
              height: '800px',
              border: 'none',
              transform: `scale(${scale})`,
              transformOrigin: 'top center'
            }}
            title="Document Viewer"
          />
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
      case "mov":
        return (
          <video src={fileUrl} controls style={{ width: `${scale * 100}%` }} />
        );
      default:
        return <p>Unsupported file type</p>;
    }
  };

  return (
    <div className="flex flex-col items-center w-full">
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
        {fileUrl && (
          <>
            <Button asChild>
              <a href={fileUrl} download={params.fileName}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </a>
            </Button>
          </>
        )}
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