import { NextRequest, NextResponse } from 'next/server';
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";

import { S3Client, GetObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import archiver from 'archiver';
import { Readable } from 'stream';
import { getScopedS3Client } from '@/lib/aws/actions';
import { createPrivateS3Key } from '@/lib/aws/helpers';

const listFolderContents = async (
    s3Client: S3Client,
    bucketName: string,
    folderPrefix: string
): Promise<string[]> => {
    const objects: string[] = [];
    let continuationToken: string | undefined;

    do {
        const listCommand = new ListObjectsV2Command({
            Bucket: bucketName,
            Prefix: folderPrefix,
            ContinuationToken: continuationToken,
        });

        const response = await s3Client.send(listCommand);

        if (response.Contents) {
            objects.push(...response.Contents.map(obj => obj.Key!).filter(key => key !== folderPrefix));
        }

        continuationToken = response.NextContinuationToken;
    } while (continuationToken);

    return objects;
};

export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });
        const userId = session?.user.id;

        if (!userId) {
            return NextResponse.json(
                { success: false, message: "User is not authenticated." },
                { status: 401 }
            );
        }

        const { location } = await request.json();

        if (!location || !Array.isArray(location)) {
            return NextResponse.json(
                { success: false, message: "Invalid location provided." },
                { status: 400 }
            );
        }

        const s3Client = await getScopedS3Client(userId);
        const folderKey = createPrivateS3Key(userId, location, undefined, true);


        const objectKeys = await listFolderContents(s3Client, process.env.S3_BUCKET_NAME!, folderKey);

        if (objectKeys.length === 0) {
            return NextResponse.json(
                { success: false, message: "Folder is empty or not found." },
                { status: 404 }
            );
        }

        const archive = archiver('zip', {
            zlib: { level: 9 }
        });

        const folderName = location[location.length - 1];
        const nextHeaders = new Headers({
            'Content-Type': 'application/zip',
            'Content-Disposition': `attachment; filename="${folderName}.zip"`,
            'Transfer-Encoding': 'chunked',
        });

        const { readable, writable } = new TransformStream();
        const writer = writable.getWriter();

        archive.on('error', (err) => {
            console.error('Archive error:', err);
            writer.abort(err);
        });

        archive.on('end', () => {
            writer.close();
        });

        archive.on('data', (chunk) => {
            writer.write(new Uint8Array(chunk));
        });

        (async () => {
            try {
                for (const objectKey of objectKeys) {
                    const getObjectCommand = new GetObjectCommand({
                        Bucket: process.env.S3_BUCKET_NAME,
                        Key: objectKey,
                    });

                    const response = await s3Client.send(getObjectCommand);

                    if (response.Body) {
                        const relativePath = objectKey.replace(folderKey, '');

                        const stream = response.Body as Readable;
                        archive.append(stream, { name: relativePath });
                    }
                }

                archive.finalize();
            } catch (error) {
                console.error('Error adding files to archive:', error);
                archive.destroy();
                writer.abort(error);
            }
        })();

        return new NextResponse(readable, {
            status: 200,
            headers: nextHeaders,
        });

    } catch (error) {
        console.error('Download folder error:', error);
        return NextResponse.json(
            { success: false, message: `Error creating folder zip: ${error}` },
            { status: 500 }
        );
    }
}
