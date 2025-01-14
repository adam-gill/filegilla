import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const password_id = body.password_id;
    const user_id = body.user_id;

    if (!user_id || !password_id) {
      return new NextResponse("Missing user_id or password_id", {
        status: 400,
      });
    }

    await prisma.passwords.delete({
      where: { user_id: user_id, password_id: password_id },
    });

    return new NextResponse(
      `Successfully deleted password-${password_id} for user-${user_id}`,
      { status: 200 }
    );
  } catch (error) {
    return new NextResponse("Failed to delete password: " + error, { status: 505 });
  }
}
