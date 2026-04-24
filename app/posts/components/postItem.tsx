import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import GetFileIcon from "@/app/u/components/getFileIcon";
import { Posts } from "@/app/posts/actions";
import Link from "next/link";
import { viewsText } from "@/lib/helpers";
import { File } from "lucide-react";

export default function PostItem({ post }: { post: Posts }) {
  return (
    <Link href={`/posts/${post.shareName}`}>
      <Card className="max-w-full group relative w-xs max-md:w-3xs border border-neutral-700! hover:border-blue-400 transition-all duration-200 shadow-md shadow-neutral-900 hover:shadow-xl">
        <CardContent className={`p-0 h-full flex flex-col-reverse relative`}>
          <div className="w-full h-79.5 overflow-hidden rounded-b-xl flex justify-center relative">
            {post.previewUrl ? (
              <Image
                src={post.previewUrl || "/defaultPreview.svg"}
                alt={post.previewUrl ? "default file preview" : "file preview"}
                fill
                className="object-contain cursor-pointer"
                sizes="318px"
                unoptimized
              />
            ) : (
              <div className="w-full flex items-center justify-center cursor-pointer">
                <File
                  size={192}
                  strokeWidth={0.8}
                  className="w-full text-gray-400 mb-6"
                />
              </div>
            )}
          </div>

          {/* Top Banner */}
          <div
            className={`flex items-center justify-between p-3 rounded-t-xl w-full max-w-full z-10 bg-neutral-950/90`}
          >
            {/* Icon and Name */}
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div className="shrink-0">
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
              <p className="text-sm text-gray-500">
                {viewsText(Number(post.views))}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
