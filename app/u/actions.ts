"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import {
  STSClient,
  AssumeRoleCommand,
} from "@aws-sdk/client-sts";
import {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";

const S3_ACCESS_ROLE_ARN = process.env.S3_ACCESS_ROLE_ARN!;
const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME!;
const AWS_REGION = process.env.AWS_REGION!;

const getScopedS3Client = async (userId: string): Promise<S3Client> => {
  const stsClient = new STSClient({ region: AWS_REGION });
  const assumeRoleCommand = new AssumeRoleCommand({
    RoleArn: S3_ACCESS_ROLE_ARN,
    RoleSessionName: `s3-access-${userId}`,
    Tags: [{ Key: "userId", Value: userId }],
    DurationSeconds: 900,
  });

  const assumedRole = await stsClient.send(assumeRoleCommand);

  if (!assumedRole.Credentials) {
    throw new Error("Failed to assume role, no credentials received.");
  }

  return new S3Client({
    region: AWS_REGION,
    credentials: {
      accessKeyId: assumedRole.Credentials.AccessKeyId!,
      secretAccessKey: assumedRole.Credentials.SecretAccessKey!,
      sessionToken: assumedRole.Credentials.SessionToken!,
    },
  });
};

const createS3Key = (userId: string, location: string[], folderName?: string): string => {
  const parts = ['private', userId, ...location];
  if (folderName) {
    parts.push(folderName);
  }
  
  const cleanPath = parts.filter(part => part.trim() !== '').join('/');
  return cleanPath.endsWith('/') ? cleanPath : cleanPath + '/';
};

export const folderNameExists = async (
  folderName: string,
  location: string[],
): Promise<boolean> => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return false;
  }
  const userId = session.user.id;

  try {
    const s3Client = await getScopedS3Client(userId);

    const key = createS3Key(userId, location, folderName);
    
    const command = new HeadObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
    return true;
  } catch (error: any) {
    if (error.name === "NotFound") {
      return false;
    }
    console.error("Error checking folder existence:", error);
    throw error;
  }
};


export const createFolder = async (
  folderName: string,
  location: string[],
): Promise<{ success: boolean; message: string }> => {

    const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return { success: false, message: "User is not authenticated." };
  }
  const userId = session.user.id;

  if (!folderName || folderName.includes("/")) {
    return { success: false, message: "Invalid folder name provided." };
  }

  try {
    const nameExists = await folderNameExists(folderName, location);
    if (nameExists) {
      return {
        success: false,
        message: `Folder "${folderName}" already exists.`,
      };
    }

    const s3Client = await getScopedS3Client(userId);
    const key = createS3Key(userId, location, folderName);
    
    const command = new PutObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: key,
      Body: Buffer.from(""),
    });

    await s3Client.send(command);

    return {
      success: true,
      message: `Folder "${folderName}" created successfully.`,
    };
  } catch (error) {
    console.error("Failed to create folder:", error);
    return { success: false, message: "An error occurred on the server." };
  }
};

// Type for folder contents
interface FolderItem {
  name: string;
  type: 'file' | 'folder';
  size?: number;
  lastModified?: Date;
  path: string;
  etag?: string;
}

export const listFolderContents = async (location: string[]): Promise<{ success: boolean, contents: FolderItem[], message: string }> => {

  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const userId = session?.user.id

  if (!userId) {
    return { success: false, contents: [], message: "User is not authenticated." };
  }

  const key = createS3Key(userId, location);
  
  try {
    const s3Client = await getScopedS3Client(userId);
    
    const command = new ListObjectsV2Command({
      Bucket: S3_BUCKET_NAME,
      Prefix: key,
      Delimiter: '/',
    });

    const response = await s3Client.send(command);
    
    const contents: FolderItem[] = [];
    
    // Add folders (CommonPrefixes)
    if (response.CommonPrefixes) {
      for (const prefix of response.CommonPrefixes) {
        if (prefix.Prefix) {
          const folderName = prefix.Prefix.replace(key, '').replace('/', '');
          contents.push({
            name: folderName,
            type: 'folder',
            path: prefix.Prefix,
          });
        }
      }
    }
    
    // Add files (Contents)
    if (response.Contents) {
      for (const object of response.Contents) {
        if (object.Key && object.Key !== key) {
          const fileName = object.Key.replace(key, '');
          if (fileName && !fileName.includes('/')) {
            contents.push({
              name: fileName,
              type: 'file',
              size: object.Size,
              lastModified: object.LastModified,
              path: object.Key,
              etag: object.ETag
            });
          }
        }
      }
    }
    
    return {
      success: true,
      contents,
      message: `Found ${contents.length} items in folder.`,
    };
  } catch (error) {
    console.error("Failed to list folder contents:", error);
    return { 
      success: false, 
      contents: [], 
      message: "An error occurred while listing folder contents." 
    };
  }
}
