"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", icon: Icons.dashboard, label: "Home" },
  { href: "/wallets", icon: Icons.wallet, label: "Wallets" },
  { href: "/circles", icon: Icons.users, label: "Circles" },
  { href: "/transactions", icon: Icons.transactions, label: "History" },
];

export default function BottomNavbar() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 border-t bg-background/95 backdrop-blur-sm md:hidden z-50">
      <nav className="flex h-full items-center justify-around">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1 text-xs font-medium transition-colors",
              pathname.startsWith(item.href)
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
