declare module "filegilla" {
  interface file {
    name: string;
    sizeInBytes: number;
    lastModified: string;
    blobUrl: string;
    md5hash: string;
  }

  interface listResponse {
    success: boolean;
    message: string;
    files: file[];
  }

  interface getFileResponse {
    success: boolean;
    message: string;
    file: file;
    sasToken: string;
  }

  interface getFileRequest {
    userId: string;
    fileName: string;
  }

  interface getSasTokenResponse {
    success: boolean;
    message: string;
    sasToken: {
      user_id: string;
      sas_token: string;
      start_time: string;
      end_time: string;
    };
  }
}
