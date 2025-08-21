"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { STSClient, AssumeRoleCommand } from "@aws-sdk/client-sts";
import {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  DeleteObjectCommand,
  DeleteObjectsCommand,
} from "@aws-sdk/client-s3";

const S3_ACCESS_ROLE_ARN = process.env.S3_ACCESS_ROLE_ARN!;
const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME!;
const AWS_REGION = process.env.AWS_REGION!;

const getUserId = async (): Promise<string | null> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      throw new Error("User must be authenticated to make service calls.");
    }

    return session.user.id;
  } catch (error) {
    console.log("Error fetching userId on the server", error);
    return null;
  }
};

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

const createS3Key = (
  userId: string,
  location: string[],
  folderName?: string
): string => {
  const parts = ["private", userId, ...location];
  if (folderName) {
    parts.push(folderName);
  }

  const cleanPath = parts.filter((part) => part.trim() !== "").join("/");
  return cleanPath.endsWith("/") ? cleanPath : cleanPath + "/";
};

export const folderNameExists = async (
  folderName: string,
  location: string[]
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
  location: string[]
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

export const deleteItem = async (
  type: "file" | "folder",
  itemName: string,
  location: string[]
): Promise<{ success: boolean; message: string }> => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return { success: false, message: "User is not authenticated." };
  }
  const userId = session.user.id;

  if (!itemName || itemName.includes("/")) {
    return { success: false, message: "Invalid item name provided." };
  }

  try {
    const s3Client = await getScopedS3Client(userId);

    if (type === "file") {
      // Delete a single file
      const fileKey = createS3Key(userId, location, itemName).slice(0, -1); // Remove trailing slash for files

      try {
        const deleteCommand = new DeleteObjectCommand({
          Bucket: S3_BUCKET_NAME,
          Key: fileKey,
        });
        await s3Client.send(deleteCommand);

        return {
          success: true,
          message: `Successfully deleted the file '${itemName}'.`,
        };
      } catch (error: any) {
        if (error.name === "NoSuchKey") {
          return { success: false, message: `File '${itemName}' not found.` };
        }
        throw error;
      }
    } else {
      // Delete a folder and all its contents
      const folderPrefix = createS3Key(userId, location, itemName);

      // List all objects with this prefix
      const listCommand = new ListObjectsV2Command({
        Bucket: S3_BUCKET_NAME,
        Prefix: folderPrefix,
      });

      const listedObjects = await s3Client.send(listCommand);

      if (!listedObjects.Contents || listedObjects.Contents.length === 0) {
        // Try to delete the folder marker itself
        try {
          const deleteCommand = new DeleteObjectCommand({
            Bucket: S3_BUCKET_NAME,
            Key: folderPrefix,
          });
          await s3Client.send(deleteCommand);
        } catch (error: any) {
          if (error.name === "NoSuchKey") {
            return {
              success: false,
              message: `Folder '${itemName}' not found.`,
            };
          }
          throw error;
        }
      } else {
        // Delete all objects in the folder
        const objectsToDelete = listedObjects.Contents.map((object) => ({
          Key: object.Key!,
        }));

        // Handle large folders by deleting in batches of 1000
        for (let i = 0; i < objectsToDelete.length; i += 1000) {
          const batch = objectsToDelete.slice(i, i + 1000);

          const deleteCommand = new DeleteObjectsCommand({
            Bucket: S3_BUCKET_NAME,
            Delete: {
              Objects: batch,
              Quiet: false,
            },
          });

          const deleteResult = await s3Client.send(deleteCommand);

          if (deleteResult.Errors && deleteResult.Errors.length > 0) {
            console.error(
              "Some objects failed to delete:",
              deleteResult.Errors
            );
            return {
              success: false,
              message: `Some items in folder '${itemName}' could not be deleted.`,
            };
          }
        }
      }

      return {
        success: true,
        message: `Successfully deleted the folder '${itemName}' and all its contents.`,
      };
    }
  } catch (error) {
    console.error(`Error deleting the ${type} '${itemName}':`, error);
    return {
      success: false,
      message:
        `Error when deleting ${type}: ` +
        (error instanceof Error ? error.message : error),
    };
  }
};

export const validatePath = async (
  location: string[]
): Promise<{ valid: boolean; type: "folder" | "file" | null }> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    const userId = session?.user.id;

    if (!userId) {
      throw new Error("User not authenticated");
    }

    const key = createS3Key(userId, location).slice(0, -1);
    const s3Client = await getScopedS3Client(userId);

    try {
      const headCommand = new HeadObjectCommand({
        Bucket: S3_BUCKET_NAME,
        Key: key,
      });

      await s3Client.send(headCommand);

      return {
        valid: true,
        type: "file",
      };
    } catch (error: any) {
      if (
        error.name === "NotFound" ||
        error.$metadata?.httpStatusCode === 404
      ) {
        try {
          const folderPrefix = key.endsWith("/") ? key : key + "/";

          const listCommand = new ListObjectsV2Command({
            Bucket: S3_BUCKET_NAME,
            Prefix: folderPrefix,
            MaxKeys: 1,
            Delimiter: "/",
          });

          const response = await s3Client.send(listCommand);

          const hasFiles = response.Contents && response.Contents.length > 0;
          const hasSubfolders =
            response.CommonPrefixes && response.CommonPrefixes.length > 0;

          if (hasFiles || hasSubfolders) {
            return {
              valid: true,
              type: "folder",
            };
          }

          try {
            const folderMarkerCommand = new HeadObjectCommand({
              Bucket: S3_BUCKET_NAME,
              Key: folderPrefix,
            });

            await s3Client.send(folderMarkerCommand);

            return {
              valid: true,
              type: "folder",
            };
          } catch (markerError) {
            console.log("No folder marker, continue to return invalid");
          }
        } catch (listError) {
          console.log(
            "Error listing objects for folder validation:",
            listError
          );
        }
      } else {
        console.log("Error during HeadObject:", error);
      }
    }

    return {
      valid: false,
      type: null,
    };
  } catch (error) {
    console.log("Error trying to validate path. Error: ", error);
    return {
      valid: false,
      type: null,
    };
  }
};

// Type for folder contents
export interface FolderItem {
  name: string;
  type: "file" | "folder";
  size?: number;
  lastModified?: Date;
  path: string;
  etag?: string;
}

export const listFolderContents = async (
  location: string[]
): Promise<{ success: boolean; contents: FolderItem[]; message: string }> => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const userId = session?.user.id;

  if (!userId) {
    return {
      success: false,
      contents: [],
      message: "User is not authenticated.",
    };
  }

  const key = createS3Key(userId, location);

  try {
    const s3Client = await getScopedS3Client(userId);

    const command = new ListObjectsV2Command({
      Bucket: S3_BUCKET_NAME,
      Prefix: key,
      Delimiter: "/",
    });

    const response = await s3Client.send(command);

    const contents: FolderItem[] = [];

    // Add folders (CommonPrefixes)
    if (response.CommonPrefixes) {
      for (const prefix of response.CommonPrefixes) {
        if (prefix.Prefix) {
          const folderName = prefix.Prefix.replace(key, "").replace("/", "");
          contents.push({
            name: folderName,
            type: "folder",
            path: prefix.Prefix,
          });
        }
      }
    }

    // Add files (Contents)
    if (response.Contents) {
      for (const object of response.Contents) {
        if (object.Key && object.Key !== key) {
          const fileName = object.Key.replace(key, "");
          if (fileName && !fileName.includes("/")) {
            contents.push({
              name: fileName,
              type: "file",
              size: object.Size,
              lastModified: object.LastModified,
              path: object.Key,
              etag: object.ETag,
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
      message: "An error occurred while listing folder contents.",
    };
  }
};
