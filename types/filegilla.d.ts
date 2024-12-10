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

  interface checkPassAccResponse {
    success: boolean;
    message: string;
    phash: null | string;
  }

  interface createPasswordBody {
    userId: string;
    password: string;
  }

  interface password {
    userId: string;
    timeCreated: string;
    cipher: string;
    title: string;
    url: string;
    description: string;
  }

  interface addPasswordBody {
    userId: string;
    data: {
      cipher: string;
      title: string;
      url: string;
      description?: string | undefined;
    };
  }

  interface password {
    cipher: string;
    service_url: string;
    service_description: string;
    time_created: string;
    title: string;
    user_id: string;
    password_id: number;
  }

  interface getPasswordsResponse {
    passwordObject: password[];
  }
}
