import { useMemo, useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/sim/PageHeader";
import StatGrid from "@/components/sim/StatGrid";
import LineChartCard from "@/components/sim/LineChartCard";
import InsightBox from "@/components/sim/InsightBox";
import EmptyState from "@/components/sim/EmptyState";
import { ConfigPanel, SliderField, SelectField } from "@/components/sim/Fields";
import { money, pct } from "@/lib/stats";
import { TrendingDown, Play, RotateCcw } from "lucide-react";

interface Config {
  startingBankroll: number;
  targetBankroll: number;
  winProbability: number; // 0-100
  betSize: number;
}

const PALETTE = [
  "hsl(var(--primary))",
  "hsl(var(--secondary))",
  "hsl(var(--accent))",
  "hsl(var(--destructive))",
];

function theoreticalRuinProbability(i: number, N: number, p: number): number {
  const q = 1 - p;
  if (Math.abs(p - 0.5) < 1e-9) return 1 - i / N;
  const r = q / p;
  return (r ** N - r ** i) / (r ** N - 1);
}

function simulatePath(i: number, N: number, p: number, maxSteps: number) {
  let pos = i;
  const path = [pos];
  let steps = 0;
  while (pos > 0 && pos < N && steps < maxSteps) {
    pos += Math.random() < p ? 1 : -1;
    path.push(pos);
    steps++;
  }
  return { path, ruined: pos <= 0, steps };
}

function padPath(path: number[], length: number): number[] {
  if (path.length >= length) return path.slice(0, length);
  const last = path[path.length - 1];
  return [...path, ...Array(length - path.length).fill(last)];
}

export default function GamblersRuin() {
  const [config, setConfig] = useState<Config>({
    startingBankroll: 50,
    targetBankroll: 100,
    winProbability: 48.6,
    betSize: 1,
  });
  const [trials, setTrials] = useState(1000);
  const [result, setResult] = useState<{
    empiricalRuinRate: number;
    avgSteps: number;
    sampleChart: Record<string, number>[];
  } | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const i = Math.max(1, Math.round(config.startingBankroll / config.betSize));
  const N = Math.max(i + 1, Math.round(config.targetBankroll / config.betSize));
  const p = config.winProbability / 100;
  const theoretical = theoreticalRuinProbability(i, N, p);

  const handleSimulate = () => {
    setIsRunning(true);
    setTimeout(() => {
      let ruinCount = 0;
      let stepSum = 0;
      for (let t = 0; t < trials; t++) {
        const { ruined, steps } = simulatePath(i, N, p, 200000);
        if (ruined) ruinCount++;
        stepSum += steps;
      }

      const displayPaths = Array.from({ length: 12 }, () => simulatePath(i, N, p, 400));
      const maxLen = Math.max(...displayPaths.map((d) => d.path.length));
      const sampleChart = Array.from({ length: maxLen }, (_, step) => {
        const point: Record<string, number> = { step };
        displayPaths.forEach((d, idx) => {
          point[`path${idx}`] = padPath(d.path, maxLen)[step] * config.betSize;
        });
        return point;
      });

      setResult({
        empiricalRuinRate: (ruinCount / trials) * 100,
        avgSteps: stepSum / trials,
        sampleChart,
      });
      setIsRunning(false);
    }, 50);
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <PageHeader
          icon={TrendingDown}
          title="Gambler's Ruin Lab"
          description="If you keep playing a fixed-size bet until you either go broke or hit a target, the math has an exact answer for your odds of ruin. Compare the closed-form formula against thousands of simulated playthroughs."
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <ConfigPanel>
              <h2 className="text-xl font-bold">Configuration</h2>

              <SliderField
                label="Starting Bankroll"
                value={config.startingBankroll}
                min={10}
                max={500}
                step={5}
                disabled={isRunning}
                onChange={(startingBankroll) => setConfig({ ...config, startingBankroll })}
                format={money}
              />

              <SliderField
                label="Target Bankroll"
                value={config.targetBankroll}
                min={config.startingBankroll + 10}
                max={1000}
                step={5}
                disabled={isRunning}
                onChange={(targetBankroll) => setConfig({ ...config, targetBankroll })}
                format={money}
                hint="Stop and walk away once you reach this"
              />

              <SliderField
                label="Bet Size"
                value={config.betSize}
                min={1}
                max={20}
                disabled={isRunning}
                onChange={(betSize) => setConfig({ ...config, betSize })}
                format={money}
              />

              <SliderField
                label="Win Probability per Bet"
                value={config.winProbability}
                min={10}
                max={90}
                step={0.1}
                disabled={isRunning}
                onChange={(winProbability) => setConfig({ ...config, winProbability })}
                format={(v) => `${v.toFixed(1)}%`}
                hint="48.6% ≈ even-money roulette bet"
              />

              <SelectField
                label="Monte Carlo Trials"
                value={trials}
                disabled={isRunning}
                onChange={(v) => setTrials(Number(v))}
                options={[200, 1000, 5000].map((n) => ({ value: n, label: n.toLocaleString() }))}
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
                      { label: "Theoretical Ruin Probability", value: pct(theoretical * 100), color: "text-primary" },
                      { label: "Empirical Ruin Probability", value: pct(result.empiricalRuinRate) },
                      { label: "Average Bets to Absorption", value: result.avgSteps.toFixed(0) },
                      {
                        label: "Probability of Reaching Target",
                        value: pct(100 - theoretical * 100),
                        color: "text-emerald-400",
                      },
                    ]}
                  />
                </div>

                <LineChartCard
                  title="12 Sample Bankroll Paths"
                  data={result.sampleChart}
                  xKey="step"
                  legend={false}
                  lines={Array.from({ length: 12 }, (_, idx) => ({
                    dataKey: `path${idx}`,
                    color: PALETTE[idx % PALETTE.length],
                  }))}
                />

                <InsightBox>
                  Starting at {money(config.startingBankroll)} aiming for{" "}
                  {money(config.targetBankroll)} at a {pct(config.winProbability)} win
                  rate per bet, the closed-form gambler's ruin formula predicts a{" "}
                  {pct(theoretical * 100)} chance of going broke before reaching
                  the target — and the simulation landed at {pct(result.empiricalRuinRate)}
                  , confirming the formula. Notice how much the ruin probability
                  depends on the ratio between your bankroll and your target,
                  not just the win rate: playing with a small edge for a big
                  target is still very likely to end in ruin if your bankroll
                  is thin relative to that target.
                </InsightBox>
              </>
            ) : (
              <EmptyState description='Set your bankroll, target, and win rate, then click "Run Simulation" to see the odds.' />
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
