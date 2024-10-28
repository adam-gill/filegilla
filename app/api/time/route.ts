import axios from "axios";
import { NextResponse } from "next/server";

interface body {
    message: string;
}

const timeFunctionUrl = process.env.AZURE_TIME_FUNCTION_URL!;

export async function POST(req: Request) {
  try {
    const body: body = await req.json();

    if (!body.message) {
      return new NextResponse("Message is required", { status: 400 });
    }

    const azureResponse = await axios.post(timeFunctionUrl, body, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    return new NextResponse(JSON.stringify(azureResponse.data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error: any) {
    return new NextResponse(`Server Error: ${error.message}`, { status: 500 });
  }
}
