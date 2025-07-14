"use client";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function Home() {

  const router = useRouter();

  const {
    data: session,
    isPending,
    refetch
  } = authClient.useSession()

  const user = session?.user

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login"); // redirect to login page
        },
      },
    });
  }

  if (!isPending && !session) {
    router.push("/landing")
  }

  return (
    <>
      {isPending ? (
        <div>Loading...</div>
      ) : (
        <div className="flex flex-col min-h-screen w-full px-8 mx-auto max-w-7xl">
          <div>Account Info:</div>
          {user && (
            <div>
              <div>Name: {user.name}</div>
              <div>Email: {user.email}</div>
              <div>Username: {user.username ?? ""}</div>
            </div>
          )}

          <Button onClick={handleSignOut}>
            Sign Out
          </Button>
        </div>

      )}
    </>
  );
}