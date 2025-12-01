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
import { LogIn, ChevronDown } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useMobile } from "@/hooks/use-mobile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

export default function Navbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const { data: session, isPending } = authClient.useSession();
  const userData = session?.user;
  const pathname = usePathname();
  const isLanding = pathname === "/";
  const isMobile = useMobile();
  const router = useRouter();

  if (pathname === "/auth") {
    return;
  } else {
    return (
      <header className="w-full fixed top-0 left-0 right-0 z-50 bg-inherit mb-16">
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
                  {isMobile && !isLanding ? (
                    <DropdownMenu
                      open={isDropdownOpen}
                      onOpenChange={() => setIsDropdownOpen((prev) => !prev)}
                    >
                      <DropdownMenuTrigger className="flex items-center gap-1 text-xl font-semibold p-2 focus:outline-none">
                        <span className="text-2xl font-semibold p-2">
                          filegilla
                        </span>
                        <ChevronDown
                          className={`w-5 h-5 stroke-[3.5] transition-transform duration-300 ease-in-out ${
                            isDropdownOpen ? "rotate-180" : ""
                          }`}
                        />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          onClick={() => {
                            setIsDropdownOpen(false);
                            setTimeout(() => router.push("/u"), 100);
                          }}
                          className="cursor-pointer text-lg"
                        >
                          dashboard
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setIsDropdownOpen(false);
                            setTimeout(() => router.push("/posts"), 100);
                          }}
                          className="cursor-pointer text-lg"
                        >
                          posts
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <span className="text-2xl font-semibold p-2">
                      filegilla
                    </span>
                  )}
                </NavigationMenuLink>
              </NavigationMenuItem>
              {!isLanding && (
                <>
                  <NavigationMenuItem>
                    <NavigationMenuLink
                      href="/u"
                      className="max-md:hidden group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 max-sm:px-2 py-2 text-lg font-medium transition-colors hover:bg-grayHover focus:bg-accent focus:text-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
                    >
                      dashboardP
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuLink
                      href="/posts"
                      className="max-md:hidden group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 max-sm:px-2 py-2 text-lg font-medium transition-colors hover:bg-grayHover focus:bg-accent focus:text-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
                    >
                      posts
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
}
