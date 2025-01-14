import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userId = body.userId;

    if (!userId) {
      return new NextResponse("Missing userId", { status: 400 });
    }

    const passwords = await prisma.passwords.findMany({
      where: {
        user_id: userId,
      },
    });


    return NextResponse.json(
      {
        passwords,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json({
      success: false,
      message: `Failed to load passwords for user: ${error}`,
    });
  }
}
