"use client";

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
import { LogIn, LogOut } from "lucide-react";
import { useAuth } from "@/lib/useAuth";
import { signIn, signOut } from "next-auth/react";
import { useState } from "react";
import { Skeleton } from "./ui/skeleton";
import { TailSpin } from "react-loading-icons";

type loadedUser = {
  firstName: string;
  lastName: string;
  username: string;
  id: string;
  email: string;
};

export default function AccountCard() {
  const { session, status } = useAuth();
  const user = session?.user as loadedUser;
  const [loading, setLoading] = useState<boolean>(false);

  if (status === "loading") {
    return (
      <>
        <Skeleton className="w-full max-w-2xl min-h-96 rounded-lg bg-[#a0a0a0a0] mx-auto" />
      </>
    );
  }

  return (
    <>
      <Card className="w-full max-w-2xl mx-auto fg-grad border-none min-h-96 flex flex-col justify-between">
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="w-16 h-16 font-bold text-lg border-px border-black">
            <AvatarImage
              src="/placeholder.svg"
              alt={`${user?.firstName} ${user?.lastName}`}
            />
            <AvatarFallback className="bg-white">
              {user?.firstName[0]}
              {user?.lastName[0]}
            </AvatarFallback>
          </Avatar>
          {session ? (
            <>
              <div>
                <CardTitle className="text-2xl">
                  {user?.firstName} {user?.lastName}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  @{user?.username}
                </p>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold">
                Sign in to view your account.{" "}
              </h1>
            </>
          )}
        </CardHeader>
        {session && (
          <>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label
                      htmlFor="firstName"
                      className="text-sm font-medium text-muted-foreground"
                    >
                      First Name
                    </Label>
                    <p id="firstName" className="text-base font-semibold">
                      {user?.firstName}
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
                      {user?.lastName}
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
                    {user?.username}
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
                    {user?.id}
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
                    {user?.email}
                  </p>
                </div>
              </div>
            </CardContent>
          </>
        )}
        <CardFooter>
          <Button
            disabled={loading}
            className="w-full bg-white text-black hover:text-white hover:bg-black"
            onClick={() => {
              setLoading(true);
              if (session) {
                signOut();
              } else {
                signIn("azure-ad-b2c");
              }
            }}
          >
            {loading ? (
              <>
                <TailSpin
                  stroke="#000"
                  strokeWidth={2.5}
                  width={24}
                  height={24}
                  speed={2.5}
                />
              </>
            ) : (
              <>
                {session ? (
                  <>
                    <LogOut className="mr-2 h-4 w-4" />
                    {"Sign Out"}
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    {"Sign In"}
                  </>
                )}
              </>
            )}
            {/* {session ? "Sign Out" : "Sign In"} */}
          </Button>
        </CardFooter>
      </Card>
    </>
  );
}
