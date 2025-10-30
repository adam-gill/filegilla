import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import GetFileIcon from "@/app/u/components/getFileIcon";
import { Posts } from "@/app/posts/actions";
import Link from "next/link";
import { viewsText } from "@/lib/helpers";

export default function PostItem({ post }: { post: Posts }) {
  return (
    <Link href={`/s/${post.shareName}`}>
      <Card className="max-w-full group relative w-xs max-md:w-3xs border !border-neutral-700 hover:border-blue-400 transition-all duration-200 shadow-md shadow-neutral-900 hover:shadow-xl">
        <CardContent className={`p-0 h-full flex flex-col-reverse relative`}>
          <div className="w-full h-[318px] overflow-hidden rounded-b-xl flex justify-center relative">
            <Image
              src={post.previewUrl || "/defaultPreview.svg"}
              alt={post.previewUrl ? "default file preview" : "file preview"}
              fill
              className="object-contain cursor-pointer"
              sizes="318px"
              unoptimized
            />
          </div>

          {/* Top Banner */}
          <div
            className={`flex items-center justify-between p-3 rounded-t-xl w-full max-w-full z-10 bg-neutral-950/90`}
          >
            {/* Icon and Name */}
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div className="flex-shrink-0">
                <GetFileIcon fileName={post.s3Url} isFgDoc={post.isFgDoc} />
              </div>

              {/* Name with truncation */}
              <div
                title={post.shareName}
                className="cursor-pointer flex-1 min-w-0"
              >
                <p className="text-base font-medium text-gray-100 truncate">
                  {post.shareName}
                </p>
              </div>
            </div>
            {/* Views */}
            <div className="flex items-center space-x-2">
              <p className="text-sm text-gray-500">{viewsText(Number(post.views))}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
