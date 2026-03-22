import { auth } from "@/lib/auth/auth";
import { getFileCategory } from "@/lib/helpers";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import { writeFile, unlink, readFile, mkdtemp, rmdir } from "fs/promises";
import { tmpdir } from "os";
import { join, extname } from "path";
import { Readable } from "stream";
import { getScopedS3Client } from "@/lib/aws/actions";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { previewId, fileName, filePath, fileType } = body;

    if (!previewId) {
      return NextResponse.json(
        { success: false, message: "No previewId provided." },
        { status: 400 },
      );
    }

    const session = await auth.api.getSession({ headers: await headers() });
    const userId = session?.user.id;
    const fullFilePath = filePath.replace("userId", userId);

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User is not authenticated." },
        { status: 401 },
      );
    }

    if (!fileName || !filePath || !fileType) {
      return NextResponse.json(
        { success: false, message: "Missing fileName, filePath, or fileType." },
        { status: 400 },
      );
    }

    console.log("starting preview generation for", {
      userId,
      fileName,
      fullFilePath,
      fileType,
    });

    const fileCategory = getFileCategory(fileType, fileName);

    if (!["image", "video", "pdf"].includes(fileCategory)) {
      return NextResponse.json(
        {
          success: false,
          message: `Unsupported file category: ${fileCategory}`,
        },
        { status: 400 },
      );
    }

    const s3Client = await getScopedS3Client(userId);
    const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME!;
    const previewKey = `preview/${userId}/${previewId}.png`;

    const { tmpFilePath, tmpDir } = await downloadToTemp(
      s3Client,
      S3_BUCKET_NAME,
      fullFilePath,
      fileName,
    );

    try {
      const previewBuffer = await generatePreview(tmpFilePath, fileCategory);
      const previewUrl = await uploadToS3(s3Client, S3_BUCKET_NAME, previewKey, previewBuffer);

      return NextResponse.json({ success: true, previewUrl });
    } finally {
      await unlink(tmpFilePath).catch(() => {});
      await rmdir(tmpDir).catch(() => {});
    }
  } catch (error) {
    console.error("Error generating preview:", error);
    return NextResponse.json(
      { success: false, message: "Error generating preview." },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// S3 helpers
// ---------------------------------------------------------------------------

async function downloadToTemp(
  s3Client: Awaited<ReturnType<typeof getScopedS3Client>>,
  bucket: string,
  key: string,
  fileName: string,
): Promise<{ tmpFilePath: string; tmpDir: string }> {
  const { Body } = await s3Client.send(
    new GetObjectCommand({ Bucket: bucket, Key: key }),
  );

  if (!Body) throw new Error("S3 returned an empty body.");

  const chunks: Buffer[] = [];
  for await (const chunk of Body as Readable) {
    chunks.push(Buffer.from(chunk));
  }

  const tmpDir = await mkdtemp(join(tmpdir(), "fg-preview-"));
  const tmpFilePath = join(tmpDir, `input-${Date.now()}${extname(fileName)}`);

  await writeFile(tmpFilePath, Buffer.concat(chunks));

  console.log("Downloaded file to temp path:", tmpFilePath);
  return { tmpFilePath, tmpDir };
}

async function uploadToS3(
  s3Client: Awaited<ReturnType<typeof getScopedS3Client>>,
  bucket: string,
  key: string,
  buffer: Uint8Array,
): Promise<string> {
  await s3Client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: Buffer.from(buffer),
      ContentType: "image/png",
    }),
  );

  const urlCommand = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  const previewUrl = await getSignedUrl(s3Client, urlCommand, {
    expiresIn: 3600,
  });

  return previewUrl;
}

// ---------------------------------------------------------------------------
// Preview generation
// ---------------------------------------------------------------------------

async function generatePreview(
  filePath: string,
  fileCategory: "image" | "video" | "pdf" | string,
): Promise<Uint8Array> {
  switch (fileCategory) {
    case "image":
      return processImage(filePath);
    case "video":
      return processVideo(filePath);
    case "pdf":
      return processPdf(filePath);
    default:
      throw new Error(`Unsupported category: ${fileCategory}`);
  }
}

async function processImage(filePath: string): Promise<Uint8Array> {
  return runCommand("magick", [
    filePath,
    "-resize",
    "1200x800>",
    "-quality",
    "85",
    "png:-",
  ]);
}

async function processVideo(filePath: string): Promise<Uint8Array> {
  console.log("Processing video for preview generation:", filePath);
  const outputPath = filePath.replace(/\.[^/.]+$/, "-preview.png");

  let duration = 0;
  try {
    const probe = await runCommand("ffprobe", [
      "-v",
      "error",
      "-show_entries",
      "format=duration",
      "-of",
      "default=noprint_wrappers=1:nokey=1",
      "-i",
      filePath,
    ]);
    duration = parseFloat(new TextDecoder().decode(probe).trim()) || 0;
  } catch {
    console.warn("ffprobe failed, defaulting seek to 0s.");
  }

  const seekTime = duration > 0 ? Math.min(3, duration * 0.08) : 0;

  await runCommand("ffmpeg", [
    "-ss",
    seekTime.toFixed(4),
    "-i",
    filePath,
    "-vframes",
    "1",
    "-vf",
    "scale=w=1200:h=630:force_original_aspect_ratio=decrease",
    "-pix_fmt",
    "yuv420p",
    outputPath,
  ]);

  try {
    return new Uint8Array(await readFile(outputPath));
  } finally {
    await unlink(outputPath).catch(() => {});
  }
}

async function processPdf(filePath: string): Promise<Uint8Array> {
  const result = await runCommand("magick", [
    `${filePath}[0]`,
    "-background",
    "white",
    "-alpha",
    "remove",
    "-alpha",
    "off",
    "-quality",
    "95",
    "-resize",
    "1200x630>",
    "png:-",
  ]);

  if (!result || result.length === 0) {
    throw new Error("ImageMagick produced empty output for PDF.");
  }

  return result;
}

// ---------------------------------------------------------------------------
// Process utility
// ---------------------------------------------------------------------------

function runCommand(cmd: string, args: string[]): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: ["ignore", "pipe", "pipe"] });
    const stdout: Buffer[] = [];
    const stderr: Buffer[] = [];

    child.stdout.on("data", (chunk: Buffer) => stdout.push(Buffer.from(chunk)));
    child.stderr.on("data", (chunk: Buffer) => stderr.push(Buffer.from(chunk)));

    child.on("close", (code) => {
      if (code !== 0) {
        return reject(
          new Error(
            `'${cmd}' exited with code ${code}. ${Buffer.concat(stderr).toString()}`,
          ),
        );
      }
      resolve(Buffer.concat(stdout));
    });

    child.on("error", reject);
  });
}
