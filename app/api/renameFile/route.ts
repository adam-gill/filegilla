import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

interface renameFileRequest {
  userId: string;
  oldFileName: string;
  newFileName: string;
}
const azureRenameFileFunction = process.env.AZURE_RENAME_FILE_FUNCTION_URL!;

export async function PUT(req: NextRequest) {
  try {
    const body: renameFileRequest = await req.json();
    const userId = body.userId;
    const fileName = body.oldFileName;
    const newName = body.newFileName;

    console.log(userId, fileName, newName);

    if (!userId || !fileName || !newName) {
      return NextResponse.json(
        { error: "Missing userId, fileId, or newName fields" },
        { status: 400 }
      );
    }

    await axios.put(
      azureRenameFileFunction,
      {
        userId: userId,
        oldFileName: fileName,
        newFileName: newName,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return NextResponse.json(
      {
        success: true,
        message: `Successfully renamed file ${fileName} to ${newName}`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error renaming file", error);
    return NextResponse.json(
      { error: "Failed to rename file " + error },
      { status: 500 }
    );
  }
}
