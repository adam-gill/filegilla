"use client";

import { useEffect, useState, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export interface PDFViewerProps {
  viewUrl: string;
}

export default function PDFViewer({ viewUrl }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };

    updateWidth();

    const resizeObserver = new ResizeObserver(updateWidth);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  return (
    <div
      ref={containerRef}
      className="w-full rounded-lg border border-none h-full overflow-auto"
    >
      <Document
        file={viewUrl}
        onLoadSuccess={onDocumentLoadSuccess}
        loading={
          <div className="flex w-full h-full border-none aspect-auto-[0.7727272727] p-0 m-0 overflow-hidden skeleton animate-pulse-colors" />
        }
        error={
          <div style={{ padding: "20px", textAlign: "center", color: "#fff" }}>
            Failed to load PDF.
            <a
              href={viewUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#4a9eff", marginLeft: "5px" }}
            >
              Download instead
            </a>
          </div>
        }
      >
        {containerWidth > 0 &&
          Array.from(new Array(numPages), (_, index) => (
            <Page
              key={`page_${index + 1}`}
              pageNumber={index + 1}
              width={containerWidth}
              renderTextLayer={true}
              renderAnnotationLayer={true}
              className={"mb-4 max-md:mb-2"}
            />
          ))}
      </Document>
    </div>
  );
}
