import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

interface CheckPublicFileResponse {
  publicURL?: string;
  name?: string;
  exists: boolean;
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const etag = searchParams.get("etag");
    const userId = searchParams.get("userId");

    console.log(etag, userId)


    if (!userId || !etag) {
      return NextResponse.json(
        { error: "Missing required fields etag and userId" },
        { status: 400 }
      );
    }

    const sharesObject = await prisma.shares.findFirst({
      where: {
        owner: userId,
        source_etag: etag,
      },
      select: {
        name: true,
        source_etag: true,
      },
    });

    if (!!sharesObject) {
      return NextResponse.json<CheckPublicFileResponse>(
        {
          publicURL: `https://www.filegilla.com/s/${sharesObject.name}`,
          name: sharesObject.name,
          exists: true,
        },
        { status: 200 }
      );
    }

    return NextResponse.json<CheckPublicFileResponse>(
      {
        exists: false,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Server error checking public file status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
