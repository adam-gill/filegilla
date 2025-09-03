"use server";

import { getScopedS3Client } from "@/lib/aws/actions";
import { prisma } from "@/lib/prisma";
import {
  PutObjectCommand,
  ListObjectsV2Command,
  DeleteObjectsCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";

const S3_PUBLIC_BUCKET_NAME = process.env.S3_PUBLIC_BUCKET_NAME!;

export const editUsername = async (
  newUsername: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const hdrs = await headers();
    const session = await auth.api.getSession({
      headers: hdrs,
    });

    if (!session?.user?.id) {
      return { success: false, message: "User is not authenticated." };
    }

    const usernameMatches = await prisma.user.findMany({
      where: { username: newUsername },
    });

    if (usernameMatches.length > 0) {
      return {
        success: false,
        message: `username '${newUsername}' is already in use.`,
      };
    }

    await auth.api.updateUser({
      headers: hdrs,
      body: {
        username: newUsername,
      },
    });

    return {
      success: true,
      message: `successfully changed username to ${newUsername}`,
    };
  } catch (error) {
    console.log("error editing username: ", error);
    return {
      success: false,
      message: "failed to edit username: unknown error",
    };
  }
};

// Generate a presigned URL for uploading the user's avatar.
// The file will be stored at: private/{userId}/avatars/{userId}/avatar.{ext}
// Only common image content types should be used (validated on client side).
export const changeAvatar = async (
  userId: string,
  fileName: string,
  contentType: string
): Promise<{
  success: boolean;
  message: string;
  url?: string;
  key?: string;
  avatarUrl?: string;
}> => {
  try {
    if (!userId) {
      return { success: false, message: "User ID is required" };
    }

    // Normalize extension to ensure avatar.{ext}
    const dot = fileName.lastIndexOf(".");
    const ext = dot > -1 ? fileName.slice(dot + 1).toLowerCase() : "";
    if (!ext) {
      return { success: false, message: "File extension is required" };
    }

    const allowed = new Set(["png", "jpg", "jpeg", "webp", "gif"]);
    if (!allowed.has(ext)) {
      return { success: false, message: "Unsupported image format" };
    }

    const folderPrefix = `avatars/${userId}/`;
    const key = `${folderPrefix}avatar.${ext}`;

    const s3Client = await getScopedS3Client(userId);

    // Ensure only one file exists in the avatar folder: delete existing objects in that folder
    const listResp: any = await s3Client.send(
      new ListObjectsV2Command({
        Bucket: S3_PUBLIC_BUCKET_NAME,
        Prefix: folderPrefix,
      })
    );

    const contents: { Key?: string }[] = (listResp.Contents || []) as {
      Key?: string;
    }[];
    const toDelete = contents
      .filter((o: { Key?: string }) => !!o.Key)
      .map((o: { Key?: string }) => ({ Key: o.Key as string }));

    if (toDelete.length > 0) {
      for (let i = 0; i < toDelete.length; i += 1000) {
        const chunk = toDelete.slice(i, i + 1000);
        await s3Client.send(
          new DeleteObjectsCommand({
            Bucket: S3_PUBLIC_BUCKET_NAME,
            Delete: { Objects: chunk, Quiet: true },
          })
        );
      }
    }

    const put = new PutObjectCommand({
      Bucket: S3_PUBLIC_BUCKET_NAME,
      Key: key,
      ContentType: contentType || "application/octet-stream",
    });

    const url = await getSignedUrl(s3Client, put, { expiresIn: 900 });

    const avatarUrl = `${process.env.S3_PUBLIC_BUCKET_URL}/${key}`;

    return {
      success: true,
      message: "Generated upload URL for avatar",
      url,
      key,
      avatarUrl,
    };
  } catch (error) {
    console.error("Error preparing avatar upload:", error);
    return { success: false, message: "Failed to prepare avatar upload" };
  }
};

/*

TODO - make alert dialog for deleting files

*/
