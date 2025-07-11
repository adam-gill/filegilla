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

function getFormattedTimestamp() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
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

    console.log(`*** successfully updated password-${password_id} at ${getFormattedTimestamp()} ***`)

    return new NextResponse(`Successfully updated the password ${data.title}`, {
      status: 200,
    });
  } catch (_error) {
    console.log(_error);
    return new NextResponse("Failed to Update Password", { status: 505 });
  }
}
