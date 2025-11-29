import { prisma } from "@/lib/prisma";
import { share } from "@/prisma/generated/client";
import { HeadObjectCommand } from "@aws-sdk/client-s3";
import { getScopedS3Client } from "@/lib/aws/actions";
import { createFullPreviewUrl } from "@/lib/helpers";
import { unstable_noStore as noStore } from "next/cache";

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

  noStore();

  try {
    const s3Client = await getScopedS3Client("public");

    const posts = await prisma.share.findMany({
      where: {
        isFeatured: true,
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
