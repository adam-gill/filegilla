import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { shareName } = body;

    if (!shareName) {
      return NextResponse.json(
        { success: false, message: "No share name provided." },
        { status: 400 }
      );
    }

    const shareObject = await prisma.share.findUnique({
      where: {
        shareName: shareName,
      },
    });

    if (!shareObject) {
      return NextResponse.json(
        { success: false, message: "Share not found." },
        { status: 404 }
      );
    }

    const updatedViews = Number(shareObject.views) + 1;
    await prisma.share.update({
      where: {
        shareName: shareName,
      },
      data: {
        views: updatedViews,
      },
    });

    console.log(
      `Views incremented successfully. ${shareName} now has ${updatedViews} views.`
    );
    return NextResponse.json(
      {
        success: true,
        message: `Views incremented successfully. ${shareName} now has ${updatedViews} views.`,
        views: updatedViews - 1,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Failed to increment views." },
      { status: 500 }
    );
  }
}
