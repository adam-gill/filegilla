export interface FileMetadata {
  size?: number;
  lastModified?: Date;
  etag?: string;
  fileType?: string;
  isFgDoc?: boolean;
}

export interface FolderItem {
  name: string;
  type: "file" | "folder";
  size?: number;
  lastModified?: Date;
  path: string;
  etag?: string;
  fileType?: string;
  url?: string;
  ownerId?: string;
  isFgDoc?: boolean;
}

export interface FileData {
  name: string;
  path: string;
  url?: string;
  metadata: FileMetadata;
}

export interface ShareItemProps {
  itemName: string;
  itemType: "file" | "folder";
  location: string[];
  shareName: string;
  sourceEtag?: string;
}

export type FileType =
  | "filegilla"
  | "image"
  | "video"
  | "audio"
  | "pdf"
  | "document"
  | "text"
  | "archive"
  | "unknown";
