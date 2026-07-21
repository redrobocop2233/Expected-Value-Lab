export interface Stat {
  label: string;
  value: string;
  color?: string;
}

export default function StatGrid({ stats }: { stats: Stat[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-card border border-border rounded-lg p-4 hover:border-accent/30 transition-colors"
        >
          <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
          <p className={`text-2xl font-bold ${stat.color ?? "text-foreground"}`}>
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  );
}
