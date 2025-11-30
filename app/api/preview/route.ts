import { auth } from "@/lib/auth/auth";
import { getFileCategory } from "@/lib/helpers";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";

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

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json(
      { success: false, message: "No file provided." },
      { status: 400 }
    );
  }

  const baseFileName = file.name.replace(/\.[^/.]+$/, "");
  const outputFileName = `preview-${baseFileName}.webp`;

  const previewImage = await getPreviewImage(file);
  const bodyBuffer = Buffer.from(previewImage);

  return new NextResponse(bodyBuffer, {
    status: 200,
    headers: {
      "Content-Type": "image/webp",
      "Content-Disposition": `inline; filename="${outputFileName}"`,
      "Content-Length": String(Buffer.byteLength(bodyBuffer)),
    },
  });
  } catch (error) {
    console.error("Error generating preview:", error);
    return NextResponse.json(
      { success: false, message: "Error generating preview." },
      { status: 500 }
    );
  }
}

async function runCommandWithInput(
  cmd: string,
  args: string[],
  inputBuffer: Uint8Array
): Promise<Uint8Array> {
  return new Promise<Uint8Array>((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: ["pipe", "pipe", "pipe"] });

    const stdoutChunks: Buffer[] = [];
    const stderrChunks: Buffer[] = [];

    child.stdout.on("data", (chunk: Buffer) => {
      stdoutChunks.push(Buffer.from(chunk));
    });

    child.stderr.on("data", (chunk: Buffer) => {
      stderrChunks.push(Buffer.from(chunk));
    });

    child.stdin.on("error", (err: NodeJS.ErrnoException | null) => {
      if (err && err.code === "EPIPE") {
        console.warn(`${cmd} stdin error (EPIPE) - ignoring (expected race)`);
        return;
      }
      if (err) reject(err);
    });

    child.on("error", (err: NodeJS.ErrnoException) => {
      if (err && err.code === "EPIPE") {
        console.warn(`${cmd} child error (EPIPE) - ignoring (expected race)`);
        return;
      }
      reject(err);
    });

    child.on("close", (code) => {
      const stdout = Buffer.concat(stdoutChunks);
      const stderr = Buffer.concat(stderrChunks);

      if (code !== 0) {
        const errorDetails = stderr.toString() || "No stderr output.";
        reject(
          new Error(
            `'${cmd}' exited with code ${code}. Details: ${errorDetails}`
          )
        );
        return;
      }

      resolve(stdout);
    });

    try {
      child.stdin.write(Buffer.from(inputBuffer), (err) => {
        try {
          child.stdin.end();
        } catch {}

        if (err) {
          if ((err as NodeJS.ErrnoException).code === "EPIPE") {
            console.warn(`${cmd} write callback error (EPIPE) - ignoring (expected race)`);
            return;
          }
          reject(err);
        }
      });
    } catch (e) {
      const err = e as NodeJS.ErrnoException;
      if (err && err.code === "EPIPE") {
        console.warn(`${cmd} sync write error (EPIPE) - ignoring (expected race)`);
        try {
          child.stdin.end();
        } catch {}
        return;
      }
      try {
        child.stdin.end();
      } catch {}
      reject(e);
    }
  });
}

async function getPreviewImage(file: File): Promise<Uint8Array> {
  const fileCategory = getFileCategory(file.type, file.name);

  switch (fileCategory) {
    case "image":
      const buffer = await imageToImage(file);
      return buffer;
    case "video":
      const videoBuffer = await videoToImg(file);
      return videoBuffer;
    case "pdf":
      const pdfBuffer = await pdfToImg(file);
      return pdfBuffer;
    default:
      throw new Error("Unsupported file type for preview.");
  }
}

async function imageToImage(file: File): Promise<Uint8Array> {
  try {
    const fileName = file.name;
    const fileBuffer = new Uint8Array(await file.arrayBuffer());
    console.log(`Processing image in memory: ${fileName}`);

    const imageArgs = [
      "-",
      "-resize",
      "1200x800>",
      "-quality",
      "85",
      "-define",
      "webp:method=4",
      "webp:-",
    ];

    const outputBytes = await runCommandWithInput(
      "magick",
      imageArgs,
      fileBuffer
    );

    return outputBytes;
  } catch (error) {
    console.error("Error processing image:", error);
    throw error;
  }
}

async function videoToImg(file: File): Promise<Uint8Array> {
  try {
    const fileName = file.name;
    const fileBuffer = new Uint8Array(await file.arrayBuffer());
    console.log(`Processing video in memory: ${fileName}`);

    // Probe duration with ffprobe (read from stdin)
    let duration = 0;
    try {
      const ffprobeArgs = [
        "-v",
        "error",
        "-show_entries",
        "format=duration",
        "-of",
        "default=noprint_wrappers=1:nokey=1",
        "-i",
        "-",
      ];
      const probeOutputBytes = await runCommandWithInput(
        "ffprobe",
        ffprobeArgs,
        fileBuffer
      );
      const probeOutput = new TextDecoder().decode(probeOutputBytes).trim();
      duration = parseFloat(probeOutput) || 0;
    } catch (probeErr) {
      console.warn("ffprobe failed, falling back to 0s duration.", probeErr);
    }

    const seekTime = duration > 0 ? Math.min(3, duration * 0.08) : 0;
    console.log(
      `Video duration: ${duration.toFixed(2)}s, extracting frame at: ${seekTime.toFixed(2)}s`
    );

    const ffmpegArgs = [
      "-ss",
      seekTime.toFixed(4),
      "-i",
      "-",
      "-vframes",
      "1",
      "-vf",
      "scale=w=1200:h=630:force_original_aspect_ratio=decrease",
      "-f",
      "webp",
      "-quality",
      "85",
      "-",
    ];

    const webpData = await runCommandWithInput("ffmpeg", ffmpegArgs, fileBuffer);

    if (!webpData || webpData.length === 0) {
      throw new Error("ffmpeg produced empty output when generating WebP.");
    }

    return webpData;
  } catch (error) {
    console.error("Video processing failed:", error);
    throw error;
  }
}

async function pdfToImg(file: File): Promise<Uint8Array> {
  try {
    const fileName = file.name;
    const fileBuffer = new Uint8Array(await file.arrayBuffer());
    console.log(`Processing PDF in memory: ${fileName}`);

    const magickArgs = [
      "pdf:-[0]",
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
      "webp:-",
    ];

    const webpData = await runCommandWithInput("magick", magickArgs, fileBuffer);

    if (!webpData || webpData.length === 0) {
      throw new Error("ImageMagick produced empty output when converting PDF.");
    }

    return webpData;
  } catch (error) {
    console.error("PDF processing failed:", error);
    throw error;
  }
}


