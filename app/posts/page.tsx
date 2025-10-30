import Container from "@/components/container";
import { fetchPosts } from "./actions";
import PostItem from "./components/postItem";

export default async function Posts() {

  const { success, message, posts } = await fetchPosts();

  return (
    <main>
        <Container className="mt-16">
            {success ? (
                <div>
                    <h1 className="text-2xl font-bold">Posts</h1>
                    <div className="mt-4">
                        {posts?.map((post) => (
                            <div key={post.id}>
                                <PostItem post={post} />
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <p>{message}</p>
            )}
        </Container>
    </main>
  );
}
