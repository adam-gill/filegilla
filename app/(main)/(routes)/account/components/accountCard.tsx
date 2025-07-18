import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { getInitials, getUserData } from "@/lib/auth/userData";

export default async function AccountCard() {
    const userData = await getUserData();

    return (
        <>
            <Card className="w-full max-w-2xl mx-auto fg-grad border-none min-h-96 flex flex-col justify-between text-black">
                <CardHeader className="flex flex-row items-center gap-4">
                    <Avatar className="w-16 h-16 font-bold text-lg border-px border-black">
                        <AvatarImage
                            src={userData?.image || ""}
                            alt={userData?.name || "Avatar Image"}
                        />
                        <AvatarFallback className="bg-white">
                            {getInitials(userData?.name || "")}
                        </AvatarFallback>
                    </Avatar>
                    {userData ? (
                        <div className="text-black">
                            <CardTitle className="text-2xl">
                                {userData.name}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">
                                @{userData.username}
                            </p>
                        </div>
                    ) : (
                        <h1 className="text-2xl font-bold">
                            Sign in to view your account.{" "}
                        </h1>
                    )}
                </CardHeader>
                {userData && (
                    <CardContent>
                        <div className="grid gap-4 text-black">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label
                                        htmlFor="firstName"
                                        className="text-sm font-medium text-muted-foreground"
                                    >
                                        First Name
                                    </Label>
                                    <p id="firstName" className="text-base font-semibold">
                                        {userData.name.split(" ")[0]}
                                    </p>
                                </div>
                                <div>
                                    <Label
                                        htmlFor="lastName"
                                        className="text-sm font-medium text-muted-foreground"
                                    >
                                        Last Name
                                    </Label>
                                    <p id="lastName" className="text-base font-semibold">
                                        {userData.name.split(" ")[1]}
                                    </p>
                                </div>
                            </div>
                            <div>
                                <Label
                                    htmlFor="username"
                                    className="text-sm font-medium text-muted-foreground"
                                >
                                    Username
                                </Label>
                                <p id="username" className="text-base font-semibold">
                                    {userData.username}
                                </p>
                            </div>
                            <div>
                                <Label
                                    htmlFor="id"
                                    className="text-sm font-medium text-muted-foreground"
                                >
                                    User ID
                                </Label>
                                <p id="id" className="text-base font-semibold">
                                    {userData.id}
                                </p>
                            </div>
                            <div>
                                <Label
                                    htmlFor="email"
                                    className="text-sm font-medium text-muted-foreground"
                                >
                                    Email
                                </Label>
                                <p id="email" className="text-base font-semibold">
                                    {userData.email}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                )}
                <CardFooter>
                    <Button>
                        {"Sign In/Out"}
                    </Button>
                </CardFooter>
            </Card>
        </>
    );
}