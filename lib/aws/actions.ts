"use server";

import { S3Client } from "@aws-sdk/client-s3";
import { AssumeRoleCommand, STSClient } from "@aws-sdk/client-sts";

const S3_ACCESS_ROLE_ARN = process.env.S3_ACCESS_ROLE_ARN!;
const AWS_REGION = process.env.AWS_REGION!;

export const getScopedS3Client = async (userId: string): Promise<S3Client> => {
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