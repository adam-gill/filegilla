"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { Posts } from "../actions";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function PostNavigator({
  posts,
  shareName,
}: {
  posts: Posts[] | undefined;
  shareName: string;
}) {
  const [upDisabled, setUpDisabled] = useState<boolean>(false);
  const [downDisabled, setDownDisabled] = useState<boolean>(false);
  const router = useRouter();

  const navigatePosts = (change: number) => {
    if (!posts) return;
    const currentIndex = posts.findIndex(
      (post) => post.shareName === shareName,
    );

    if (change === 1 && currentIndex < posts.length - 1) {
      const nextShareName = posts[currentIndex + 1].shareName;
      router.replace(`/posts/${nextShareName}`);
    } else if (change === -1 && currentIndex > 0) {
      const prevShareName = posts[currentIndex - 1].shareName;
      router.replace(`/posts/${prevShareName}`);
    }
  };

  useEffect(() => {
    if (!posts) {
        setUpDisabled(true);
        setDownDisabled(true);
        return;
    }

    const currentIndex = posts.findIndex(
      (post) => post.shareName === shareName,
    );

    setUpDisabled(currentIndex <= 0);
    setDownDisabled(currentIndex >= posts.length - 1);
  }, [posts, shareName]);

  return (
    <div className="flex items-center justify-center absolute right-8 top-1/2 -translate-y-1/2">
      <div className="flex flex-col gap-4">
        <button
          onClick={() => navigatePosts(-1)}
          disabled={upDisabled}
          className="p-3 rounded-full bg-neutral-600/60 cursor-pointer disabled:brightness-25 disabled:cursor-not-allowed hover:bg-neutral-600/80 transition"
        >
          <ChevronUp strokeWidth={2.5} />
        </button>
        <button
          onClick={() => navigatePosts(1)}
          disabled={downDisabled}
          className="p-3 rounded-full bg-neutral-600/60 cursor-pointer disabled:brightness-25 disabled:cursor-not-allowed hover:bg-neutral-600/80 transition"
        >
          <ChevronDown strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
