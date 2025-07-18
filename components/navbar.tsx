"use server";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { getInitials, getUserData } from "@/lib/auth/userData";
import Image from "next/image";
import Link from "next/link";

export default async function Navbar() {

  const userData = await getUserData();

  return (
    <header className="w-full py-2">
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
                <span className="text-2xl font-semibold max-sm:hidden p-2">
                  FileGilla
                </span>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink href="/dashboard" className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 max-sm:px-2 py-2 text-lg font-medium transition-colors hover:bg-grayHover focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50">
                Dashboard
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink href="/passwords" className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 max-sm:px-2 py-2 text-lg font-medium transition-colors hover:bg-grayHover focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50">
                Passwords
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              {userData ? (
                <NavigationMenuLink href={"/account"} className="group relative inline-flex h-9 w-max items-center justify-center rounded-md px-2 py-2 text-sm text-black font-bold transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50">
                  <Avatar>
                    <AvatarImage src={userData.image || ""} alt="User avatar" />
                    <AvatarFallback className="!bg-white">
                      {getInitials(userData.name)}
                    </AvatarFallback>
                  </Avatar>
                </NavigationMenuLink>
              ) : (
                <Link href={"/signin"}>Sign In</Link>
              )}
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </header>
  );
};