import { prisma } from "@/lib/prisma";
import {
  BlobServiceClient,
  ContainerClient,
  ContainerSASPermissions,
  BlobSASPermissions,
} from "@azure/storage-blob";
import { NextRequest, NextResponse } from "next/server";

interface reqBody {
  fileName: string;
  userId: string;
}

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING!;

const createUser = async (userId: string) => {
  // create user table in the db
  await prisma.users.create({
    data: {
      user_id: userId,
      creation_date: new Date(),
      phash: null,
      locked: "0",
    },
  });
};

const createSASToken = async (
  userId: string,
  containerClient: ContainerClient
) => {
  // generate sas token and store it in the db
  const startsOn = new Date();
  const expiresOn = new Date(startsOn.getTime() + 1080 * 24 * 60 * 60 * 1000); // Add 360 days

  const sasToken = await containerClient.generateSasUrl({
    permissions: ContainerSASPermissions.parse("racw"), // r=read, a=add, c=create, w=write, l=list
    expiresOn: expiresOn,
    startsOn: startsOn,
    protocol: "https,http" as any,
  });

  let tokenPart = sasToken;
  if (sasToken.includes("?")) {
    tokenPart = sasToken.substring(sasToken.indexOf("?"));
  }

  // create row for user's sas token
  await prisma.sas_table.create({
    data: {
      user_id: userId,
      sas_token: tokenPart,
      start_time: startsOn,
      end_time: expiresOn,
    },
  });
};

export async function POST(req: NextRequest) {
  const body: reqBody = await req.json();
  const userId = body.userId;
  const fileName = body.fileName;
  const containerName = `user-${userId}`;

  try {
    const blobServiceClient =
      BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobServiceClient.getContainerClient(containerName);

    if (!(await containerClient.exists())) {
      await containerClient.create();
      await createUser(userId);
      await createSASToken(userId, containerClient);
    }

    // generate presignedurl here
    const blobClient = containerClient.getBlobClient(fileName);
    const presignedUrl = await blobClient.generateSasUrl({
      permissions: BlobSASPermissions.parse("w"), // write permission only
      expiresOn: new Date(Date.now() + 60 * 60 * 1000), // 1 hour expiry
      protocol: "https,http" as any,
    });

    return new NextResponse(
      JSON.stringify({
        success: true,
        url: presignedUrl,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.log(
      "Error creating presigned url or creating container/sas token",
      error
    );

    return new NextResponse(JSON.stringify({
        success: false,
        message: `Failed to create presignedUrl + ${error}`
    }))
  }
}
