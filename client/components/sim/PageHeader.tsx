import type { LucideIcon } from "lucide-react";

export default function PageHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-12">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-secondary text-primary-foreground mb-4 glow-ring">
        <Icon className="w-6 h-6" />
      </div>
      <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-foreground">{title}</h1>
      <p className="text-lg text-muted-foreground max-w-2xl">{description}</p>
    </div>
  );
}
