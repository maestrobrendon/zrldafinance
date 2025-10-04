
import { FirebaseClientProvider } from "@/firebase";
import { Icons } from "@/components/icons";
import { Card } from "@/components/ui/card";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FirebaseClientProvider>
      <div className="flex min-h-screen flex-col items-center justify-center bg-[url('/auth-bg.svg')] bg-cover p-4">
        <Card className="w-full max-w-sm bg-card/95 backdrop-blur-sm border-white/10">
          <div className="flex justify-center pt-8 pb-4">
              <div className="p-3 rounded-xl bg-primary/20">
                  <Icons.logo className="h-8 w-8 text-primary" />
              </div>
          </div>
          {children}
        </Card>
        <div className="mt-4 text-center text-xs text-white/50 max-w-xs">
          Licensed by the Central Bank of Nigeria and insured by the NDIC.
        </div>
      </div>
    </FirebaseClientProvider>
  );
}
