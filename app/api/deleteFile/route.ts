import axios from "axios";
import { NextResponse } from "next/server";

interface deleteRequest {
  userId: string;
  blobName: string;
}

const deleteFunctionUrl = process.env.AZURE_DELETE_FUNCTION_URL!;

export async function DELETE(req: Request) {
  try {
    const body: deleteRequest = await req.json();
    const userId = body.userId;
    const blobName = body.blobName;

    if (!userId || !blobName) {
      return new NextResponse("Missing userId or fileName", { status: 400 });
    }

    await axios.delete(deleteFunctionUrl, {
      data: {
        UserId: userId,
        BlobName: blobName,
      },
    });

    return new NextResponse(`Successfully deleted ${blobName}`, {
      status: 200,
    });
  } catch (error) {
    console.log(error);
    return new NextResponse("Server error deleting file", { status: 500 });
  }
}
