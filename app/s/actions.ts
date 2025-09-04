"use server";

import { FolderItem } from "@/app/u/types";
import { getScopedS3Client } from "@/lib/aws/actions";
import { createPublicFileName, createPublicS3Key } from "@/lib/aws/helpers";
import { prisma } from "@/lib/prisma";
import { GetObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const getSharedFile = async (
  shareName: string
): Promise<{ success: boolean; message: string; file?: FolderItem }> => {
  try {
    const response = await prisma.share.findFirst({
      where: {
        shareName: shareName,
      },
    });

    if (response?.s3Url && response.sourceEtag) {
      const s3Client = await getScopedS3Client("public");
      const S3_PUBLIC_BUCKET_NAME = process.env.S3_PUBLIC_BUCKET_NAME!;
      const key = createPublicS3Key(response.itemName, shareName);

      const headCommand = new HeadObjectCommand({
        Bucket: S3_PUBLIC_BUCKET_NAME,
        Key: key,
      });

      const s3Response = await s3Client.send(headCommand);

      if (
        s3Response.ContentLength &&
        s3Response.ContentType &&
        s3Response.LastModified
      ) {
        return {
          success: true,
          message: `successfully retrieved shared file ${shareName}`,
          file: {
            name: response.itemName,
            path: "",
            type: "file",
            etag: response.sourceEtag,
            fileType: s3Response.ContentType,
            lastModified: s3Response.LastModified,
            size: s3Response.ContentLength,
            url: response.s3Url,
            ownerId: response.ownerId ?? undefined,
          },
        };
      } else {
        return {
          success: false,
          message: `error fetching ${shareName} metadata`,
        };
      }
    } else {
      return {
        success: false,
        message: `${shareName} was not found`,
      };
    }
  } catch (error) {
    console.log(`error getting shared file: ${error}`);
    return {
      success: false,
      message: `unknown error fetching shared file ${shareName}`,
    };
  }
};

export const getPublicDownloadUrl = async (
  itemName: string,
  shareName: string
): Promise<{
  success: boolean;
  message: string;
  url?: string;
}> => {
  const key = createPublicS3Key(itemName, shareName);

  try {
    const s3Client = await getScopedS3Client("public");
    const fileName = createPublicFileName(itemName, shareName);

    const urlCommand = new GetObjectCommand({
      Bucket: process.env.S3_PUBLIC_BUCKET_NAME,
      Key: key,
      ResponseContentDisposition: `attachment; filename="${fileName}"`,
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

export const getOgData = async (shareName: string): Promise<{ success: boolean, username?: string, imgUrl?: string }> => {
  try {
    const share = await prisma.share.findFirst({
      where: {
        shareName: shareName,
      },
      select: {
        itemName: true,
        s3Url: true,
        user: {
          select: {
            username: true,
          },
        },
      },
    });

    if (!share || !share.s3Url || !share.user?.username) {
      return { success: false };
    }

    const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp'];
    const isImage = imageExtensions.some(ext => share.itemName.toLowerCase().endsWith(ext));

    if (isImage) {
      return { success: true, username: share.user.username, imgUrl: share.s3Url };
    }

    return { success: false };

  } catch (error) {
    console.error(`Failed to fetch OG data for '${shareName}'. Error: ${error}`);
    return { success: false };
  }
};