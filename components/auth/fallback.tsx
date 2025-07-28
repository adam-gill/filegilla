import LoadingSpinner from "../loading-spinner";

export default function Fallback() {
    return (
        <div className="min-w-screen min-h-screen flex items-center justify-center">
            <LoadingSpinner speed="fastest" size="max" />
        </div>
    )
}