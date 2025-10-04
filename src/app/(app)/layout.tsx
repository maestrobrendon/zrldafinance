
"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { FirebaseClientProvider, useUser } from "@/firebase";
import AppSidebar from "@/components/layout/app-sidebar";
import BottomNavbar from "@/components/layout/bottom-navbar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Icons } from "@/components/icons";

function AppContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isUserLoading } = useUser();

  useEffect(() => {
    if (!isUserLoading) {
      if (!user) {
        // Allow access to signup/login while preventing redirect loops
        if (pathname !== "/login" && pathname !== "/signup") {
          router.push("/login");
        }
      }
    }
  }, [user, isUserLoading, router, pathname]);

  if (isUserLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Icons.logo className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }
  
  // Render children only if user is loaded and authenticated,
  // or if they are on a public auth page.
  const isAuthPage = pathname === "/login" || pathname === "/signup";
  if (!user && !isAuthPage) {
      // Don't render children until redirect is complete
      return null;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full">
        <AppSidebar />
        <SidebarInset>
          <main className="p-4 sm:p-6 lg:p-8 bg-background pb-28 md:pb-8">
            {children}
          </main>
        </SidebarInset>
        <BottomNavbar />
      </div>
    </SidebarProvider>
  );
}


export default function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <FirebaseClientProvider>
            <AppContent>{children}</AppContent>
        </FirebaseClientProvider>
    )
}

    