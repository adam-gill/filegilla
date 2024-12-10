import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { compare } from "bcrypt";
import { createPasswordBody } from "filegilla";

export async function POST(req: NextRequest) {
  try {
    const body: createPasswordBody = await req.json();
    const userId = body.userId;
    const password = body.password;

    if (!userId || !password) {
      return new NextResponse("Missing userId or password", { status: 400 });
    }

    const userObject = await prisma.users.findFirst({
      where: {
        user_id: userId,
      },
    });

    const phash = userObject?.phash;

    if (phash && !(await compare(password, phash))) {
      return new NextResponse("Wrong password", { status: 401 });
    }

    const passwords = await prisma.passwords.findMany({
      where: {
        user_id: userId,
      },
    });

    console.log(passwords)

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
      message: `Failed to check password for user: ${error}`,
    });
  }
}
