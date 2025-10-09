import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import {
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getScopedS3Client } from "@/lib/aws/actions";
import { createPrivateS3Key } from "@/lib/aws/helpers";

const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME!;

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
    const { files, location, isFolder } = body;

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
        // For folder uploads, use the webkitRelativePath to maintain folder structure
        const fileName = isFolder && file.webkitRelativePath 
          ? file.webkitRelativePath 
          : file.name;
        const fileKey = createPrivateS3Key(userId, location, fileName);
        
        const previewId = crypto.randomUUID();
        
        const uploadCommand = new PutObjectCommand({
          Bucket: S3_BUCKET_NAME,
          Key: fileKey,
          ContentType: file.type || 'application/octet-stream',
          Metadata: {
            preview: previewId
          }
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
    console.error(`error generating presigned URL(s): ${error}`);
    return NextResponse.json(
      { success: false, message: `error preparing upload: ${error}` },
      { status: 500 }
    );
  }
}
