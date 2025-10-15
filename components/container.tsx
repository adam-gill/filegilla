import { cn } from "@/lib/utils";

interface ContainerProps {
    children: React.ReactNode;
    className?: string;
}

export default function Container({ children, className }: ContainerProps) {
    return (
        <div className="w-full">
            <div className={cn("flex flex-col w-full max-w-6xl px-6 mx-auto", className)}>
                {children}
            </div>
        </div>
    )
}