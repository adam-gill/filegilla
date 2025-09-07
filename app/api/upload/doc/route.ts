import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getScopedS3Client } from "@/lib/aws/actions";
import { createPrivateS3Key, createPublicS3Key } from "@/lib/aws/helpers";

const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME!;
const S3_PUBLIC_BUCKET_NAME = process.env.S3_PUBLIC_BUCKET_NAME!;

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
    const { fileLocation, isPublic, fileName, shareName } = body;

    if (!fileLocation || !fileName) {
      return NextResponse.json(
        {
          success: false,
          message: "file and/or fileLocation not provided",
        },
        { status: 400 }
      );
    }

    const s3Client = await getScopedS3Client(userId);
    const bucket = isPublic ? S3_PUBLIC_BUCKET_NAME : S3_BUCKET_NAME;
    const key = isPublic
      ? createPublicS3Key(fileName, shareName)
      : createPrivateS3Key(userId, fileLocation);

    const uploadCommand = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: "text/html",
    });

    const presignedUrl = await getSignedUrl(s3Client, uploadCommand, {
      expiresIn: 900,
    });

    return NextResponse.json({
      success: true,
      presignedUrl,
      message: "successfully generated presignedUrl for document sync",
    });
  } catch (error) {
    console.error(`error generating presigned URL(s): ${error}`);
    return NextResponse.json(
      { success: false, message: `error preparing upload: ${error}` },
      { status: 500 }
    );
  }
}
