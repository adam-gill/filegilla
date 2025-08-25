interface ContainerProps {
    children: React.ReactNode;
}

export default function Container({ children }: ContainerProps) {
    return (
        <div className="w-full">
            <div className="flex flex-col w-full max-w-6xl px-6 mx-auto">
                {children}
            </div>
        </div>
    )
}