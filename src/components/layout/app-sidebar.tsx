
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Icons } from "@/components/icons";
import { AppLogo } from "@/components/app-logo";
import { user } from "@/lib/data";

const navItems = [
  { href: "/dashboard", icon: Icons.home, label: "Dashboard" },
  { href: "/zcash", icon: Icons.wallet, label: "ZCash" },
  { href: "/wallets", icon: Icons.logo, label: "Wallets" },
  { href: "/circles", icon: Icons.users, label: "Circles" },
  { href: "/settings", icon: Icons.settings, label: "Settings" },
];

export default function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar className="hidden md:flex">
      <SidebarHeader>
        <AppLogo />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith(item.href)}
                tooltip={item.label}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
         <Link href="/settings" className="block w-full">
            <div className="flex items-center gap-3 p-2 rounded-md hover:bg-accent">
                <Avatar className="h-9 w-9">
                <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="avatar" />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="overflow-hidden">
                    <p className="font-medium text-sm truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
            </div>
         </Link>
      </SidebarFooter>
    </Sidebar>
  );
}
