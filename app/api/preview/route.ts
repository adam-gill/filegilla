import { auth } from "@/lib/auth/auth";
import { getFileCategory } from "@/lib/helpers";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";

async function runCommandWithInput(
  cmd: string,
  args: string[],
  inputBuffer: Uint8Array
): Promise<Uint8Array> {
  return new Promise<Uint8Array>((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: ['pipe', 'pipe', 'pipe'] });

    const stdoutChunks: Buffer[] = [];
    const stderrChunks: Buffer[] = [];

    child.stdout.on('data', (chunk: Buffer) => {
      stdoutChunks.push(Buffer.from(chunk));
    });

    child.stderr.on('data', (chunk: Buffer) => {
      stderrChunks.push(Buffer.from(chunk));
    });

    child.on('error', (err) => {
      reject(err);
    });

    child.on('close', (code) => {
      const stdout = Buffer.concat(stdoutChunks);
      const stderr = Buffer.concat(stderrChunks);

      if (code !== 0) {
        const errorDetails = stderr.toString() || 'No stderr output.';
        reject(new Error(`'${cmd}' exited with code ${code}. Details: ${errorDetails}`));
        return;
      }

      resolve(stdout);
    });

    try {
      child.stdin.write(Buffer.from(inputBuffer), (err) => {
        child.stdin.end();
        if (err) {
          continue;
        }
      });
    } catch (e) {
      try { child.stdin.end(); } catch {}
      reject(e);
    }
  });
}

export async function POST(request: NextRequest) {
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

  const fileCategory = getFileCategory(file.type, file.name);

  switch (fileCategory) {
    case "image":
    default: 

}
