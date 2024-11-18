declare module "filegilla" {
  interface file {
    name: string;
    sizeInBytes: number;
    lastModified: string;
    blobUrl: string;
    md5hash: string;
  }

  interface listResponse {
    success: boolean,
    message: string,
    files: file[],
  }

  interface getFileResponse {
    success: boolean,
    message: string,
    file: file,
  }

  interface getFileRequest {
    userId: string;
    fileName: string;
  }
}
