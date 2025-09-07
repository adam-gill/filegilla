import {
  Image as ImageIcon,
  Video,
  Music,
  Archive,
  FileText,
  File,
} from "lucide-react";

interface props {
  fileName: string;
  isFgDoc: boolean | undefined;
}

interface GradientFilePenIconProps {
  className?: string;
}

export function GradientFilePenIcon({ className }: GradientFilePenIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="url(#gradientStroke)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <defs>
        <linearGradient id="gradientStroke" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f3f4f6" />
          <stop offset="50%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
      </defs>
      <path d="M12.5 22H18a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v9.5" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M13.378 15.626a1 1 0 1 0-3.004-3.004l-5.01 5.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z" />
    </svg>
  );
}

export default function GetFileIcon({ fileName, isFgDoc }: props) {
  const extension = fileName.toLowerCase().split(".").pop();

  // FileGilla documents
  if (isFgDoc) {
      return <GradientFilePenIcon className="w-5 h-5" />;
  }

  // Image files
  if (
    ["jpg", "jpeg", "png", "gif", "bmp", "svg", "webp", "ico"].includes(
      extension || ""
    )
  ) {
    return <ImageIcon className="w-5 h-5 text-blue-400" />;
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
