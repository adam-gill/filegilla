"use server";

import { FolderItem } from "@/app/u/types";
import { getScopedS3Client } from "@/lib/aws/actions";
import { createPublicFileName } from "@/lib/aws/helpers";
import { createFullPreviewUrl } from "@/lib/helpers";
import { prisma } from "@/lib/prisma";
import { GetObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const S3_PUBLIC_BUCKET_NAME = process.env.S3_PUBLIC_BUCKET_NAME!;

export const getPublicS3Key = async (shareName: string) => {
  const share = await prisma.share.findFirst({
    where: {
      shareName: shareName,
    },
  });

  if (!share) {
    throw new Error("getPublicS3Key: share not found");
  }

  if (share.s3Url) {
    const key = new URL(share.s3Url).pathname.substring(1);
    return key;
  }
};

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
      const key = await getPublicS3Key(shareName);

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
  try {
    const key = await getPublicS3Key(shareName);

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
    console.log(`Error fetching file at error: ${error}`);
    return {
      success: false,
      message: `Error fetching file: ${error}`,
    };
  }
};

export const getOgData = async (
  shareName: string
): Promise<{
  success: boolean;
  username?: string;
  imgUrl?: string;
  views?: number;
}> => {
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
      const fullUrl = createFullPreviewUrl(
        S3_PUBLIC_BUCKET_NAME,
        share.previewKey
      );
      return {
        success: true,
        username: share.user.username,
        imgUrl: fullUrl,
        views: Number(share.views),
      };
    } else if (share?.views && share.user?.username) {
      return {
        success: true,
        username: share.user.username,
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

export const incrementShareViews = async (
  shareName: string
): Promise<{ success: boolean; message?: string, views?: number }> => {
  try {
    if (!shareName) {
      return { success: false, message: "No share name provided." };
    }

    const shareObject = await prisma.share.findUnique({
      where: {
        shareName: shareName,
      },
    });

    if (!shareObject) {
      return { success: false, message: "Share not found." };
    }

    const updatedViews = Number(shareObject.views) + 1;
    await prisma.share.update({
      where: {
        shareName: shareName,
      },
      data: {
        views: updatedViews,
      },
    });

    console.log(
      `Views incremented successfully. ${shareName} now has ${updatedViews} views.`
    );
    return {
      success: true,
      message: `Views incremented successfully. ${shareName} now has ${updatedViews} views.`,
      views: Number(updatedViews - 1),
    };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Failed to increment views." };
  }
};
