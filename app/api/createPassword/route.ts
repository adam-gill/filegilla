import { prisma } from "@/lib/prisma";
import { createPasswordBody } from "filegilla";
import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcrypt";


export async function POST(req: NextRequest) {
  try {
    const body: createPasswordBody = await req.json();
    const userId = body.userId;
    const password = body.password;

    if (!userId || !password) {
        return new NextResponse("Missing userId or password", { status: 400 });
      }

    console.log(userId, password)
    

    const hashed_password = await hash(password, 12);
    console.log(hashed_password)

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "UserId is required.",
        },
        { status: 404 }
      );
    }

    await prisma.users.update({
      where: {
        user_id: userId,
      },
      data: {
        phash: hashed_password,
      }
    });

    return NextResponse.json(
      {
        success: true,
        message: `Password added for user-${userId} successfully`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error)
    return NextResponse.json({
        success: false,
        message: `Failed to create password for the user: ${error}`
    })
  }
}
