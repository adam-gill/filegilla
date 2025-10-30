import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import type { share } from "@prisma/client";
import { HeadObjectCommand } from "@aws-sdk/client-s3";
import { getScopedS3Client } from "@/lib/aws/actions";
import { createFullPreviewUrl } from "@/lib/helpers";

export interface Posts extends share {
  previewUrl?: string;
  isFgDoc?: boolean;
}

const S3_PUBLIC_BUCKET_NAME = process.env.S3_PUBLIC_BUCKET_NAME!;

const getKeyFromUrl = (s3Url: string): string => {
  const parts = s3Url.split("/");
  return parts.slice(3).join("/");
};

export const fetchPosts = async (): Promise<{
  success: boolean;
  message: string;
  posts?: share[];
}> => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return { success: false, message: "user is not authenticated." };
  }

  try {
    const userId = session.user.id;
    const s3Client = await getScopedS3Client(userId);

    const posts = await prisma.share.findMany({
      where: {
        user: {
          id: userId,
        },
      },
      orderBy: {
        views: "desc",
      },
    });

    const postsWithMetaData: Posts[] = await Promise.all(
      posts.map(async (post) => {
        const headCommand = new HeadObjectCommand({
          Bucket: S3_PUBLIC_BUCKET_NAME,
          Key: getKeyFromUrl(post.s3Url),
        });

        const headResponse = await s3Client.send(headCommand);
        const metadata = headResponse.Metadata;
        const previewKey = metadata?.["previewkey"];
        const isFgDoc = metadata?.["customtag"] === "filegilla document";
        const previewUrl = createFullPreviewUrl(S3_PUBLIC_BUCKET_NAME, previewKey);

        return {
          ...post,
          previewUrl,
          isFgDoc,
        };
      })
    );

    return {
      success: true,
      message: "posts fetched successfully",
      posts: postsWithMetaData,
    };
  } catch (error) {
    console.error("Error fetching posts:", error);
    return {
      success: false,
      message: "An error occurred while fetching posts.",
    };
  }
};
