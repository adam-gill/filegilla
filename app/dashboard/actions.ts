"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import {
  STSClient,
  AssumeRoleCommand,
  AssumeRoleCommandOutput,
} from "@aws-sdk/client-sts";
import {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand,
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

export const folderNameExists = async (
  folderName: string
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
    const command = new HeadObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: `private/${userId}/${folderName}/`,
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
  folderName: string
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
    const nameExists = await folderNameExists(folderName);
    if (nameExists) {
      return {
        success: false,
        message: `Folder "${folderName}" already exists.`,
      };
    }

    const s3Client = await getScopedS3Client(userId);
    const command = new PutObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: `private/${userId}/${folderName}/`,
      Body: "",
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
