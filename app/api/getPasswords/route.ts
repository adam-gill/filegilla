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

    const passwordsObject = await prisma.passwords.findMany({
      where: {
        user_id: userId,
      },
    });
    console.log(passwordsObject);

    return NextResponse.json(
      {
        success: true,
        message: `Passwords found for user-${userId}`,
        passwords: passwordsObject,
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
