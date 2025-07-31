import { Button } from "../ui/button";
import { authClient } from "@/lib/auth/auth-client";
import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";


export default function SignOutBtn() {
    const [loading, setLoading] = useState<boolean>(false);
    const router = useRouter();

    const handleSignOut = async () => {
        setLoading(true);
        try {
            await authClient.signOut();
        } catch (error) {
            console.log("Failed to sign user out", error);
        } finally {
            setLoading(false);
        }
    }


    return (
        <Button onClick={handleSignOut} className="cursor-pointer text-lg p-5 w-32" variant={"black"}>
            {loading ? <LoaderCircle size={24} className="spin-fast" /> : "Sign Out"}
        </Button>
    )
}