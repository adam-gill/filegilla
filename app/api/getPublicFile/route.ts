import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { BlobServiceClient } from "@azure/storage-blob";
import { file } from "filegilla";

const extractFileName = (url: string): string => {
  const segments = url.split("/");
  return segments[segments.length - 1];
};

export type getPublicFileResponse = {
  file: file,
  name: string;
  owner: string;
  url: string;
  timeCreated: Date;
  uuid: string;
  fileName: string;
};

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const shareName: string = searchParams.get("shareName")!;

    if (!shareName) {
      return new NextResponse("shareName is required", { status: 400 });
    }

    const shareObject = await prisma.shares.findFirst({
      where: {
        name: shareName,
      },
    });

    if (shareObject) {
      const blobUrl = new URL(shareObject.publicBlobURL);
      const blobServiceClient = BlobServiceClient.fromConnectionString(
        process.env.AZURE_STORAGE_CONNECTION_STRING!
      );
      const containerName = blobUrl.pathname.split("/")[1];
      const blobName = blobUrl.pathname.split("/").slice(2).join("/");

      const containerClient =
        blobServiceClient.getContainerClient(containerName);
      const blobClient = containerClient.getBlobClient(blobName);
      const properties = await blobClient.getProperties();

      const file: file = {
        name: extractFileName(shareObject.publicBlobURL),
        sizeInBytes: properties.contentLength!,
        lastModified: properties.lastModified!.toISOString(),
        blobUrl: shareObject.publicBlobURL,
        md5hash: properties.contentMD5
          ? Buffer.from(properties.contentMD5).toString("base64")
          : "",
      };

      const response: getPublicFileResponse = {
        file: file,
        name: shareObject.name,
        url: shareObject.publicBlobURL,
        timeCreated: shareObject.time_created,
        uuid: shareObject.uuid,
        owner: shareObject.owner,
        fileName: extractFileName(shareObject.publicBlobURL),
      };

      return NextResponse.json(response);
    } else {
      return new NextResponse("Error fetching data from database", {
        status: 404,
      });
    }
  } catch (error) {
    return new NextResponse("Server error fetching public file", {
      status: 500,
    });
  }
}

// add sourceETag value to shares table to associate shared files with their source file
// will also need to add etag field to file component and types
