
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", icon: Icons.home, label: "Home" },
  { href: "/zcash", icon: Icons.wallet, label: "ZCash" },
  { href: "/wallets", icon: Icons.logo, label: "Wallets" },
  { href: "/circles", icon: Icons.users, label: "Circles" },
  { href: "/settings", icon: Icons.user, label: "Profile" },
];

export default function BottomNavbar() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 bg-transparent md:hidden z-50">
       <div className="relative h-full">
         <div className="absolute bottom-0 left-0 right-0 h-16 bg-background/95 backdrop-blur-sm border-t"></div>
        <nav className="relative grid grid-cols-5 h-full items-center justify-around">
            {navItems.map((item, index) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            
            if (item.label === 'Wallets') {
                return (
                    <div key={item.href} className="flex flex-col items-center justify-center -mt-6">
                        <Link
                            href={item.href}
                            className="flex items-center justify-center h-16 w-16 rounded-full bg-primary text-primary-foreground shadow-lg border-4 border-background"
                        >
                            <item.icon className="h-7 w-7" />
                        </Link>
                        <span className={cn(
                            "text-xs font-medium transition-colors mt-1",
                            isActive ? "text-primary" : "text-muted-foreground"
                        )}>
                            {item.label}
                        </span>
                    </div>
                );
            }

            return (
            <Link
                key={item.href}
                href={item.href}
                className={cn(
                "flex flex-col items-center gap-1 text-xs font-medium transition-colors",
                isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
            >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
            </Link>
            );
        })}
        </nav>
      </div>
    </div>
  );
}
