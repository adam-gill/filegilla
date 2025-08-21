import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { STSClient, AssumeRoleCommand } from "@aws-sdk/client-sts";
import {
  S3Client,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

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

const createS3Key = (
  userId: string,
  location: string[],
  fileName: string
): string => {
  const parts = ["private", userId, ...location, fileName];
  const cleanPath = parts.filter((part) => part.trim() !== "").join("/");
  return cleanPath;
};

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "User is not authenticated." },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const body = await request.json();
    const { files, location } = body;

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, message: "No files provided." },
        { status: 400 }
      );
    }

    const s3Client = await getScopedS3Client(userId);
    const presignedUrls: { fileName: string; url: string; key: string }[] = [];

    for (const file of files) {
      try {
        // Create the S3 key for this file
        const fileKey = createS3Key(userId, location, file.name);
        
        const uploadCommand = new PutObjectCommand({
          Bucket: S3_BUCKET_NAME,
          Key: fileKey,
          ContentType: file.type || 'application/octet-stream',
        });

        // Generate presigned URL (valid for 15 minutes)
        const presignedUrl = await getSignedUrl(s3Client, uploadCommand, {
          expiresIn: 900, // 15 minutes
        });

        presignedUrls.push({
          fileName: file.name,
          url: presignedUrl,
          key: fileKey,
        });
      } catch (error) {
        console.error(`Failed to generate presigned URL for ${file.name}:`, error);
        return NextResponse.json(
          { success: false, message: `Failed to prepare upload for ${file.name}` },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      presignedUrls,
      message: `Generated ${presignedUrls.length} presigned URL${presignedUrls.length > 1 ? 's' : ''}.`
    });

  } catch (error) {
    console.error(`Error generating presigned URLs: ${error}`);
    return NextResponse.json(
      { success: false, message: `Error preparing upload: ${error}` },
      { status: 500 }
    );
  }
}
