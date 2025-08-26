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
import { Check, Pencil, User, X } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { editUsername } from "../actions";
import { toast } from "@/hooks/use-toast";

export default function AccountCard() {
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const { data: session, isPending } = authClient.useSession();
  const [username, setUsername] = useState<string>("");
  const userData = session?.user;
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (session?.user.username) {
      setUsername(session?.user.username);
    }
  }, [session]);

  useEffect(() => {
    if (isEditingName && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditingName]);

  const handleUsernameEditCancel = () => {
    if (session?.user.username) {
      setUsername(session.user.username);
      setIsEditingName(false);
    }
    if (inputRef.current) {
      inputRef.current.blur();
    }
  };

  const handleUsernameEditSave = async () => {
    setIsEditingName(false);
    if (session?.user && session.user.username) {
      const { success, message } = await editUsername(
        session?.user.id,
        session?.user.username,
        username
      );

      if (success) {
        toast({
          title: "success!",
          description: message,
          variant: "good",
        });
      } else {
        if (session.user.username) {
          setUsername(session.user.username);
        }
        toast({
          title: "error",
          description: message,
          variant: "destructive",
        });
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      handleUsernameEditCancel();
    } else if (e.key === "Enter") {
      handleUsernameEditSave();
    }
  };

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
            <div className="cursor-pointer absolute bottom-0 left-1/2 -translate-x-1/2 bg-neutral-700/60 w-full flex items-center justify-center py-0.5">
              <Pencil className="h-3 w-3 my-0.5" />
            </div>
            <AvatarImage
              src={userData?.image || undefined}
              alt={userData?.name || "Avatar Image"}
            />
            <AvatarFallback className="!bg-black text-2xl">
              {userData ? (
                <>{getInitials(userData.name)}</>
              ) : (
                <User size={32} />
              )}
            </AvatarFallback>
          </Avatar>
          {userData ? (
            <div className="text-black">
              <CardTitle className="text-2xl">{userData.name}</CardTitle>
              <p className="text-lg text-muted-foreground">
                @{userData.username}
              </p>
            </div>
          ) : (
            <h1 className="text-2xl font-bold">
              sign in to view your account.{" "}
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
                    first name
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
                    last name
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
                  username
                </Label>
                {userData.username && (
                  <div className="flex items-center gap-1 w-min">
                    <Input
                      ref={inputRef}
                      type="text"
                      id="username"
                      className="p-0 h-fit text-lg font-semibold w-auto min-w-0 border-none shadow-none rounded-none focus-visible:outline-none"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      onKeyDown={handleKeyDown}
                      autoComplete="off"
                      disabled={!isEditingName}
                      style={{ width: `${username.length * 0.6}em` }}
                    />
                    <div>
                      {isEditingName && (
                        <div className="flex gap-3 max-md:gap-5">
                          <X
                            onClick={handleUsernameEditCancel}
                            className="text-red-500 stroke-3 cursor-pointer h-6 w-6"
                          />
                          <Check
                            onClick={handleUsernameEditSave}
                            className="text-green-700 stroke-3 cursor-pointer h-6 w-6"
                          />
                        </div>
                      )}
                      {!isEditingName && (
                        <Pencil
                          onClick={() => setIsEditingName((prev) => !prev)}
                          className="h-4 w-4 cursor-pointer"
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div>
                <Label
                  htmlFor="id"
                  className="text-base font-medium text-muted-foreground"
                >
                  user id
                </Label>
                <p id="id" className="text-lg font-semibold break-all">
                  {userData.id}
                </p>
              </div>
              <div>
                <Label
                  htmlFor="email"
                  className="text-base font-medium text-muted-foreground"
                >
                  email
                </Label>
                <p id="email" className="text-lg font-semibold">
                  {userData.email}
                </p>
              </div>
            </div>
          </CardContent>
        )}
        <CardFooter>{session ? <SignOutBtn /> : <SignInBtn />}</CardFooter>
      </Card>
    </>
  );
}
