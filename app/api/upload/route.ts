import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

const uploadFunctionURL = process.env.AZURE_UPLOAD_FUNCTION_URL!;

export async function POST(req: NextRequest) {
  try {
      
      const formData = await req.formData();
      const file = formData.get("file") as File;
      const userId = formData.get("userId");

    if (!file) {
      return new NextResponse("Missing file", { status: 400 });
    }

    const azureFormData = new FormData();
    azureFormData.append("file", file);
    azureFormData.append("userId", JSON.stringify({ userId: userId }))

    await axios.post(uploadFunctionURL, azureFormData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
    });


    return NextResponse.json({
      success: true,
      message: "File uploaded successfully",
    });
  } catch (error: any) {
    console.log(error);
    const statusCode = 500;
    const errorMessage = "error on next api route";

    return NextResponse.json(
      {
        success: false,
        message: errorMessage,
      },
      { status: statusCode }
    );
  }
}
