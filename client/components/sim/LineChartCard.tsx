import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";

export interface ChartLine {
  dataKey: string;
  name?: string;
  color: string;
}

export default function LineChartCard({
  title,
  data,
  xKey,
  lines,
  yDomain,
  referenceLine,
  height = 300,
  legend,
  yScale,
}: {
  title: string;
  data: Record<string, number>[];
  xKey: string;
  lines: ChartLine[];
  yDomain?: [number | "auto", number | "auto"];
  referenceLine?: { y: number; label: string };
  height?: number;
  legend?: boolean;
  yScale?: "auto" | "log";
}) {
  return (
    <div className="bg-card border border-accent/20 rounded-xl p-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey={xKey} stroke="hsl(var(--muted-foreground))" />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            domain={yDomain ?? (yScale === "log" ? [1, "auto"] : undefined)}
            scale={yScale === "log" ? "log" : "linear"}
            allowDataOverflow={yScale === "log"}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
            }}
          />
          {(legend ?? lines.length > 1) && <Legend />}
          {referenceLine && (
            <ReferenceLine
              y={referenceLine.y}
              stroke="hsl(var(--muted-foreground))"
              strokeDasharray="4 4"
              label={{
                value: referenceLine.label,
                fill: "hsl(var(--muted-foreground))",
                fontSize: 12,
                position: "insideTopLeft",
              }}
            />
          )}
          {lines.map((line) => (
            <Line
              key={line.dataKey}
              type="monotone"
              dataKey={line.dataKey}
              name={line.name ?? line.dataKey}
              stroke={line.color}
              dot={false}
              strokeWidth={2}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
