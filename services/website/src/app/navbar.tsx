"use client";

import { ChevronDown, LogOut, Server } from "lucide-react";
import Link from "next/link";
import type { Session } from "next-auth";
import React from "react";
import { ModeToggle } from "../components/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenuTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";

export default function NavBar({
  session,
}: {
  readonly session: Session | null;
}) {
  return (
    <div className="ml-5 flex h-[5%] py-2">
      <NavigationMenu>
        <NavigationMenuList>
          <Avatar>
            <AvatarImage src="https://avatars.githubusercontent.com/u/81372048?s=200&v=4" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div className="text-sm font-medium">Sleepy Maid</div>
        </NavigationMenuList>
      </NavigationMenu>
      <div className="absolute right-0 mr-5 flex">
        <NavigationMenu>
          <NavigationMenuList>
            {session ? (
              <div className="flex">
                <NavigationMenuItem className="mr-3">
                  <ModeToggle />
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline">
                        <Avatar>
                          <AvatarImage
                            src={
                              session.user?.image ??
                              "https://avatars.githubusercontent.com/u/81372048?s=200&v=4"
                            }
                          />
                          <AvatarFallback>
                            {session.user?.name
                              ?.split(" ")
                              .map((name) => name[0])}
                          </AvatarFallback>
                        </Avatar>
                        <div className="ml-2 align-middle">
                          {session.user?.name}
                        </div>
                        <ChevronDown />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Server className="pr-2" />
                        <Link href="/dashboard">Servers</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <LogOut className="pr-2" />
                        <Link href="/api/auth/signout">Sign out</Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </NavigationMenuItem>
              </div>
            ) : (
              <div className="flex">
                <NavigationMenuItem className="mr-3">
                  <ModeToggle />
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Button variant="outline">
                    <Link href="/api/auth/signin">Login</Link>
                  </Button>
                </NavigationMenuItem>
              </div>
            )}
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </div>
  );
}
