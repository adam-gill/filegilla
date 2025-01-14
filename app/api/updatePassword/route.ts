import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

interface UpdatePasswordBody {
  userId: string;
  password_id: number;
  data: {
    cipher: string | undefined;
    title: string;
    url?: string | undefined;
    description?: string | undefined;
  };
}

export async function POST(req: NextRequest) {
  try {
    const body: UpdatePasswordBody = await req.json();
    const user_id = body.userId;
    const password_id = body.password_id;
    const data = body.data;

    if (!password_id || !user_id || !data) {
      return new NextResponse(
        "Missing a required field user_id, password_id, or data",
        { status: 400 }
      );
    }

    await prisma.passwords.update({
      where: {
        user_id: user_id,
        password_id: password_id,
      },
      data: {
        cipher: data.cipher,
        title: data.title,
        service_url: data.url || "",
        service_description: data.description || "",
      },
    });

    return new NextResponse(`Successfully updated the password ${data.title}`, {
      status: 200,
    });
  } catch (error) {
    return new NextResponse("Failed to Update Password", { status: 505 });
  }
}
