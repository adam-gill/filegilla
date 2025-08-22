export interface FileMetadata {
  size?: number;
  lastModified?: Date;
  etag?: string;
  fileType?: string;
}

export interface FolderItem {
  name: string;
  type: "file" | "folder";
  size?: number;
  lastModified?: Date;
  path: string;
  etag?: string;
  fileType?: string;
}

export interface FileData {
    name: string;
    path: string;
    url?: string;
    metadata: FileMetadata;
}
