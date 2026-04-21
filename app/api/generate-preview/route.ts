import { auth } from "@/lib/auth/auth";
import { getFileCategory } from "@/lib/helpers";
import {
  GetObjectCommand,
  PutObjectCommand,
  HeadObjectCommand,
  CopyObjectCommand,
} from "@aws-sdk/client-s3";
import { headers } from "next/headers";
import { after, NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import { writeFile, unlink, readFile, mkdtemp, rmdir } from "fs/promises";
import { tmpdir } from "os";
import { join, extname } from "path";
import { Readable } from "stream";
import { getScopedS3Client } from "@/lib/aws/actions";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

class NoPreviewAvailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NoPreviewAvailableError";
  }
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { previewId, fileName, filePath, fileType } = body;

  try {
    const startTime = Date.now();

    if (!previewId) {
      return NextResponse.json(
        { success: false, message: "No previewId provided." },
        { status: 400 },
      );
    }

    const session = await auth.api.getSession({ headers: await headers() });
    const userId = session?.user.id;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User is not authenticated." },
        { status: 401 },
      );
    }

    if (!fileName || !filePath || !fileType) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing fileName, filePath, or fileType.",
        },
        { status: 400 },
      );
    }

    const fullFilePath = filePath.replace("userId", userId);
    const fileCategory = getFileCategory(fileType, fileName);

    if (!["image", "video", "pdf", "audio"].includes(fileCategory)) {
      await removePreviewMetadata(filePath);
      return NextResponse.json(
        {
          success: false,
          message: `Unsupported file category: ${fileCategory}`,
        },
        { status: 400 },
      );
    }

    after(async () => {
      console.log("starting preview generation for", {
        userId,
        fileName,
        fullFilePath,
        fileType,
      });

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
        const previewUrl = await uploadToS3(
          s3Client,
          S3_BUCKET_NAME,
          previewKey,
          previewBuffer,
        );

        const endTime = Date.now();
        console.log(
          `Preview generation completed in ${(endTime - startTime) / 1000}s for ${fileName}`,
        );
        console.log(
          "Successfully generated preview and uploaded to S3:",
          previewUrl.slice(0, 110) + "...",
        );
      } catch (error) {
        console.error("Error during preview generation/upload:", error);
        await removePreviewMetadata(filePath);
      } finally {
        await unlink(tmpFilePath).catch(() => {});
        await rmdir(tmpDir).catch(() => {});
      }
    });
  } catch (error) {
    console.error("Error generating preview:", error);

    await removePreviewMetadata(filePath);

    return NextResponse.json(
      { success: false, message: "Error generating preview." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    success: true,
    status: "processing file preview",
  });
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
  fileCategory: "image" | "video" | "pdf" | "audio" | string,
): Promise<Uint8Array> {
  switch (fileCategory) {
    case "image":
      return processImage(filePath);
    case "video":
      return processVideo(filePath);
    case "pdf":
      return processPdf(filePath);
    case "audio":
      return processAudio(filePath);
    default:
      throw new Error(`Unsupported category: ${fileCategory}`);
  }
}

async function processAudio(filePath: string): Promise<Uint8Array> {
  console.log("Processing audio for cover art extraction:", filePath);

  // ffmpeg extracts the attached picture stream and pipes raw image data to stdout.
  // -an disables audio output. "pipe:1" writes the image to stdout.
  // If no cover art stream exists, ffmpeg exits with a non-zero code.
  let rawImageData: Uint8Array;
  try {
    rawImageData = await runCommand("ffmpeg", [
      "-i",
      filePath,
      "-an", // no audio output
      "-vcodec",
      "copy", // copy the image stream as-is (usually JPEG)
      "-f",
      "image2",
      "pipe:1", // write to stdout
    ]);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    // ffmpeg outputs this when no video/image stream is found
    if (msg.includes("Output file does not contain any stream")) {
      throw new NoPreviewAvailableError(
        `No embedded cover art found in audio file: ${filePath}`,
      );
    }
    throw err;
  }

  if (!rawImageData || rawImageData.length === 0) {
    throw new NoPreviewAvailableError(
      `No embedded cover art found in audio file: ${filePath}`,
    );
  }

  // The extracted image may be JPEG or PNG — run through ImageMagick
  // to normalize it to PNG, matching what the rest of the pipeline expects.
  const tmpImagePath = `${filePath}-cover-raw`;
  await writeFile(tmpImagePath, Buffer.from(rawImageData));

  try {
    const pngData = await runCommand("magick", [
      tmpImagePath,
      "-resize",
      "1200x1200>",
      "-quality",
      "95",
      "png:-",
    ]);

    if (!pngData || pngData.length === 0) {
      throw new Error("ImageMagick produced empty output for audio cover art.");
    }

    return pngData;
  } finally {
    await unlink(tmpImagePath).catch(() => {});
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

// ---------------------------------------------------------------------------
// Metadata cleanup
// ---------------------------------------------------------------------------

async function removePreviewMetadata(filePath: string) {
  try {
    console.log("Starting preview metadata cleanup");

    const session = await auth.api.getSession({ headers: await headers() });
    const userId = session?.user.id;

    if (!userId) {
      console.warn("Cannot clean up preview metadata: user not authenticated.");
      return;
    }

    const s3Client = await getScopedS3Client(userId);
    const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME!;
    const fullFilePath = filePath.replace("userId", userId);

    console.log(fullFilePath);
    // Get current metadata
    const headCommand = new HeadObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: fullFilePath,
    });
    const headResponse = await s3Client.send(headCommand);
    const currentMetadata = headResponse.Metadata || {};

    // Remove "preview" and "previewkey" keys
    const updatedMetadata = { ...currentMetadata };
    delete updatedMetadata.preview;
    delete updatedMetadata.previewkey;

    // Copy object to itself with updated metadata
    const copyCommand = new CopyObjectCommand({
      Bucket: S3_BUCKET_NAME,
      CopySource: `${S3_BUCKET_NAME}/${fullFilePath}`,
      Key: fullFilePath,
      MetadataDirective: "REPLACE",
      ContentType: headResponse.ContentType,
      Metadata: updatedMetadata,
    });

    await s3Client.send(copyCommand);
    console.log("Successfully removed preview metadata from:", fullFilePath);
  } catch (error) {
    console.error("Error during preview metadata cleanup:", error);
  }
}
