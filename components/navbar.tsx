"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { authClient } from "@/lib/auth/auth-client";
import { getInitials } from "@/lib/helpers";
import Image from "next/image";
import { Skeleton } from "./ui/skeleton";
import { LogIn } from "lucide-react";

interface NavbarProps {
  isLanding?: boolean;
}

export default function Navbar({ isLanding }: NavbarProps) {
  const { data: session, isPending } = authClient.useSession();
  const userData = session?.user;

  return (
    <header className="w-full pt-1">
      <div className="flex h-16 items-center justify-between w-full max-w-6xl px-6 mx-auto">
        <NavigationMenu>
          <NavigationMenuList className="flex items-center gap-3 sm:gap-1">
            <NavigationMenuItem className="flex items-center gap-2 cursor-pointer">
              <NavigationMenuLink href="/" className="flex gap-2 cc">
                <Image
                  src="/navLogo.png"
                  alt="FileGilla Logo"
                  width={100}
                  height={60}
                  className="w-10 h-6"
                />
                <span className="text-2xl font-semibold p-2">filegilla</span>
              </NavigationMenuLink>
            </NavigationMenuItem>
            {!isLanding && (
              <>
                <NavigationMenuItem>
                  <NavigationMenuLink
                    href="/u"
                    className="max-md:hidden group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 max-sm:px-2 py-2 text-lg font-medium transition-colors hover:bg-grayHover focus:bg-accent focus:text-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
                  >
                    dashboard
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </>
            )}
          </NavigationMenuList>
        </NavigationMenu>
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
                <NavigationMenuLink
                  href={!isPending && !userData ? "/auth" : "/account"}
                  className="max-md:p-0 group relative inline-flex h-9 w-max items-center justify-center rounded-md px-2 py-2 text-sm text-black font-bold transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
                >
                  {userData ? (
                    <Avatar>
                      <AvatarImage
                        src={userData.image || ""}
                        alt="User avatar"
                      />
                      <AvatarFallback className="text-white">
                        {getInitials(userData.name)}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <>
                      {isPending ? (
                        <Skeleton className="rounded-full h-10 w-10 !bg-neutral-50/10" />
                      ) : (
                        <div className="w-[50px] h-[50px] bg-white flex items-center justify-center rounded-full">
                          <LogIn className="text-black" />
                        </div>
                      )}
                    </>
                  )}
                </NavigationMenuLink>
              
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </header>
  );
}
