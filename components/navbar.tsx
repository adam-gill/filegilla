"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import Image from "next/image";
import { useAuth } from "@/lib/useAuth";
import SignInButton from "./signInBtn";
import { useState } from "react";
import { LogIn } from "lucide-react";

const Navbar = () => {
  const { session } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);

  const getInitials = (): string => {
    if (session?.user) {
      if (session.user.firstName && session.user.lastName) {
        return session.user.firstName[0] + session.user.lastName[0];
      }
    }
    return "";
  };

  return (
    <header className="w-full py-2">
      <div className="flex h-16 items-center justify-between w-full max-w-6xl px-6 mx-auto">
        <NavigationMenu>
          <NavigationMenuList className="flex items-center gap-3 sm:gap-1">
              <NavigationMenuItem className="flex items-center gap-2 cursor-pointer">
                <NavigationMenuLink href="/" className="flex gap-2">
                <Image
                  src="/navLogo.png"
                  alt="FileGilla Logo"
                  width={100}
                  height={60}
                  className="w-10 h-6"
                />
                <span className="text-xl font-semibold sm:hidden">
                  FileGilla
                </span>
                </NavigationMenuLink>
              </NavigationMenuItem>
            <NavigationMenuItem>
                <NavigationMenuLink href="/dashboard" className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 sm:px-2 py-2 text-lg font-medium transition-colors hover:bg-grayHover focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50">
                  Dashboard
                </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
                <NavigationMenuLink href="/passwords" className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 sm:px-2 py-2 text-lg font-medium transition-colors hover:bg-grayHover focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50">
                  Passwords
                </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              {session?.user ? (
                <NavigationMenuLink href="/account" className="group relative inline-flex h-9 w-max items-center justify-center rounded-md px-2 py-2 text-sm text-black font-bold transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50">
                  <Avatar color="#ffffff">
                    <AvatarImage src="/circle.png" alt="User avatar" />
                    <AvatarFallback className="">
                      {getInitials()}
                    </AvatarFallback>
                    <p className="text-black z-10 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">{getInitials()}</p>
                  </Avatar>
                </NavigationMenuLink>
              ) : (
                <SignInButton loading={loading} setLoading={setLoading} tabIndex={0} content={<LogIn className="absolute w-5 h-5" />} className={"rounded-full w-10 h-10"} />
              )}
              
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </header>
  );
};

export default Navbar;
