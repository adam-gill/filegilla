import { getScopedS3Client } from "@/lib/aws/actions";
import { randomId } from "@/lib/helpers";
import {
  CliOperationError,
  handleOperation,
  isCliNameTaken,
  authenticateApiKey,
} from "@/lib/cliUtils";
import { NextRequest, NextResponse } from "next/server";
import {
  CopyObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const S3_PUBLIC_BUCKET_NAME = process.env.S3_PUBLIC_BUCKET_NAME!;
const appUrl = process.env.NEXT_PUBLIC_APP_URL!;

export async function POST(
  req: NextRequest,
) {
  const formData = await req.formData();

  const apiKeyId = req.headers.get("x-api-key-id");
  const apiKeySecret = req.headers.get("x-api-key");

  const auth = await authenticateApiKey(apiKeySecret, apiKeyId);

  if (!auth.authenticated || !auth.apiKey.user) {
    return NextResponse.json(
      {
        success: false,
        error: "Unauthorized",
        message: "You are not authorized to access this resource.",
      },
      { status: 401 },
    );
  }

  const userId = auth.apiKey.user;

  const file = formData.get("file") as File | null;
  const text = formData.get("text") as string;
  const formIdValue = formData.get("id") as string;
  const id = formIdValue ? formIdValue : randomId();
  const overwrite = formData.get("overwrite") === "true";
  const key = formData.get("key") as string;
  const publicItem = formData.get("public") === "true";

  if (file && text) {
    return NextResponse.json(
      {
        success: false,
        error: "Bad Request",
        message:
          "You must choose either a file upload or text upload, not both.",
      },
      { status: 400 },
    );
  }

  if (!file && !text) {
    return NextResponse.json(
      {
        success: false,
        error: "Bad Request",
        message: "You must provide a file or text to upload.",
      },
      { status: 400 },
    );
  }

  const idIsTaken = await isCliNameTaken(id);

  if (idIsTaken) {
    return NextResponse.json(
      {
        success: false,
        error: "Conflict",
        message: "That ID is already in use. Please choose another ID.",
      },
      { status: 409 },
    );
  }

  const isFile = file && file.size > 0;

  if (isFile) {
    const s3Client = await getScopedS3Client(userId);
    const s3Key = `cli/${userId}/${file.name}`;
    let fileAlreadyExists = false;

    // check if the file already exists
    try {
      await s3Client.send(
        new HeadObjectCommand({
          Bucket: S3_PUBLIC_BUCKET_NAME,
          Key: s3Key,
        }),
      );
      fileAlreadyExists = true;

      if (!overwrite) {
        return NextResponse.json(
          {
            success: false,
            error: "Conflict",
            message:
              'A file with that name already exists. Use -F "overwrite=true" if you want to overwrite it.',
          },
          { status: 409 },
        );
      }
    } catch (error: any) {
      if (error.name !== "NotFound") {
        throw error;
      }
    }

    const backupKey = fileAlreadyExists
      ? `cli-backups/${userId}/${crypto.randomUUID()}`
      : undefined;
    let databaseRecordCreated = false;

    try {
      if (backupKey) {
        await s3Client.send(
          new CopyObjectCommand({
            Bucket: S3_PUBLIC_BUCKET_NAME,
            Key: backupKey,
            CopySource: encodeURIComponent(`${S3_PUBLIC_BUCKET_NAME}/${s3Key}`),
          }),
        );
      }

      const fileBuffer = Buffer.from(await file.arrayBuffer());

      await s3Client.send(
        new PutObjectCommand({
          Bucket: S3_PUBLIC_BUCKET_NAME,
          Key: s3Key,
          Body: fileBuffer,
          ContentType: file.type || "application/octet-stream",
        }),
      );

      await prisma.cliItem.create({
        data: {
          id,
          isFile: true,
          content: s3Key,
          ownerId: userId,
          publiclyViewable: publicItem
        },
      });
      databaseRecordCreated = true;

      if (backupKey) {
        await s3Client.send(
          new DeleteObjectCommand({
            Bucket: S3_PUBLIC_BUCKET_NAME,
            Key: backupKey,
          }),
        );
      }

      return NextResponse.json({
        success: true,
        message: `Successfully uploaded file, download it with a GET request to ${appUrl}/cli/${id}`,
      });
    } catch (error) {
      try {
        if (backupKey) {
          await s3Client.send(
            new CopyObjectCommand({
              Bucket: S3_PUBLIC_BUCKET_NAME,
              Key: s3Key,
              CopySource: encodeURIComponent(
                `${S3_PUBLIC_BUCKET_NAME}/${backupKey}`,
              ),
            }),
          );
          await s3Client.send(
            new DeleteObjectCommand({
              Bucket: S3_PUBLIC_BUCKET_NAME,
              Key: backupKey,
            }),
          );
        } else {
          await s3Client.send(
            new DeleteObjectCommand({
              Bucket: S3_PUBLIC_BUCKET_NAME,
              Key: s3Key,
            }),
          );
        }
      } catch (rollbackError) {
        console.error("CLI upload rollback failed:", rollbackError);
      }

      if (databaseRecordCreated) {
        await prisma.cliItem.delete({ where: { id } });
      }
      console.error("CLI upload failed:", error);

      return NextResponse.json(
        {
          success: false,
          error: "Upload Failed",
          message:
            "The file could not be uploaded and the operation was rolled back.",
        },
        { status: 500 },
      );
    }
  } else {
    try {
      const textToUpload =
        key && key.length > 0
          ? await handleOperation("encrypt", key, text)
          : text;
      await prisma.cliItem.create({
        data: {
          id,
          isFile: false,
          content: textToUpload,
          ownerId: userId,
          publiclyViewable: publicItem
        },
      });

      return NextResponse.json({
        success: true,
        message: `Successfully uploaded text, view it with a GET request to ${appUrl}/cli/${id}`,
      });
    } catch (error) {
      console.error("CLI text upload failed:", error);

      if (error instanceof CliOperationError) {
        return NextResponse.json(
          {
            success: false,
            error: error.code,
            message: error.message,
          },
          { status: 400 },
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: "Upload Failed",
          message: "The text could not be uploaded.",
        },
        { status: 500 },
      );
    }
  }
}
