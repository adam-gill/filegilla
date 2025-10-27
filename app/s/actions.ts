"use server";

import { FolderItem } from "@/app/u/types";
import { getScopedS3Client } from "@/lib/aws/actions";
import { createPublicFileName, createPublicS3Key } from "@/lib/aws/helpers";
import { prisma } from "@/lib/prisma";
import { GetObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const S3_PUBLIC_BUCKET_NAME = process.env.S3_PUBLIC_BUCKET_NAME!;

export const getSharedFile = async (
  shareName: string
): Promise<{ success: boolean; message: string; initialFile?: FolderItem }> => {
  try {
    const response = await prisma.share.findFirst({
      where: {
        shareName: shareName,
      },
    });

    if (response?.s3Url && response.sourceEtag) {
      const s3Client = await getScopedS3Client("public");
      const key = createPublicS3Key(response.itemName, shareName);

      const headCommand = new HeadObjectCommand({
        Bucket: S3_PUBLIC_BUCKET_NAME,
        Key: key,
      });

      const s3Response = await s3Client.send(headCommand);

      const metadata = s3Response.Metadata;

      const isFgDoc =
        metadata &&
        "customtag" in metadata &&
        metadata["customtag"] === "filegilla document";

      if (
        s3Response.ContentLength &&
        s3Response.ContentType &&
        s3Response.LastModified
      ) {
        return {
          success: true,
          message: `successfully retrieved shared file ${shareName}`,
          initialFile: {
            name: response.itemName,
            path: "",
            type: "file",
            etag: response.sourceEtag,
            fileType: s3Response.ContentType,
            lastModified: s3Response.LastModified,
            size: s3Response.ContentLength,
            url: response.s3Url,
            ownerId: response.ownerId ?? undefined,
            isFgDoc: isFgDoc,
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

export const getOgData = async (
  shareName: string
): Promise<{ success: boolean; username?: string; imgUrl?: string; views?: number }> => {
  try {
    const share = await prisma.share.findFirst({
      where: {
        shareName: shareName,
      },
      select: {
        itemName: true,
        previewKey: true,
        user: {
          select: {
            username: true,
          },
        },
        views: true,
      },
    });

    if (share?.previewKey && share?.user?.username) {
      const fullUrl = `https://${S3_PUBLIC_BUCKET_NAME}.s3.us-east-1.amazonaws.com/${share.previewKey}`;
      return {
        success: true,
        username: share.user.username,
        imgUrl: fullUrl,
        views: Number(share.views),
      };
    }

    return { success: false };
  } catch (error) {
    console.error(
      `Failed to fetch OG data for '${shareName}'. Error: ${error}`
    );
    return { success: false };
  }
};
