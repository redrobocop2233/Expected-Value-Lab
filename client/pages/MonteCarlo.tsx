import { useMemo, useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/sim/PageHeader";
import StatGrid from "@/components/sim/StatGrid";
import LineChartCard from "@/components/sim/LineChartCard";
import InsightBox from "@/components/sim/InsightBox";
import EmptyState from "@/components/sim/EmptyState";
import { ConfigPanel, SelectField } from "@/components/sim/Fields";
import { FlaskConical, Play, RotateCcw } from "lucide-react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ZAxis,
} from "recharts";

interface Point {
  x: number;
  y: number;
}

interface SimResult {
  inside: Point[];
  outside: Point[];
  convergence: { n: number; estimate: number }[];
  piEstimate: number;
  standardError: number;
  insideCount: number;
  totalCount: number;
}

function simulate(numPoints: number): SimResult {
  const inside: Point[] = [];
  const outside: Point[] = [];
  const convergence: { n: number; estimate: number }[] = [];
  const displayCap = 1500;
  const step = Math.max(1, Math.floor(numPoints / 300));
  let insideCount = 0;

  for (let i = 0; i < numPoints; i++) {
    const x = Math.random() * 2 - 1;
    const y = Math.random() * 2 - 1;
    const isInside = x * x + y * y <= 1;
    if (isInside) insideCount++;
    if (i < displayCap) (isInside ? inside : outside).push({ x, y });
    if ((i + 1) % step === 0 || i === numPoints - 1) {
      convergence.push({ n: i + 1, estimate: (insideCount / (i + 1)) * 4 });
    }
  }

  const p = insideCount / numPoints;
  const standardError = 4 * Math.sqrt((p * (1 - p)) / numPoints);
  return {
    inside,
    outside,
    convergence,
    piEstimate: p * 4,
    standardError,
    insideCount,
    totalCount: numPoints,
  };
}

export default function MonteCarlo() {
  const [numPoints, setNumPoints] = useState(5000);
  const [result, setResult] = useState<SimResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const handleSimulate = () => {
    setIsRunning(true);
    setTimeout(() => {
      setResult(simulate(numPoints));
      setIsRunning(false);
    }, 50);
  };

  const error = result ? Math.abs(result.piEstimate - Math.PI) : 0;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <PageHeader
          icon={FlaskConical}
          title="Monte Carlo Laboratory"
          description="The classic Monte Carlo experiment: scatter random points across a square, count how many land inside the inscribed circle, and watch a surprisingly good estimate of π fall out of pure randomness."
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <ConfigPanel>
              <h2 className="text-xl font-bold">Configuration</h2>

              <SelectField
                label="Number of Random Points"
                value={numPoints}
                disabled={isRunning}
                onChange={(v) => setNumPoints(Number(v))}
                options={[500, 5000, 20000, 100000].map((n) => ({
                  value: n,
                  label: n.toLocaleString(),
                }))}
              />

              <p className="text-xs text-muted-foreground">
                Points are drawn uniformly in a 2×2 square centered at the
                origin. A point lands "inside" if it falls within distance 1
                of the center — i.e., inside the inscribed circle.
              </p>

              <div className="space-y-2 pt-4">
                <Button
                  onClick={handleSimulate}
                  disabled={isRunning}
                  className="w-full bg-gradient-to-r from-primary to-secondary text-primary-foreground font-bold hover:opacity-90 glow-ring"
                >
                  <Play className="w-4 h-4 mr-2" />
                  {isRunning ? "Running..." : "Run Simulation"}
                </Button>
                <Button
                  onClick={() => setResult(null)}
                  disabled={isRunning || !result}
                  variant="outline"
                  className="w-full"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              </div>
            </ConfigPanel>
          </div>

          <div className="lg:col-span-2 space-y-8">
            {result ? (
              <>
                <div>
                  <h2 className="text-2xl font-bold mb-4">Results</h2>
                  <StatGrid
                    stats={[
                      { label: "π Estimate", value: result.piEstimate.toFixed(5), color: "text-primary" },
                      { label: "Actual π", value: Math.PI.toFixed(5) },
                      { label: "Absolute Error", value: error.toFixed(5) },
                      { label: "95% Confidence Interval", value: `± ${(1.96 * result.standardError).toFixed(5)}` },
                      { label: "Points Inside Circle", value: `${result.insideCount.toLocaleString()} / ${result.totalCount.toLocaleString()}` },
                    ]}
                  />
                </div>

                <div className="bg-card border border-accent/20 rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Point Scatter {result.totalCount > 1500 ? "(first 1,500 shown)" : ""}
                  </h3>
                  <ResponsiveContainer width="100%" height={340}>
                    <ScatterChart>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis type="number" dataKey="x" domain={[-1, 1]} stroke="hsl(var(--muted-foreground))" />
                      <YAxis type="number" dataKey="y" domain={[-1, 1]} stroke="hsl(var(--muted-foreground))" />
                      <ZAxis range={[12, 12]} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Scatter data={result.inside} fill="hsl(var(--primary))" />
                      <Scatter data={result.outside} fill="hsl(var(--muted-foreground))" />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>

                <LineChartCard
                  title="π Estimate Converging"
                  data={result.convergence}
                  xKey="n"
                  lines={[{ dataKey: "estimate", name: "Estimate", color: "hsl(var(--primary))" }]}
                  referenceLine={{ y: Math.PI, label: "Actual π" }}
                />

                <InsightBox icon={FlaskConical}>
                  The area of the circle is π·r², the square is (2r)² = 4r², so
                  the ratio of points landing inside the circle to the total
                  approximates π/4. With {result.totalCount.toLocaleString()}{" "}
                  points, the estimate was {result.piEstimate.toFixed(5)} against
                  the true value of {Math.PI.toFixed(5)} — a 95% confidence
                  interval of ±{(1.96 * result.standardError).toFixed(5)}. This
                  is the same core technique — random sampling to estimate a
                  quantity that's hard to compute directly — used to price
                  options, simulate particle physics, and evaluate poker
                  equities elsewhere on this site.
                </InsightBox>
              </>
            ) : (
              <EmptyState description='Click "Run Simulation" to estimate π using nothing but randomness.' />
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
