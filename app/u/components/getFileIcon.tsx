import { Images, Video, Music, Archive, FileText, File } from "lucide-react";

interface props {
  fileName: string;
}

export default function GetFileIcon({ fileName }: props) {
  const extension = fileName.toLowerCase().split(".").pop();

  // Image files
  if (
    ["jpg", "jpeg", "png", "gif", "bmp", "svg", "webp", "ico"].includes(
      extension || ""
    )
  ) {
    return <Images className="w-5 h-5 text-blue-400" />;
  }

  // Video files
  if (
    ["mp4", "avi", "mov", "wmv", "flv", "webm", "mkv", "m4v"].includes(
      extension || ""
    )
  ) {
    return <Video className="w-5 h-5 text-purple-400" />;
  }

  // Audio files
  if (
    ["mp3", "wav", "flac", "aac", "ogg", "wma", "m4a"].includes(extension || "")
  ) {
    return <Music className="w-5 h-5 text-green-400" />;
  }

  // Archive files
  if (["zip", "rar", "7z", "tar", "gz", "bz2"].includes(extension || "")) {
    return <Archive className="w-5 h-5 text-orange-400" />;
  }

  // Document files
  if (["pdf", "doc", "docx", "txt", "rtf", "odt"].includes(extension || "")) {
    return <FileText className="w-5 h-5 text-red-400" />;
  }

  // Default file icon
  return <File className="w-5 h-5 text-gray-400" />;
}
