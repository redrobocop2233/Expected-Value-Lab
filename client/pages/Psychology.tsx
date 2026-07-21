import { useMemo, useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/sim/PageHeader";
import StatGrid from "@/components/sim/StatGrid";
import InsightBox from "@/components/sim/InsightBox";
import EmptyState from "@/components/sim/EmptyState";
import { ConfigPanel, SelectField } from "@/components/sim/Fields";
import {
  Brain,
  Play,
  RotateCcw,
  Flame,
  Scale,
  Anchor,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface SimResult {
  histogram: { length: string; count: number }[];
  avgLongest: number;
  exampleSeq: boolean[];
  exampleLongestStart: number;
  exampleLongestEnd: number;
}

function longestStreakRange(seq: boolean[]): [number, number] {
  let bestStart = 0;
  let bestLen = 1;
  let curStart = 0;
  let curLen = 1;
  for (let i = 1; i < seq.length; i++) {
    if (seq[i] === seq[i - 1]) {
      curLen++;
    } else {
      curStart = i;
      curLen = 1;
    }
    if (curLen > bestLen) {
      bestLen = curLen;
      bestStart = curStart;
    }
  }
  return [bestStart, bestStart + bestLen - 1];
}

function simulate(numFlips: number, numRuns: number): SimResult {
  const buckets = new Map<number, number>();
  let sumLongest = 0;
  let exampleSeq: boolean[] = [];

  for (let r = 0; r < numRuns; r++) {
    const seq = Array.from({ length: numFlips }, () => Math.random() < 0.5);
    if (r === 0) exampleSeq = seq;
    const [, end] = longestStreakRange(seq);
    let longest = 1;
    let current = 1;
    for (let i = 1; i < seq.length; i++) {
      current = seq[i] === seq[i - 1] ? current + 1 : 1;
      longest = Math.max(longest, current);
    }
    sumLongest += longest;
    const bucket = Math.min(longest, 12);
    buckets.set(bucket, (buckets.get(bucket) ?? 0) + 1);
    void end;
  }

  const histogram = Array.from({ length: 12 }, (_, idx) => {
    const len = idx + 1;
    return {
      length: len === 12 ? "12+" : String(len),
      count: buckets.get(len) ?? 0,
    };
  });

  const [start, end] = longestStreakRange(exampleSeq);
  return { histogram, avgLongest: sumLongest / numRuns, exampleSeq, exampleLongestStart: start, exampleLongestEnd: end };
}

const biases = [
  {
    icon: Brain,
    title: "Gambler's Fallacy",
    description:
      "Believing that after a run of one outcome, the other becomes 'due.' Each fair coin flip is independent — the coin has no memory of the last five flips.",
  },
  {
    icon: Flame,
    title: "Hot Hand Fallacy",
    description:
      "Believing a streak of wins means a player or machine is 'on a heater' and more likely to keep winning. In most gambling games, streaks are just the expected texture of randomness, not a signal.",
  },
  {
    icon: Scale,
    title: "Loss Aversion",
    description:
      "Losses tend to feel roughly twice as painful as equivalent gains feel good. This pushes people to chase losses or avoid locking in a fair result, which a purely rational EV calculation wouldn't do.",
  },
  {
    icon: Anchor,
    title: "Sunk Cost Fallacy",
    description:
      "Continuing to bet because of how much has already been lost, rather than because the odds going forward justify it. Money already wagered is gone either way — it shouldn't affect the next decision.",
  },
];

export default function Psychology() {
  const [numFlips, setNumFlips] = useState(100);
  const [numRuns, setNumRuns] = useState(2000);
  const [result, setResult] = useState<SimResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const theoreticalEstimate = Math.log2(numFlips);

  const handleSimulate = () => {
    setIsRunning(true);
    setTimeout(() => {
      setResult(simulate(numFlips, numRuns));
      setIsRunning(false);
    }, 50);
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <PageHeader
          icon={Brain}
          title="Psychology & Biases Lab"
          description="Randomness doesn't look the way our intuition expects. This lab simulates thousands of fair coin-flip sequences to show just how long 'unlikely' streaks really run — no fallacy required, just probability."
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <ConfigPanel>
              <h2 className="text-xl font-bold">Configuration</h2>

              <SelectField
                label="Flips per Sequence"
                value={numFlips}
                disabled={isRunning}
                onChange={(v) => setNumFlips(Number(v))}
                options={[50, 100, 200, 500].map((n) => ({ value: n, label: n.toLocaleString() }))}
              />

              <SelectField
                label="Number of Sequences"
                value={numRuns}
                disabled={isRunning}
                onChange={(v) => setNumRuns(Number(v))}
                options={[500, 2000, 5000, 10000].map((n) => ({ value: n, label: n.toLocaleString() }))}
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
                      { label: "Average Longest Streak", value: result.avgLongest.toFixed(2) },
                      { label: "Rough Theoretical Estimate", value: theoreticalEstimate.toFixed(2) },
                      { label: "Sequences Simulated", value: numRuns.toLocaleString() },
                      { label: "Flips per Sequence", value: numFlips.toLocaleString() },
                    ]}
                  />
                </div>

                <div className="bg-card border border-accent/20 rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-4">
                    One Example Sequence (longest streak highlighted)
                  </h3>
                  <div className="flex flex-wrap gap-1">
                    {result.exampleSeq.map((v, i) => {
                      const inStreak = i >= result.exampleLongestStart && i <= result.exampleLongestEnd;
                      return (
                        <span
                          key={i}
                          className={`w-6 h-6 flex items-center justify-center rounded text-xs font-semibold ${
                            inStreak
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {v ? "H" : "T"}
                        </span>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-card border border-accent/20 rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Distribution of Longest Streak Length
                  </h3>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={result.histogram}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="length" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {result.histogram.map((entry) => (
                          <Cell key={entry.length} fill="hsl(var(--primary))" />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <InsightBox icon={Brain}>
                  Across {numRuns.toLocaleString()} independent sequences of{" "}
                  {numFlips} fair coin flips, the average longest streak of
                  heads-or-tails-in-a-row was {result.avgLongest.toFixed(2)}{" "}
                  flips — not 2 or 3, but closer to {theoreticalEstimate.toFixed(0)}
                  . Long streaks are the normal, expected behavior of pure
                  randomness, not evidence that a coin, a machine, or a dealer
                  is "due" for a change. The gambler's fallacy is the belief
                  that the odds shift to correct for a streak; they don't —
                  each flip stays 50/50 no matter what came before it.
                </InsightBox>
              </>
            ) : (
              <EmptyState description='Click "Run Simulation" to see how long streaks form purely by chance.' />
            )}
          </div>
        </div>

        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Common Biases in Gambling</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {biases.map((bias) => {
              const Icon = bias.icon;
              return (
                <div
                  key={bias.title}
                  className="bg-card border border-accent/20 rounded-xl p-6"
                >
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold mb-2">{bias.title}</h3>
                  <p className="text-sm text-muted-foreground">{bias.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Layout>
  );
}
