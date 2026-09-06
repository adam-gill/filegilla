import { authorizeGet } from "@/app/cli/[id]/route";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const result = await authorizeGet(req, id);
  if (!result.ok) {
    return result.response;
  }

  const { cliItem } = result;

  const filename = cliItem.isFile
    ? cliItem.content.split("/").pop() ?? null
    : null;

  return NextResponse.json({
    success: true,
    data: {
      id: cliItem.id,
      isFile: cliItem.isFile,
      filename,
      publiclyViewable: cliItem.publiclyViewable,
      createdAt: cliItem.createdAt.toISOString(),
      updatedAt: cliItem.updatedAt.toISOString(),
    },
  });
}
