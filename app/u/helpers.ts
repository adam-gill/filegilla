import { FileType } from "./types";

export const getFileType = (fileName: string): FileType => {
    const extension = fileName.toLowerCase().split(".").pop();
  
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
    if (["doc", "docx"].includes(extension || "")) {
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