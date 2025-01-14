import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { addPasswordBody } from "filegilla";

export async function POST(req: NextRequest) {
  try {
    const body: addPasswordBody = await req.json();
    const userId = body.userId;
    const data = body.data;

    if (!userId || !data) {
      return new NextResponse("Missing userId or data", { status: 400 });
    }

    console.log(data);

    await prisma.passwords.create({
      data: {
        user_id: userId,
        time_created: new Date(),
        cipher: data.cipher,
        title: data.title,
        service_url: data.url || "",
        service_description: data.description || "",
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Successfully created password",
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        success: false,
        message: `Failed to add password for user: ${error}`,
      },
      { status: 500 }
    );
  }
}
