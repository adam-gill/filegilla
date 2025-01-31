import { prisma } from "@/lib/prisma";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

interface shareFileOperationBody {
  userId: string;
  blobURL: string;
  operation: "create" | "edit";
  uuid: string;
  shareName: string;
}

const azureShareOperationURL = process.env.AZURE_SHARE_FILE_FUNCTION_URL!;

export async function POST(req: NextRequest) {
  try {
    const body: shareFileOperationBody = await req.json();
    const userId = body.userId;
    const blobURL = body.blobURL;
    const operation = body.operation;
    const uuid = body.uuid;
    const shareName = body.shareName;

    if (!userId || !blobURL || !operation || !uuid || !shareName) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const uniqueNames = await prisma.shares.findFirst({
      where: {
        name: shareName,
      },
    });

    if (uniqueNames) {
      return new NextResponse("Share name already exists", { status: 409 });
    }

    await axios.post(azureShareOperationURL, {
      userId: userId,
      blobURL: blobURL,
      shareName: shareName,
      operation: operation,
      uuid: uuid,
    });

    return new NextResponse(`Successfully shared file as ${shareName}.`, {
      status: 200,
    });
  } catch (error) {
    console.log("Error running share file operation", error);
    return new NextResponse("Error running share file operation" + error, {
      status: 500,
    });
  }
}
