import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "UserId is required.",
        },
        { status: 404 }
      );
    }

    const userObject = await prisma.users.findFirst({
      where: {
        user_id: userId,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: `User successfully found (${userId})`,
        phash: userObject?.phash,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({
        success: false,
        message: `Failed to fetch passwords for user: ${error}`
    })
  }
}
