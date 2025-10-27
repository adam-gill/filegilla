"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import {
  PutObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  CopyObjectCommand,
  GetObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { FileMetadata, FolderItem, ShareItemProps } from "./types";
import { getScopedS3Client } from "@/lib/aws/actions";
import { createPrivateS3Key, createPublicS3Key } from "@/lib/aws/helpers";
import { prisma } from "@/lib/prisma";
import { addCopyToFileName, getFileExtension, randomId } from "@/lib/helpers";
import { createHTMLDocument } from "@/app/u/helpers";

const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME!;
const S3_PUBLIC_BUCKET_NAME = process.env.S3_PUBLIC_BUCKET_NAME!;

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

    const key = createPrivateS3Key(userId, location, folderName, true);

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
    return { success: false, message: "user is not authenticated." };
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
    const key = createPrivateS3Key(userId, location, folderName, true);

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
    return { success: false, message: "user is not authenticated." };
  }
  const userId = session.user.id;

  if (!itemName || itemName.includes("/")) {
    return { success: false, message: "invalid item name provided." };
  }

  try {
    const s3Client = await getScopedS3Client(userId);

    if (type === "file") {
      // Delete a single file
      const fileKey = createPrivateS3Key(userId, location, itemName);

      try {
        const headCommand = new HeadObjectCommand({
          Bucket: S3_BUCKET_NAME,
          Key: fileKey,
        });

        const headResponse = await s3Client.send(headCommand);

        const metadata = headResponse.Metadata;
        const previewKey = metadata?.["previewkey"];

        if (previewKey) {
          const deletePreviewCommand = new DeleteObjectCommand({
            Bucket: S3_BUCKET_NAME,
            Key: previewKey,
          });
          await s3Client.send(deletePreviewCommand);
          console.log(`preview deleted (${previewKey})`);
        }

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
      const folderPrefix = createPrivateS3Key(userId, location, itemName, true);

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

          for (let j = 0; j < batch.length; j++) {
            const object = batch[j];
            const headCommand = new HeadObjectCommand({
              Bucket: S3_BUCKET_NAME,
              Key: object.Key,
            });

            const headResponse = await s3Client.send(headCommand);

            const metadata = headResponse.Metadata;
            const previewKey = metadata?.["previewkey"];

            if (previewKey) {
              const deletePreviewCommand = new DeleteObjectCommand({
                Bucket: S3_BUCKET_NAME,
                Key: previewKey,
              });
              await s3Client.send(deletePreviewCommand);
              console.log(`preview deleted (${previewKey})`);
            }
          }

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

export const renameItem = async (
  type: "file" | "folder",
  oldName: string,
  newName: string,
  location: string[]
): Promise<{ success: boolean; message: string }> => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return { success: false, message: "user is not authenticated." };
  }
  const userId = session.user.id;

  try {
    const s3Client = await getScopedS3Client(userId);

    if (type === "file") {
      // Preserve original file extension
      const lastDotIndex = oldName.lastIndexOf(".");
      const oldExtension = lastDotIndex > 0 ? oldName.slice(lastDotIndex) : "";
      const newBaseName = newName.includes(".")
        ? newName.slice(0, newName.lastIndexOf("."))
        : newName;
      const finalNewName = `${newBaseName}${oldExtension}`;

      const oldKey = createPrivateS3Key(userId, location, oldName);
      const newKey = createPrivateS3Key(userId, location, finalNewName);

      if (oldKey === newKey) {
        return { success: true, message: "No changes detected." };
      }

      // Copy then delete original
      await s3Client.send(
        new CopyObjectCommand({
          Bucket: S3_BUCKET_NAME,
          CopySource: `${S3_BUCKET_NAME}/${encodeURI(oldKey)}`,
          Key: newKey,
        })
      );

      await s3Client.send(
        new DeleteObjectCommand({ Bucket: S3_BUCKET_NAME, Key: oldKey })
      );

      return { success: true, message: "Successfully renamed file." };
    } else {
      // Folder rename: recursively copy all objects from old prefix to new prefix, then delete old ones
      const oldPrefix = createPrivateS3Key(userId, location, oldName, true);
      const newPrefix = createPrivateS3Key(userId, location, newName, true);

      if (oldPrefix === newPrefix) {
        return { success: true, message: "No changes detected." };
      }

      let continuationToken: string | undefined = undefined;
      const keysToDelete: { Key: string }[] = [];

      do {
        const listResp: Awaited<
          ReturnType<typeof s3Client.send>
        > extends infer R
          ? R extends {
              Contents?: any[];
              IsTruncated?: boolean;
              NextContinuationToken?: string;
            }
            ? R
            : any
          : any = await s3Client.send(
          new ListObjectsV2Command({
            Bucket: S3_BUCKET_NAME,
            Prefix: oldPrefix,
            ContinuationToken: continuationToken,
          })
        );

        const contents = listResp.Contents || [];
        for (const obj of contents) {
          if (!obj.Key) continue;
          const newKey = obj.Key.replace(oldPrefix, newPrefix);

          await s3Client.send(
            new CopyObjectCommand({
              Bucket: S3_BUCKET_NAME,
              CopySource: `${S3_BUCKET_NAME}/${encodeURI(obj.Key)}`,
              Key: newKey,
            })
          );

          keysToDelete.push({ Key: obj.Key });
        }

        continuationToken = listResp.IsTruncated
          ? listResp.NextContinuationToken
          : undefined;
      } while (continuationToken);

      // Delete old objects in batches of 1000
      for (let i = 0; i < keysToDelete.length; i += 1000) {
        const chunk = keysToDelete.slice(i, i + 1000);
        await s3Client.send(
          new DeleteObjectsCommand({
            Bucket: S3_BUCKET_NAME,
            Delete: { Objects: chunk, Quiet: true },
          })
        );
      }

      return { success: true, message: `Successfully renamed folder.` };
    }
  } catch (error) {
    if (type === "file") {
      console.log(`Error renaming file '${oldName}'. ${error}`);
      return {
        success: false,
        message: `Error renaming file '${oldName}'. ${error}`,
      };
    } else {
      console.log(`Error renaming folder '${oldName}'. ${error}`);
      return {
        success: false,
        message: `Error renaming folder '${oldName}'. ${error}`,
      };
    }
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

    const key = createPrivateS3Key(userId, location);
    const s3Client = await getScopedS3Client(userId);

    try {
      const headCommand = new HeadObjectCommand({
        Bucket: S3_BUCKET_NAME,
        Key: key,
      });

      const res = await s3Client.send(headCommand);

      if (res.ContentLength === 0) {
        return {
          valid: true,
          type: "folder",
        };
      }

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
            console.log(
              "No folder marker, continue to return invalid",
              markerError
            );
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

export const getFileMetadata = async (
  key: string,
  s3Client: S3Client
): Promise<{ isFgDoc: boolean; previewUrl?: string }> => {
  if (!key) {
    return { isFgDoc: false };
  }

  try {
    let isFgDoc = false;
    let previewUrl = "";

    const headCommand = new HeadObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: key,
    });

    const headResponse = await s3Client.send(headCommand);
    const metadata = headResponse.Metadata;

    if (!metadata) {
      return { isFgDoc: false };
    }

    if (
      "customtag" in metadata &&
      metadata["customtag"] === "filegilla document"
    ) {
      isFgDoc = true;
    }

    if ("previewkey" in metadata && metadata["previewkey"]) {
      const previewKey = metadata["previewkey"];

      const urlCommand = new GetObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: previewKey,
      });

      previewUrl = await getSignedUrl(s3Client, urlCommand, {
        expiresIn: 3600,
      });
    }

    return { isFgDoc, previewUrl };
  } catch (error) {
    console.error("error checking metadata for key: ", key, error);
    return { isFgDoc: false };
  }
};

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
      message: "user is not authenticated.",
    };
  }

  const key = createPrivateS3Key(userId, location, undefined, true);

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

          const { isFgDoc, previewUrl } = await getFileMetadata(
            object.Key,
            s3Client
          );

          if (fileName && !fileName.includes("/")) {
            contents.push({
              name: fileName,
              type: "file",
              size: object.Size,
              lastModified: object.LastModified,
              path: object.Key,
              etag: object.ETag,
              isFgDoc: isFgDoc,
              previewUrl: previewUrl,
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

export const getFile = async (
  location: string[]
): Promise<{
  success: boolean;
  message: string;
  url?: string;
  fileMetadata?: FileMetadata;
}> => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const userId = session?.user.id;

  if (!userId) {
    return {
      success: false,
      message: "user is not authenticated.",
    };
  }
  const key = createPrivateS3Key(userId, location);

  try {
    const s3Client = await getScopedS3Client(userId);

    const headCommand = new HeadObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
    });
    const metadata = await s3Client.send(headCommand);

    const extraMetadata = metadata.Metadata;

    const isFgDoc =
      extraMetadata &&
      "customtag" in extraMetadata &&
      extraMetadata["customtag"] === "filegilla document";

    const urlCommand = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
    });

    const fileMetadata: FileMetadata = {
      etag: metadata.ETag,
      fileType: metadata.ContentType,
      lastModified: metadata.LastModified,
      size: metadata.ContentLength,
      isFgDoc: isFgDoc,
    };

    const url = await getSignedUrl(s3Client, urlCommand, { expiresIn: 3600 });

    return {
      success: true,
      message: "successfully fetched resource url",
      url: url,
      fileMetadata: fileMetadata,
    };
  } catch (error) {
    console.log(`Error fetching file at location '${key}', error: ${error}`);
    return {
      success: false,
      message: `Error fetching file: ${error}`,
    };
  }
};

export const getDownloadUrl = async (
  location: string[]
): Promise<{
  success: boolean;
  message: string;
  url?: string;
}> => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const userId = session?.user.id;

  if (!userId) {
    return {
      success: false,
      message: "user is not authenticated.",
    };
  }

  const key = createPrivateS3Key(userId, location);

  try {
    const s3Client = await getScopedS3Client(userId);

    const urlCommand = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      ResponseContentDisposition: `attachment; filename="${
        location[location.length - 1]
      }"`,
      ResponseContentType: "application/octet-stream",
    });

    const url = await getSignedUrl(s3Client, urlCommand, { expiresIn: 3600 });

    return {
      success: true,
      message: "successfully fetched resource's download url",
      url: url,
    };
  } catch (error) {
    console.log(`Error fetching file at location '${key}', error: ${error}`);
    return {
      success: false,
      message: `Error fetching file: ${error}`,
    };
  }
};

const removeUserIdFromPreviewKey = (key: string): string => {
  try {
    const parts = key.split('/');
    
    if (parts.length !== 3) {
      console.error(`Invalid key format: expected 3 segments, got ${parts.length}`);
      return "";
    }
    
    return `${parts[0]}/${parts[2]}`;
  } catch (error) {
    console.error(`Failed to process key: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return "";
  }
};

export const shareItem = async ({
  itemName,
  location,
  shareName,
  sourceEtag,
}: ShareItemProps): Promise<{
  success: boolean;
  message: string;
  shareUrl?: string;
}> => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return { success: false, message: "user is not authenticated." };
  }

  const userId = session.user.id;
  const s3Client = await getScopedS3Client(userId);

  try {

    const checkShareItem = await prisma.share.findFirst({
      where: {
        shareName: shareName,
      },
    });

    if (checkShareItem) {
      return {
        success: false,
        message: "share name already exists. please choose a different name.",
      };
    }

    const privateKey = createPrivateS3Key(userId, location, itemName);
    const publicKey = createPublicS3Key(itemName, shareName);

    try {
      await s3Client.send(
        new HeadObjectCommand({
          Bucket: S3_PUBLIC_BUCKET_NAME,
          Key: publicKey,
        })
      );
      return {
        success: false,
        message: "share name already exists. please choose a different name.",
      };
    } catch (error: any) {
      if (error.name !== "NotFound") {
        throw error;
      }
    }

    const headCommand = new HeadObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: privateKey,
    });

    const headResponse = await s3Client.send(headCommand);

    const metadata = headResponse.Metadata;
    const previewKey = metadata?.["previewkey"];
    const newPreviewKey = removeUserIdFromPreviewKey(previewKey || "");
    const isFgDoc = metadata?.["customtag"] === "filegilla document";

    const copyCommand = new CopyObjectCommand({
      Bucket: S3_PUBLIC_BUCKET_NAME,
      Key: publicKey,
      CopySource: `${S3_BUCKET_NAME}/${privateKey}`,
      MetadataDirective: "REPLACE",
      Metadata: {
        "previewkey": newPreviewKey,
        "customtag": isFgDoc ? "filegilla document" : "",
        "ogwidth": "1200",
        "ogheight": "630",
      },
    });

    await s3Client.send(copyCommand);

    if (previewKey && newPreviewKey) {
      const copyPreviewCommand = new CopyObjectCommand({
        Bucket: S3_PUBLIC_BUCKET_NAME,
        Key: newPreviewKey,
        CopySource: `${S3_BUCKET_NAME}/${previewKey}`,
        MetadataDirective: "REPLACE",
        Metadata: {
          "previewkey": newPreviewKey,
        },
      });

      await s3Client.send(copyPreviewCommand);
      console.log("preview copied to public bucket: ", newPreviewKey);
    }

    const shareUrl = `https://${S3_PUBLIC_BUCKET_NAME}.s3.amazonaws.com/${publicKey}`;

    await prisma.share.create({
      data: {
        shareName: shareName,
        id: crypto.randomUUID(),
        itemName: itemName,
        s3Url: shareUrl,
        ownerId: userId,
        itemType: "file",
        sourceEtag: sourceEtag,
        views: 0,
        previewKey: newPreviewKey || null,
      },
    });

    return {
      success: true,
      message: `file successfully shared as ${shareName}`,
      shareUrl: shareUrl,
    };
  } catch (error) {
    console.error("Error sharing file:", error);
    return {
      success: false,
      message: `failed to share file: ${
        error instanceof Error ? error.message : "unknown error"
      }`,
    };
  }
};

export const deleteShareItem = async (
  itemName: string,
  shareName: string,
  sourceEtag: string
) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return { success: false, message: "user is not authenticated." };
  }

  const userId = session.user.id;
  const s3Client = await getScopedS3Client(userId);

  try {
    const response = await prisma.share.findFirst({
      where: {
        sourceEtag: sourceEtag,
        ownerId: userId,
      },
    });

    if (response) {
      await prisma.share.delete({
        where: {
          shareName: shareName,
          sourceEtag: sourceEtag,
          ownerId: userId,
        },
      });

      const key = createPublicS3Key(itemName, shareName);

      const headCommand = new HeadObjectCommand({
          Bucket: S3_PUBLIC_BUCKET_NAME,
          Key: key,
        });

        const headResponse = await s3Client.send(headCommand);

        const metadata = headResponse.Metadata;
        const previewKey = metadata?.["previewkey"];

        if (previewKey) {
          const deletePreviewCommand = new DeleteObjectCommand({
            Bucket: S3_PUBLIC_BUCKET_NAME,
            Key: previewKey,
          });
          await s3Client.send(deletePreviewCommand);
          console.log(`preview deleted (${previewKey})`);
        }

      const deleteCommand = new DeleteObjectCommand({
        Bucket: S3_PUBLIC_BUCKET_NAME,
        Key: key,
      });

      await s3Client.send(deleteCommand);

      return {
        success: true,
        message: `successfully deleted the share '/s/${shareName}'`,
      };
    } else {
      return {
        success: false,
        message: `could not find file share for ${shareName}`,
      };
    }
  } catch (error) {
    console.error(`Error deleting ${shareName}: ${error}`);
    return { success: false, message: `unknown error deleting file ${error}` };
  }
};

export const checkShareItem = async (
  itemName: string,
  sourceEtag: string
): Promise<{
  success: boolean;
  message: string;
  shareUrl?: string;
  shareName?: string;
}> => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return { success: false, message: "user is not authenticated." };
  }

  const userId = session.user.id;

  try {
    const response = await prisma.share.findFirst({
      where: {
        sourceEtag: sourceEtag,
        ownerId: userId,
      },
    });

    if (response?.s3Url && response.shareName) {
      return {
        success: true,
        message: `${itemName} shareUrl found`,
        shareUrl: response.s3Url,
        shareName: response.shareName,
      };
    } else {
      return { success: true, message: `${itemName} is not shared` };
    }
  } catch (error) {
    return {
      success: false,
      message: `unknown error checking share status: ${error}`,
    };
  }
};

export const copyAndPasteItem = async (
  itemName: string,
  location: string[]
): Promise<{
  success: boolean;
  message: string;
}> => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return { success: false, message: "user is not authenticated." };
  }

  const userId = session.user.id;
  const s3Client = await getScopedS3Client(userId);

  try {
    const newName = addCopyToFileName(itemName);

    const sourceKey = createPrivateS3Key(userId, location, itemName);
    const destinationKey = createPrivateS3Key(userId, location, newName);

    const copyCommand = new CopyObjectCommand({
      Bucket: S3_BUCKET_NAME,
      CopySource: `${S3_BUCKET_NAME}/${sourceKey}`,
      Key: destinationKey,
    });

    await s3Client.send(copyCommand);

    return {
      success: true,
      message: `successfully copied ${itemName}`,
    };
  } catch (error) {
    return {
      success: false,
      message: `unknown error checking share status: ${error}`,
    };
  }
};

export const listMoveFolders = async (
  location: string[]
): Promise<{
  success: boolean;
  message: string;
  folders?: string[];
}> => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return { success: false, message: "user is not authenticated." };
  }

  const userId = session.user.id;
  const key = createPrivateS3Key(userId, location, undefined, true);

  try {
    const s3Client = await getScopedS3Client(userId);

    const command = new ListObjectsV2Command({
      Bucket: S3_BUCKET_NAME,
      Prefix: key,
      Delimiter: "/",
    });

    const response = await s3Client.send(command);

    const folders: string[] = [];

    // Add folders (CommonPrefixes)
    if (response.CommonPrefixes) {
      for (const prefix of response.CommonPrefixes) {
        if (prefix.Prefix) {
          const folderName = prefix.Prefix.replace(key, "").replace("/", "");
          folders.push(folderName);
        }
      }
    }

    return {
      success: true,
      folders,
      message: `found ${folders.length} items in folder.`,
    };
  } catch (error) {
    console.error("Failed to list folder contents:", error);
    return {
      success: false,
      message: `unknown error occurred listing folders ${error}`,
    };
  }
};

interface MoveItemsProps {
  sourceLocation: string[];
  destinationLocation: string[];
  itemName: string;
  itemType: "file" | "folder";
}

export const moveItem = async ({
  sourceLocation,
  destinationLocation,
  itemName,
  itemType,
}: MoveItemsProps): Promise<{ success: boolean; message: string }> => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return { success: false, message: "user is not authenticated." };
  }

  const userId = session.user.id;
  const s3Client = await getScopedS3Client(userId);

  try {
    if (itemType === "file") {
      const sourceKey = createPrivateS3Key(
        userId,
        sourceLocation,
        itemName,
        false
      );
      const destinationKey = createPrivateS3Key(
        userId,
        destinationLocation,
        itemName,
        false
      );

      if (sourceKey === destinationKey) {
        return { success: true, message: "no changes detected." };
      }

      await s3Client.send(
        new CopyObjectCommand({
          Bucket: S3_BUCKET_NAME,
          CopySource: `${S3_BUCKET_NAME}/${encodeURI(sourceKey)}`,
          Key: destinationKey,
        })
      );

      await s3Client.send(
        new DeleteObjectCommand({
          Bucket: S3_BUCKET_NAME,
          Key: sourceKey,
        })
      );

      return {
        success: true,
        message: `successfully moved file '${itemName}' to new location.`,
      };
    } else {
      // Folder move: recursively copy all objects from source to destination, then delete source
      const sourcePrefix = createPrivateS3Key(
        userId,
        sourceLocation,
        itemName,
        true
      );
      const destinationPrefix = createPrivateS3Key(
        userId,
        destinationLocation,
        itemName,
        true
      );

      if (sourcePrefix === destinationPrefix) {
        return { success: true, message: "No changes detected." };
      }

      let continuationToken: string | undefined = undefined;
      const keysToDelete: { Key: string }[] = [];

      do {
        const listResp: Awaited<
          ReturnType<typeof s3Client.send>
        > extends infer R
          ? R extends {
              Contents?: any[];
              IsTruncated?: boolean;
              NextContinuationToken?: string;
            }
            ? R
            : any
          : any = await s3Client.send(
          new ListObjectsV2Command({
            Bucket: S3_BUCKET_NAME,
            Prefix: sourcePrefix,
            ContinuationToken: continuationToken,
          })
        );

        const contents = listResp.Contents || [];
        for (const obj of contents) {
          if (!obj.Key) continue;
          const newKey = obj.Key.replace(sourcePrefix, destinationPrefix);

          await s3Client.send(
            new CopyObjectCommand({
              Bucket: S3_BUCKET_NAME,
              CopySource: `${S3_BUCKET_NAME}/${encodeURI(obj.Key)}`,
              Key: newKey,
            })
          );

          keysToDelete.push({ Key: obj.Key });
        }

        continuationToken = listResp.IsTruncated
          ? listResp.NextContinuationToken
          : undefined;
      } while (continuationToken);

      for (let i = 0; i < keysToDelete.length; i += 1000) {
        const chunk = keysToDelete.slice(i, i + 1000);
        await s3Client.send(
          new DeleteObjectsCommand({
            Bucket: S3_BUCKET_NAME,
            Delete: { Objects: chunk, Quiet: true },
          })
        );
      }

      return {
        success: true,
        message: `successfully moved folder '${itemName}' to new location.`,
      };
    }
  } catch (error) {
    console.error(`error moving ${itemType} '${itemName}':`, error);
    return {
      success: false,
      message: `error moving ${itemType} '${itemName}': ${
        error instanceof Error ? error.message : "unknown error"
      }`,
    };
  }
};

export const createDocument = async (
  location: string[]
): Promise<{
  success: boolean;
  message: string;
  fileName?: string;
  etag?: string;
}> => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return { success: false, message: "user is not authenticated." };
  }

  const userId = session.user.id;
  const s3Client = await getScopedS3Client(userId);

  try {
    const { fileName, fileBuffer, key } = createHTMLDocument(userId, location);
    const uploadCommand = new PutObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: key,
      Body: fileBuffer,
      ContentType: "text/html",
      Metadata: {
        id: randomId(10),
        createdBy: "filegilla",
        customTag: "filegilla document",
      },
    });

    const response = await s3Client.send(uploadCommand);

    return {
      success: true,
      message: "successfully created new document",
      fileName: fileName,
      etag: response.ETag,
    };
  } catch (error) {
    console.error(`error trying to create filegilla document: ${error}`);
    return {
      success: false,
      message: `error trying to create document ${error}`,
    };
  }
};

export const getHTMLContent = async (
  location: string[],
  isPublic: boolean,
  fileName?: string,
  shareName?: string
): Promise<{ success: boolean; message: string; html?: string }> => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!isPublic && !session?.user?.id) {
    return { success: false, message: "user is not authenticated." };
  }

  const id = session?.user.id ?? "";

  const userId = isPublic ? "public" : id;

  const s3Client = await getScopedS3Client(userId);
  const key =
    isPublic && fileName && shareName
      ? createPublicS3Key(fileName, shareName)
      : createPrivateS3Key(userId, location, undefined, false);

  try {
    const getCommand = new GetObjectCommand({
      Bucket: isPublic ? S3_PUBLIC_BUCKET_NAME : S3_BUCKET_NAME,
      Key: key,
    });

    const response = await s3Client.send(getCommand);

    const htmlContent = await response.Body?.transformToString();

    return {
      success: true,
      message: "successfully fetched HTML content",
      html: htmlContent,
    };
  } catch (error) {
    console.error(`error getting HTML content for key ${key}, error: ${error}`);
    return { success: false, message: `Failed to fetch HTML content ${error}` };
  }
};

const createPreviewKey = (
  previewId: string,
  fileName: string,
  userId: string
) => {
  return `preview/${userId}/${previewId}${getFileExtension(fileName)}`;
};

export const setFilePreviewBackend = async (
  fileData: ArrayBuffer,
  fileName: string,
  contentType: string,
  previewId: string
): Promise<{ success: boolean; message: string; url?: string }> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return { success: false, message: "user is not authenticated." };
    }

    const userId = session.user.id;

    const previewKey = createPreviewKey(previewId, fileName, userId);
    const s3Client = await getScopedS3Client(userId);

    const uploadCommand = new PutObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: previewKey,
      Body: Buffer.from(fileData),
      ContentType: contentType || "application/octet-stream",
    });

    await s3Client.send(uploadCommand);

    const urlCommand = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: previewKey,
    });

    const previewUrl = await getSignedUrl(s3Client, urlCommand, {
      expiresIn: 3600,
    });

    return {
      success: true,
      message: "successfully set file preview",
      url: previewUrl,
    };
  } catch (error) {
    console.error(`error setting file preview. error: ${error}`);
    return { success: false, message: `Failed to set file preview ${error}` };
  }
};
