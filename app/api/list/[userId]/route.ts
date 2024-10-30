import axios from "axios";
import { listResponse } from "filegilla";
import { NextRequest, NextResponse } from "next/server";

const functionUrl = process.env.AZURE_LIST_FUNCTION_URL!;

export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = params.userId;
    console.log(userId)

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "UserId is required.",
        },
        { status: 404 }
      );
    }

    const urlWithUserId = functionUrl.replace("{userId}", userId);

    const response = await axios.get(urlWithUserId);
    console.log(response.data);

    return NextResponse.json(response.data as listResponse, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        success: false,
        message: `Failed to fetch user's files. `,
      },
      { status: 505 }
    );
  }
}
