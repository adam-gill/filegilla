import { prisma } from "@/lib/prisma";
import axios from "axios";
import { getFileResponse } from "filegilla";
import { NextRequest, NextResponse } from "next/server";

const getFileFunctionUrl = process.env.AZURE_GET_FILE_FUNCTION_URL!;

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const userId = searchParams.get("userId");
    const fileName = decodeURIComponent(searchParams.get("fileName") as string);


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

    const sasToken = await prisma.sas_table.findFirst({
      where: {
        user_id: userId,
      },
    });

    const data: getFileResponse = {
      ...response.data,
      sasToken: sasToken?.sas_token
    }


    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        success: false,
        message: `Failed to fetch user file. ${error}`,
      },
      { status: 505 }
    );
  }
}
