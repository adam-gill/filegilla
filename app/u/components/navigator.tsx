import Link from "next/link";
import React from "react";

import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavigatorProps {
  location: string[];
}

export default function Navigator({ location }: NavigatorProps) {
  const paths = ["u", ...location];

  // if paths = ["u", "lebron", "james"] and you're given 1 return "/u/lebron"
  const makeLink = (index: number): string => {
    return "/" + paths.slice(0, index + 1).join("/");
  };

  return (
    <Breadcrumb className="font-bold py-3">
      <BreadcrumbList className="text-xl max-md:text-lg">
        {paths.length < 4 ? (
          <>
            {paths.map((path, index) => (
              <React.Fragment key={index}>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild className="text-white">
                    <Link href={makeLink(index)}>
                      {path}
                      {(index !== paths.length - 1 ||
                        !paths[index].includes(".")) && (
                          <div className="border-t-1 w-full h-px"></div>
                        )}
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {index !== paths.length - 1 && (
                  <BreadcrumbSeparator className="stroke-white" />
                )}
              </React.Fragment>
            ))}
          </>
        ) : (
          <>
            <BreadcrumbItem>
              <BreadcrumbLink asChild className="text-white">
                <Link href={"/u"}>
                  u<div className="border-t-1 w-full h-px"></div>
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="stroke-white" />
            <BreadcrumbItem>
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1 cursor-pointer ring-none outline-none">
                  <BreadcrumbEllipsis className="size-6 text-white" />
                  <span className="sr-only">Toggle menu</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {paths.slice(1, -2).map((path, index) => (
                    <Link
                      key={index}
                      className="cursor-pointer"
                      href={makeLink(index + 1)}
                    >
                      <DropdownMenuItem className="cursor-pointer">
                        {path}
                      </DropdownMenuItem>
                    </Link>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="stroke-white" />

            <BreadcrumbItem>
              <BreadcrumbLink asChild className="text-white">
                <Link href={makeLink(paths.length - 2)}>
                  {paths[paths.length - 2]}
                  <div className="border-t-1 w-full h-px"></div>
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="stroke-white" />
            <BreadcrumbItem>
              <BreadcrumbLink asChild className="text-white">
                <Link href={makeLink(paths.length - 1)}>
                  {paths[paths.length - 1]}
                  {!paths[paths.length - 1].includes(".") && (
                    <div className="border-t-1 w-full h-px"></div>
                  )}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
