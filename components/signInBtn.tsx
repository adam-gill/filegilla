import { TailSpin } from "react-loading-icons";
import { Button } from "./ui/button";
import { signIn } from "next-auth/react";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface props {
    loading: boolean,
    setLoading: (value: boolean) => void;
    tabIndex?: number;
    content: ReactNode;
    className?: string;
}


const SignInButton: React.FC<props> = ({ loading, setLoading, tabIndex, content, className }) => {
  return (
    <Button
      tabIndex={tabIndex}
      className={cn("w-24 focus-visible:outline focus-visible:outline-4 focus-visible:outline-blue-500 focus-visible:outline-offset-2", className)}
      disabled={loading}
      onClick={() => {
        setLoading(true);
        signIn("azure-ad-b2c");
      }}
      variant={"white"}
    >
      {loading ? (
        <TailSpin
          className={"absolute"}
          stroke="#000"
          strokeWidth={2.5}
          width={24}
          height={24}
          speed={2.5}
        />
      ) : (
        content
      )}
    </Button>
  );
};

export default SignInButton;
