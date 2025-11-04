import Container from "@/components/container";
import { fetchPosts } from "./actions";
import PostItem from "./components/postItem";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "posts",
  description: "view the public posts of filegilla",
  openGraph: {
    title: "posts",
    description: "view the public posts of filegilla",
    images: [
      {
        url: "/ogPostsImage.png",
        width: 1200,
        height: 630,
        alt: "filegilla posts",
      },
    ],
    type: "website",
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ),
};

async function PostsList() {
  const { success, message, posts } = await fetchPosts();

  return (
    <>
      {success ? (
        <div>
          <h1 className="text-2xl font-bold">Posts</h1>
          <div className="flex flex-wrap w-full gap-4 items-start justify-center mt-4">
            {posts?.map((post) => (
              <div key={post.id}>
                <PostItem post={post} />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          <p>{message}</p>
          <p>please try again.</p>
        </>
      )}
    </>
  );
}

export default function Posts() {
  return (
    <main>
      <Container className="mt-16">
        <Suspense
          fallback={
            <div>
              <h1 className="text-2xl font-bold">Posts</h1>

              <div className="flex flex-wrap w-full gap-4 items-start justify-center mt-4">
                {new Array(9).fill(0).map((_, index) => (
                  <Skeleton className="w-xs h-[366px] rounded-xl" key={index} />
                ))}
              </div>
            </div>
          }
        >
          <PostsList />
        </Suspense>
      </Container>
    </main>
  );
}
