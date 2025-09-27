"use client";
import * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { signOut } from "@/lib/auth-client";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const lastItem = pathname.split("/").at(-1);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut();
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };
  const data = {
    navMain: [
      {
        title: "Collections",
        url: "/dashboard",
        items: [
          {
            title: "Member",
            url: "/dashboard/member",
            isActive: lastItem === "member",
          },
          {
            title: "Warta",
            url: "/dashboard/warta",
            isActive: lastItem === "warta",
          },
          {
            title: "Event",
            url: "/dashboard/event",
            isActive: lastItem === "event",
          },
          {
            title: "Kebaktian",
            url: "/dashboard/kebaktian",
            isActive: lastItem === "kebaktian",
          },
          {
            title: "Pelayanan",
            url: "/dashboard/pelayanan",
            isActive: lastItem === "pelayanan",
          },
        ],
      },
    ],
  };

  return (
    <Sidebar {...props}>
      <SidebarContent className="pt-8">
        {/* We create a SidebarGroup for each parent. */}
        {data.navMain.map((item) => (
          <SidebarGroup key={item.title}>
            <SidebarGroupLabel>
              <Link href={item.url}> {item.title}</Link>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {item.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={item.isActive}>
                      <Link href={item.url}>{item.title}</Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarRail />
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLogout}
        className="flex w-fit m-4 items-center space-x-2"
      >
        <LogOut className="h-4 w-4" />
        <span>Logout</span>
      </Button>
    </Sidebar>
  );
}
