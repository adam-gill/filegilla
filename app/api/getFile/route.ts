import axios from "axios";
import { getFileResponse } from "filegilla";
import { NextRequest, NextResponse } from "next/server";

const getFileFunctionUrl = process.env.AZURE_GET_FILE_FUNCTION_URL!;

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const fileName = decodeURIComponent(searchParams.get('fileName') as string);
    
    console.log(userId, fileName)

    if (!userId || !fileName) {
      return NextResponse.json(
        {
          success: false,
          message: "UserId and fileName are required.",
        },
        { status: 404 }
      );
    }
    const response = await axios.get(getFileFunctionUrl, {
      params: {
        userId,
        fileName,
      },
    });

    return NextResponse.json(response.data as getFileResponse, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        success: false,
        message: `Failed to fetch user file.`,
      },
      { status: 505 }
    );
  }
}
