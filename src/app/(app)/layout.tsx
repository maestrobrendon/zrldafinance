import AppSidebar from "@/components/layout/app-sidebar";
import BottomNavbar from "@/components/layout/bottom-navbar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen w-full">
        <AppSidebar />
        <SidebarInset>
          <main className="p-4 sm:p-6 lg:p-8 bg-background pb-24 md:pb-8">
            {children}
          </main>
        </SidebarInset>
        <BottomNavbar />
      </div>
    </SidebarProvider>
  );
}
