import { AppLogo } from "@/components/app-logo";
import { Card } from "@/components/ui/card";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <div className="flex justify-center pt-8 pb-4">
          <AppLogo />
        </div>
        {children}
      </Card>
    </div>
  );
}
