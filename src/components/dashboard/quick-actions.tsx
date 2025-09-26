"use client";

import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";

const actions = [
  { label: "Add", icon: Icons.add },
  { label: "Transfer", icon: Icons.send },
  { label: "Fund", icon: Icons.creditCard },
  { label: "Withdraw", icon: Icons.history },
];

export default function QuickActions() {
  return (
    <div className="grid grid-cols-4 gap-4">
      {actions.map((action) => (
        <div key={action.label} className="flex flex-col items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="w-16 h-16 rounded-full bg-card hover:bg-primary/10"
          >
            <action.icon className="h-6 w-6 text-primary" />
          </Button>
          <span className="text-sm font-medium">{action.label}</span>
        </div>
      ))}
    </div>
  );
}
