import { getScopedS3Client } from "@/lib/aws/actions";
import {
  authenticateApiKey,
  authorizeCliItem,
  handleOperation,
  CliOperationError,
} from "@/lib/cliUtils";
import { NextRequest, NextResponse } from "next/server";
import { DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const S3_PUBLIC_BUCKET_NAME = process.env.S3_PUBLIC_BUCKET_NAME!;

const unauthorized = () =>
  NextResponse.json(
    {
      success: false,
      error: "Unauthorized",
      message: "You are not authorized to access this resource.",
    },
    { status: 401 },
  );

const notFound = () =>
  NextResponse.json(
    {
      success: false,
      error: "Not Found",
      message: "The requested cliItem does not exist.",
    },
    { status: 404 },
  );

const forbidden = () =>
  NextResponse.json(
    {
      success: false,
      error: "Forbidden",
      message: "You are not authorized to access this resource.",
    },
    { status: 403 },
  );

const authenticateAndAuthorize = async (req: NextRequest, id: string) => {
  const apiKeySecret = req.headers.get("x-api-key");

  const auth = await authenticateApiKey(apiKeySecret);

  if (!auth.authenticated) {
    return { ok: false as const, response: unauthorized() };
  }

  const userId = auth.userId;

  const authz = await authorizeCliItem(userId, id);

  if (!authz.found) {
    return { ok: false as const, response: notFound() };
  }

  if (!authz.authorized) {
    return { ok: false as const, response: forbidden() };
  }

  return { ok: true as const, userId, cliItem: authz.cliItem };
};

type AuthCheckResult =
  | { ok: true; userId: string; cliItem: NonNullable<Awaited<ReturnType<typeof prisma.cliItem.findUnique>>> }
  | { ok: false; response: NextResponse };

// Looks up the cliItem and decides whether the request is allowed to see it.
// public items are allowed for anyone; non-public items require auth + ownership.
export const authorizeGet = async (req: NextRequest, id: string): Promise<AuthCheckResult> => {
  const item = await prisma.cliItem.findUnique({ where: { id } });

  if (!item) {
    return { ok: false, response: notFound() };
  }

  if (item.publiclyViewable) {
    return { ok: true, userId: item.ownerId, cliItem: item };
  }

  const apiKeySecret = req.headers.get("x-api-key");

  const auth = await authenticateApiKey(apiKeySecret);

  if (!auth.authenticated) {
    return { ok: false, response: unauthorized() };
  }

  if (item.ownerId !== auth.userId) {
    return { ok: false, response: forbidden() };
  }

  return { ok: true, userId: auth.userId, cliItem: item };
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const result = await authorizeGet(req, id);
  if (!result.ok) {
    return result.response;
  }

  const { userId, cliItem } = result;

  if (!cliItem.isFile) {
    const key = req.nextUrl.searchParams.get("key");

    try {
      const content = key
        ? await handleOperation("decrypt", key, cliItem.content)
        : cliItem.content;

      return new NextResponse(content, {
        status: 200,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
        },
      });
    } catch (error) {
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
      throw error;
    }
  }

  const s3Client = await getScopedS3Client(userId);
  const s3Key = cliItem.content;

  let s3Response;
  try {
    s3Response = await s3Client.send(
      new GetObjectCommand({
        Bucket: S3_PUBLIC_BUCKET_NAME,
        Key: s3Key,
      }),
    );
  } catch (error: any) {
    if (error?.name === "NoSuchKey" || error?.$metadata?.httpStatusCode === 404) {
      return NextResponse.json(
        {
          success: false,
          error: "Not Found",
          message: "The file record exists but the underlying object is missing.",
        },
        { status: 404 },
      );
    }
    console.error("CLI file fetch failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Fetch Failed",
        message: "The file could not be fetched.",
      },
      { status: 500 },
    );
  }

  const filename = s3Key.split("/").pop() ?? "download";
  const contentType = s3Response.ContentType ?? "application/octet-stream";

  const headers = new Headers();
  headers.set("Content-Type", contentType);
  headers.set("Content-Disposition", `attachment; filename="${filename}"`);
  if (s3Response.ContentLength !== undefined) {
    headers.set("Content-Length", String(s3Response.ContentLength));
  }

  if (!s3Response.Body) {
    return NextResponse.json(
      {
        success: false,
        error: "Fetch Failed",
        message: "The file could not be fetched.",
      },
      { status: 500 },
    );
  }

  return new NextResponse(s3Response.Body as ReadableStream, {
    status: 200,
    headers,
  });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const result = await authenticateAndAuthorize(req, id);
  if (!result.ok) {
    return result.response;
  }

  const { userId, cliItem } = result;

  if (cliItem.isFile) {
    try {
      const s3Client = await getScopedS3Client(userId);
      await s3Client.send(
        new DeleteObjectCommand({
          Bucket: S3_PUBLIC_BUCKET_NAME,
          Key: cliItem.content,
        }),
      );
    } catch (error) {
      console.error("CLI file S3 delete failed:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Delete Failed",
          message: "The file could not be deleted from storage.",
        },
        { status: 500 },
      );
    }
  }

  try {
    await prisma.cliItem.delete({ where: { id: cliItem.id } });
  } catch (error) {
    console.error("CLI DB delete failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Delete Failed",
        message: "The cliItem record could not be deleted.",
      },
      { status: 500 },
    );
  }

  return NextResponse.json(
    {
      success: true,
      message: "Successfully deleted cliItem.",
    },
    { status: 200 },
  );
}
