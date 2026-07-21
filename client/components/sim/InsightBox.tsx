import { Info, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export default function InsightBox({
  title = "Key Insight",
  icon: Icon = Info,
  children,
}: {
  title?: string;
  icon?: LucideIcon;
  children: ReactNode;
}) {
  return (
    <div className="bg-card border border-accent/25 rounded-xl p-6 glow-ring-accent">
      <div className="flex gap-3">
        <Icon className="w-6 h-6 text-accent flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold mb-2 text-accent">{title}</h3>
          <p className="text-sm text-muted-foreground">{children}</p>
        </div>
      </div>
    </div>
  );
}
