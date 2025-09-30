
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
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
import { user as initialUser } from "@/lib/data";
import { auth } from "@/lib/firebase";
import type { User } from 'firebase/auth';

const navItems = [
  { href: "/dashboard", icon: Icons.home, label: "Dashboard" },
  { href: "/zcash", icon: Icons.wallet, label: "ZCash" },
  { href: "/wallets", icon: Icons.logo, label: "Wallets" },
  { href: "/circles", icon: Icons.users, label: "Circles" },
  { href: "/settings", icon: Icons.settings, label: "Settings" },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
        setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, []);

  const displayName = user?.displayName || initialUser.name;
  const displayEmail = user?.email || initialUser.email;
  const photoURL = user?.photoURL || initialUser.avatarUrl;

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
                <AvatarImage src={photoURL} alt={displayName} data-ai-hint="avatar" />
                <AvatarFallback>{displayName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="overflow-hidden">
                    <p className="font-medium text-sm truncate">{displayName}</p>
                    <p className="text-xs text-muted-foreground truncate">{displayEmail}</p>
                </div>
            </div>
         </Link>
      </SidebarFooter>
    </Sidebar>
  );
}
