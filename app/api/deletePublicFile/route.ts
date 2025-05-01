import axios from "axios";
import { NextResponse } from "next/server";
import { getPublicFileResponse } from "../getPublicFile/route";

interface deletePublicFileRequest {
  etag: string;
  name: string;
}

const deletePublicFileFunctionUrl = process.env.AZURE_DELETE_PUBLIC_FILE_URL!;

export async function DELETE(req: Request) {
  try {
    const body: deletePublicFileRequest = await req.json();
    const { etag, name } = body;

    if (!etag || !name) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    await axios.delete<deletePublicFileRequest>(
      deletePublicFileFunctionUrl,
      {
        data: {
          etag: etag,
          name: name,
        },
      }
    );

    return new NextResponse(
      `Successfully deleted the public file '${name}' with etag: ${etag}`,
      { status: 200 }
    );
  } catch (error) {

    const body: getPublicFileResponse = await req.json();
    console.log(
      `Error deleting the public file for public file '${
        body.name || "unknown"
      }'`,
      error
    );
    return new NextResponse(
      `Error deleting the public file for public file '${
        body.name || "unknown"
      }'` + error,
      {
        status: 500,
      }
    );
  }
}
