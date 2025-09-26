import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";

export function AppLogo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Icons.logo className="h-6 w-6 text-primary" />
      <span className="text-lg font-semibold text-foreground">
        Zrlda Finance
      </span>
    </div>
  );
}
