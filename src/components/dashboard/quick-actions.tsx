import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";

const actions = [
  { label: "Send Money", icon: Icons.send },
  { label: "Request Funds", icon: Icons.receive },
  { label: "Pay Bills", icon: Icons.dollarSign },
  { label: "Add Wallet", icon: Icons.add },
];

export default function QuickActions() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {actions.map((action) => (
        <Button
          key={action.label}
          variant="outline"
          className="flex flex-col items-center justify-center h-24 gap-2"
        >
          <action.icon className="h-6 w-6 text-primary" />
          <span className="text-sm font-medium">{action.label}</span>
        </Button>
      ))}
    </div>
  );
}
