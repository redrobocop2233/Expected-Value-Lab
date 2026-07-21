import { useMemo, useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/sim/PageHeader";
import StatGrid from "@/components/sim/StatGrid";
import LineChartCard from "@/components/sim/LineChartCard";
import InsightBox from "@/components/sim/InsightBox";
import EmptyState from "@/components/sim/EmptyState";
import { ConfigPanel, RadioField, SliderField, SelectField } from "@/components/sim/Fields";
import { pct, stdDev } from "@/lib/stats";
import { Target, Play, RotateCcw } from "lucide-react";

interface Preset {
  key: string;
  label: string;
  winProbability: number; // 0-1
  winMultiplier: number; // net profit per unit staked on a win
}

const presets: Preset[] = [
  { key: "coin", label: "Fair coin flip (double or nothing)", winProbability: 0.5, winMultiplier: 1 },
  { key: "roulette", label: "Single-number roulette bet (pays 35:1)", winProbability: 1 / 37, winMultiplier: 35 },
  { key: "unfavorable", label: "Slightly unfavorable game (45% win, even money)", winProbability: 0.45, winMultiplier: 1 },
  { key: "custom", label: "Custom", winProbability: 0.5, winMultiplier: 1 },
];

function theoreticalEV(p: number, x: number): number {
  return p * x - (1 - p) * 1;
}

export default function ExpectedValue() {
  const [presetKey, setPresetKey] = useState("roulette");
  const [customP, setCustomP] = useState(20);
  const [customX, setCustomX] = useState(3);
  const [trials, setTrials] = useState(2000);
  const [results, setResults] = useState<number[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const active =
    presetKey === "custom"
      ? { winProbability: customP / 100, winMultiplier: customX }
      : presets.find((p) => p.key === presetKey)!;

  const ev = theoreticalEV(active.winProbability, active.winMultiplier);

  const chartData = useMemo(() => {
    if (results.length === 0) return [];
    const points: { trial: number; average: number }[] = [];
    let sum = 0;
    const step = Math.max(1, Math.floor(results.length / 300));
    results.forEach((r, i) => {
      sum += r;
      if ((i + 1) % step === 0 || i === results.length - 1) {
        points.push({ trial: i + 1, average: sum / (i + 1) });
      }
    });
    return points;
  }, [results]);

  const stats = useMemo(() => {
    if (results.length === 0) return null;
    const average = results.reduce((a, b) => a + b, 0) / results.length;
    const sd = stdDev(results);
    const standardError = sd / Math.sqrt(results.length);
    return { average, sd, standardError };
  }, [results]);

  const handleSimulate = () => {
    setIsRunning(true);
    setTimeout(() => {
      const out: number[] = [];
      for (let i = 0; i < trials; i++) {
        const won = Math.random() < active.winProbability;
        out.push(won ? active.winMultiplier : -1);
      }
      setResults(out);
      setIsRunning(false);
    }, 50);
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <PageHeader
          icon={Target}
          title="Expected Value Lab"
          description="Every bet in this whole site reduces to one number: expected value. Build a simple wager and watch the simulated average converge toward it as the sample size grows — the law of large numbers, live."
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <ConfigPanel>
              <h2 className="text-xl font-bold">Configuration</h2>

              <RadioField
                label="Wager"
                name="preset"
                value={presetKey}
                disabled={isRunning}
                onChange={setPresetKey}
                options={presets.map((p) => ({ value: p.key, label: p.label }))}
              />

              {presetKey === "custom" && (
                <>
                  <SliderField
                    label="Win Probability"
                    value={customP}
                    min={1}
                    max={99}
                    disabled={isRunning}
                    onChange={setCustomP}
                    format={(v) => `${v}%`}
                  />
                  <SliderField
                    label="Net Payout on Win"
                    value={customX}
                    min={0.5}
                    max={50}
                    step={0.5}
                    disabled={isRunning}
                    onChange={setCustomX}
                    format={(v) => `${v}x stake`}
                    hint="Profit per unit staked; a loss always costs 1 unit"
                  />
                </>
              )}

              <div className="bg-muted/50 rounded-lg p-3 text-sm">
                <span className="text-muted-foreground">Theoretical EV: </span>
                <span className={`font-bold ${ev >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {ev >= 0 ? "+" : ""}
                  {pct(ev * 100)} per unit staked
                </span>
              </div>

              <SelectField
                label="Number of Trials"
                value={trials}
                disabled={isRunning}
                onChange={(v) => setTrials(Number(v))}
                options={[100, 500, 2000, 10000, 50000].map((n) => ({
                  value: n,
                  label: n.toLocaleString(),
                }))}
              />

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
                  onClick={() => setResults([])}
                  disabled={isRunning || results.length === 0}
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
            {results.length > 0 && stats ? (
              <>
                <div>
                  <h2 className="text-2xl font-bold mb-4">Results</h2>
                  <StatGrid
                    stats={[
                      { label: "Theoretical EV", value: pct(ev * 100), color: ev >= 0 ? "text-emerald-400" : "text-red-400" },
                      {
                        label: "Simulated Average",
                        value: pct(stats.average * 100),
                        color: stats.average >= 0 ? "text-emerald-400" : "text-red-400",
                      },
                      { label: "Std Dev per Trial", value: pct(stats.sd * 100) },
                      { label: "Standard Error", value: pct(stats.standardError * 100) },
                    ]}
                  />
                </div>

                <LineChartCard
                  title="Simulated Average Converging to EV"
                  data={chartData}
                  xKey="trial"
                  lines={[{ dataKey: "average", name: "Running average", color: "hsl(var(--primary))" }]}
                  referenceLine={{ y: ev, label: "Theoretical EV" }}
                />

                <InsightBox>
                  The theoretical expected value here is {pct(ev * 100)} per unit
                  staked. Early in the run the average bounces around
                  wildly — that's the standard error, which shrinks
                  proportional to 1/√n. After {results.length.toLocaleString()}{" "}
                  trials the simulated average settled at {pct(stats.average * 100)}
                  , within a standard error of {pct(stats.standardError * 100)} of
                  the true value. This is the entire reason casinos, insurers,
                  and index funds can predict their long-run results precisely
                  even though any single bet, claim, or trading day is
                  essentially a coin toss.
                </InsightBox>
              </>
            ) : (
              <EmptyState description='Pick a wager on the left and click "Run Simulation" to watch the average converge toward its expected value.' />
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
