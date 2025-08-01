"use client";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { getInitials } from "@/lib/utils";
import SignInBtn from "@/components/auth/sign-in-btn";
import { authClient } from "@/lib/auth/auth-client";
import SignOutBtn from "@/components/auth/sign-out-btn";
import { User } from "lucide-react";

export default function AccountCard() {
    const { data: session, isPending } = authClient.useSession();
    const userData = session?.user;

    if (isPending) {
        return (
            <Card className="w-full max-w-2xl mx-auto fg-grad border-none min-h-96 flex flex-col justify-between text-black">
                <CardHeader className="flex flex-row items-center gap-4">
                    <Skeleton className="w-16 h-16 rounded-full !bg-neutral-700/30" />
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-48 !bg-neutral-700/30" />
                        <Skeleton className="h-6 w-32 !bg-neutral-700/30" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 text-black">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Skeleton className="h-5 w-20 !bg-neutral-700/30" />
                                <Skeleton className="h-6 w-32 !bg-neutral-700/30" />
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-5 w-20 !bg-neutral-700/30" />
                                <Skeleton className="h-6 w-32 !bg-neutral-700/30" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-5 w-20 !bg-neutral-700/30" />
                            <Skeleton className="h-6 w-32 !bg-neutral-700/30" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-5 w-20 !bg-neutral-700/30" />
                            <Skeleton className="h-6 w-40 !bg-neutral-700/30" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-5 w-20 !bg-neutral-700/30" />
                            <Skeleton className="h-6 w-48 !bg-neutral-700/30" />
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Skeleton className="h-10 w-24 !bg-neutral-700/30" />
                </CardFooter>
            </Card>
        );
    }

    return (
        <>
            <Card className="w-full max-w-2xl mx-auto fg-grad border-none min-h-96 flex flex-col justify-between text-black">
                <CardHeader className="flex flex-row items-center gap-4">
                    <Avatar className="w-16 h-16 font-bold text-lg border-px border-black">
                        <AvatarImage
                            src={userData?.image || ""}
                            alt={userData?.name || "Avatar Image"}
                        />
                        <AvatarFallback className="!bg-black text-2xl">
                            {userData ? (
                                <>{getInitials(userData.name)}</>
                            ) : (<User size={32} />)}
                        </AvatarFallback>
                    </Avatar>
                    {userData ? (
                        <div className="text-black">
                            <CardTitle className="text-2xl">
                                {userData.name}
                            </CardTitle>
                            <p className="text-lg text-muted-foreground">
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
                                        className="text-base font-medium text-muted-foreground"
                                    >
                                        First Name
                                    </Label>
                                    <p id="firstName" className="text-lg font-semibold">
                                        {userData.name.split(" ")[0]}
                                    </p>
                                </div>
                                <div>
                                    <Label
                                        htmlFor="lastName"
                                        className="text-base font-medium text-muted-foreground"
                                    >
                                        Last Name
                                    </Label>
                                    <p id="lastName" className="text-lg font-semibold">
                                        {userData.name.split(" ")[1]}
                                    </p>
                                </div>
                            </div>
                            <div>
                                <Label
                                    htmlFor="username"
                                    className="text-base font-medium text-muted-foreground"
                                >
                                    Username
                                </Label>
                                <p id="username" className="text-lg font-semibold">
                                    {userData.username}
                                </p>
                            </div>
                            <div>
                                <Label
                                    htmlFor="id"
                                    className="text-base font-medium text-muted-foreground"
                                >
                                    User ID
                                </Label>
                                <p id="id" className="text-lg font-semibold">
                                    {userData.id}
                                </p>
                            </div>
                            <div>
                                <Label
                                    htmlFor="email"
                                    className="text-base font-medium text-muted-foreground"
                                >
                                    Email
                                </Label>
                                <p id="email" className="text-lg font-semibold">
                                    {userData.email}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                )}
                <CardFooter>
                    {session ? (
                        <SignOutBtn />
                    ) : (
                        <SignInBtn />
                    )}
                </CardFooter>
            </Card>
        </>
    );
}