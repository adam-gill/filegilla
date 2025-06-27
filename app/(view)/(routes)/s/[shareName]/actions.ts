import { convertSize } from "@/lib/helpers";
import { prisma } from "@/lib/prisma";

export async function getFileSize(publicFileName: string) {

    const fileData = await prisma.shares.findFirst({
        select: {
            publicBlobURL: true
        },
        where: {
          name: publicFileName
        },
      });

    const publicBlobURL = fileData?.publicBlobURL;

    if (publicBlobURL) {
        const res = await fetch(publicBlobURL, {
          method: "HEAD",
        });
        
        const bytes = res.headers.get('content-length');
        const prettySize = bytes ? convertSize(Number(bytes)) : ""

        return prettySize   
    } else {
        return ""
    }
  }