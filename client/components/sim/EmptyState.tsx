import { Zap, type LucideIcon } from "lucide-react";

export default function EmptyState({
  title = "Ready to simulate?",
  description = "Configure the parameters on the left and click \"Run Simulation\" to see how probability plays out.",
  icon: Icon = Zap,
}: {
  title?: string;
  description?: string;
  icon?: LucideIcon;
}) {
  return (
    <div className="bg-card/50 border border-dashed border-accent/30 rounded-xl p-12 text-center">
      <Icon className="w-12 h-12 text-accent/70 mx-auto mb-4" />
      <h3 className="text-lg font-semibold mb-2 text-foreground">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
