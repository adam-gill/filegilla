import { randomId } from "@/lib/helpers";
import { FileType } from "./types";
import { createPrivateS3Key } from "@/lib/aws/helpers";

export const getFileType = (fileName: string, isFgDoc: boolean | undefined): FileType => {
  const extension = fileName.toLowerCase().split(".").pop();

  if (isFgDoc) {
    return "filegilla";
  }

  if (
    ["jpg", "jpeg", "png", "gif", "bmp", "svg", "webp", "ico"].includes(
      extension || ""
    )
  ) {
    return "image";
  }
  if (
    ["mp4", "avi", "mov", "wmv", "flv", "webm", "mkv", "m4v"].includes(
      extension || ""
    )
  ) {
    return "video";
  }
  if (
    ["mp3", "wav", "flac", "aac", "ogg", "wma", "m4a"].includes(extension || "")
  ) {
    return "audio";
  }
  if (["pdf"].includes(extension || "")) {
    return "pdf";
  }
  if (["doc", "docx", "ppt", "pptx"].includes(extension || "")) {
    return "document";
  }
  if (["txt", "rtf", "odt", "md"].includes(extension || "")) {
    return "text";
  }
  if (["zip", "rar", "7z", "tar", "gz", "bz2"].includes(extension || "")) {
    return "archive";
  }
  return "unknown";
};

export const filegillaHTMLId = "65cc0429cc303dc822e2ac038e7bc391";

export const createHTMLDocument = (
  userId: string,
  location: string[]
): { fileName: string; fileBuffer: Buffer; key: string } => {
  const html = `<div data-filegilla="${filegillaHTMLId}"></div>`;

  const fileBuffer = Buffer.from(html, "utf-8");

  const fileName = `untitled document - ${randomId(4)}`;

  const key = createPrivateS3Key(userId, location, fileName, false);

  return { fileName, fileBuffer, key };
};

export const isFileTypeSupported = (fileType: string): boolean => {
  /* supported file types: 
    - any popular image files (jpg, png, gif, bmp, svg, webp, ico)
    - popular video formats (mp4, avi, mov, wmv, flv, webm, mkv, m4v)
    - pdf 
  */
  
  const supportedTypes = [
    // Images
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/bmp',
    'image/svg+xml',
    'image/webp',
    'image/x-icon',
    'image/vnd.microsoft.icon',
    // Videos
    'video/mp4',
    'video/x-msvideo', // avi
    'video/quicktime', // mov
    'video/x-ms-wmv', // wmv
    'video/x-flv', // flv
    'video/webm',
    'video/x-matroska', // mkv
    'video/x-m4v', // m4v
    // PDF
    'application/pdf'
  ];
  
  return supportedTypes.includes(fileType.toLowerCase());
};
