import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export const useAuth = ({ page = "" }: { page?: string } = {}) => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    } else if (page === "/" && status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router, page]);

  return { session, status };
};
