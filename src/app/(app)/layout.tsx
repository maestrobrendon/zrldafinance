
"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { auth, app } from "@/lib/firebase";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
import AppSidebar from "@/components/layout/app-sidebar";
import BottomNavbar from "@/components/layout/bottom-navbar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Icons } from "@/components/icons";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize App Check
    if (typeof window !== "undefined") {
      try {
        initializeAppCheck(app, {
          provider: new ReCaptchaV3Provider("6Lezi90rAAAAAMuN5llIGC-8Tq7gcONr1RcBx9H_"),
          isTokenAutoRefreshEnabled: true,
        });
        console.log("App Check initialized");
      } catch (error) {
        console.error("Failed to initialize App Check", error);
      }
    }

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        // Allow access to signup/login while preventing redirect loops
        if (pathname !== "/login" && pathname !== "/signup") {
          router.push("/login");
        } else {
            setLoading(false);
        }
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router, pathname]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Icons.logo className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
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
