import { useRouter } from "next/navigation";
import { Button } from "../ui/button";

export default function SignInBtn() {
    const router = useRouter();

    return (
        <Button onClick={() => router.push("/auth")} className="cursor-pointer text-lg p-5 w-32" variant={"black"}>Sign In</Button>
    )
}