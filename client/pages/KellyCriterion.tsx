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
import { Dice5, Play, RotateCcw } from "lucide-react";

interface Config {
  winProbability: number; // 0-100
  netOdds: number; // b: profit multiple on a win, e.g. 1 = even money
  bankroll: number;
  bets: number;
}

const STRATEGIES = ["kelly", "halfKelly", "doubleKelly", "fixed"] as const;
type StrategyKey = (typeof STRATEGIES)[number];

const LABEL: Record<StrategyKey, string> = {
  kelly: "Full Kelly",
  halfKelly: "Half Kelly",
  doubleKelly: "Double Kelly (over-betting)",
  fixed: "Fixed 10% of bankroll",
};

const COLOR: Record<StrategyKey, string> = {
  kelly: "hsl(var(--primary))",
  halfKelly: "hsl(var(--secondary))",
  doubleKelly: "hsl(var(--destructive))",
  fixed: "hsl(var(--accent))",
};

function kellyFraction(p: number, b: number): number {
  const q = 1 - p;
  return Math.max(0, p - q / b);
}

function fractionFor(key: StrategyKey, kelly: number): number {
  const raw = key === "kelly" ? kelly : key === "halfKelly" ? kelly / 2 : key === "doubleKelly" ? kelly * 2 : 0.1;
  return Math.min(0.95, Math.max(0, raw));
}

export default function KellyCriterion() {
  const [config, setConfig] = useState<Config>({
    winProbability: 55,
    netOdds: 1,
    bankroll: 1000,
    bets: 300,
  });
  const [result, setResult] = useState<{
    chart: Record<string, number>[];
    final: Record<StrategyKey, number>;
  } | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const p = config.winProbability / 100;
  const kelly = kellyFraction(p, config.netOdds);
  const expectedGrowthRate = kelly > 0
    ? p * Math.log(1 + kelly * config.netOdds) + (1 - p) * Math.log(1 - kelly)
    : 0;

  const handleSimulate = () => {
    setIsRunning(true);
    setTimeout(() => {
      const bankrolls: Record<StrategyKey, number> = {
        kelly: config.bankroll,
        halfKelly: config.bankroll,
        doubleKelly: config.bankroll,
        fixed: config.bankroll,
      };
      const chart: Record<string, number>[] = [{ bet: 0, ...bankrolls }];

      for (let i = 0; i < config.bets; i++) {
        const won = Math.random() < p;
        for (const key of STRATEGIES) {
          const f = fractionFor(key, kelly);
          bankrolls[key] = won
            ? bankrolls[key] * (1 + f * config.netOdds)
            : bankrolls[key] * (1 - f);
          bankrolls[key] = Math.max(0.01, bankrolls[key]);
        }
        chart.push({ bet: i + 1, ...bankrolls });
      }

      setResult({ chart, final: { ...bankrolls } });
      setIsRunning(false);
    }, 50);
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <PageHeader
          icon={Dice5}
          title="Kelly Criterion Lab"
          description="Given a real edge, the Kelly Criterion tells you exactly what fraction of your bankroll to bet to maximize long-run growth. Bet too little and you leave growth on the table; bet too much and volatility eats you alive."
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <ConfigPanel>
              <h2 className="text-xl font-bold">Configuration</h2>

              <SliderField
                label="Win Probability"
                value={config.winProbability}
                min={1}
                max={99}
                disabled={isRunning}
                onChange={(winProbability) => setConfig({ ...config, winProbability })}
                format={(v) => `${v}%`}
              />

              <SliderField
                label="Net Odds on Win (b)"
                value={config.netOdds}
                min={0.2}
                max={5}
                step={0.1}
                disabled={isRunning}
                onChange={(netOdds) => setConfig({ ...config, netOdds })}
                format={(v) => `${v.toFixed(1)}:1`}
                hint="Profit per unit staked if you win"
              />

              <div className="bg-muted/50 rounded-lg p-3 text-sm space-y-1">
                <div>
                  <span className="text-muted-foreground">Kelly fraction: </span>
                  <span className="font-bold text-primary">{pct(kelly * 100)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Expected growth/bet: </span>
                  <span className="font-bold text-primary">{pct(expectedGrowthRate * 100)}</span>
                </div>
              </div>

              <SliderField
                label="Starting Bankroll"
                value={config.bankroll}
                min={100}
                max={10000}
                step={100}
                disabled={isRunning}
                onChange={(bankroll) => setConfig({ ...config, bankroll })}
                format={money}
              />

              <SelectField
                label="Number of Bets"
                value={config.bets}
                disabled={isRunning}
                onChange={(v) => setConfig({ ...config, bets: Number(v) })}
                options={[100, 300, 500, 1000].map((n) => ({ value: n, label: n.toLocaleString() }))}
              />

              <div className="space-y-2 pt-4">
                <Button
                  onClick={handleSimulate}
                  disabled={isRunning || kelly === 0}
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
              {kelly === 0 && (
                <p className="text-xs text-red-400">
                  These odds and win probability give no edge — Kelly says bet
                  nothing.
                </p>
              )}
            </ConfigPanel>
          </div>

          <div className="lg:col-span-2 space-y-8">
            {result ? (
              <>
                <div>
                  <h2 className="text-2xl font-bold mb-4">Results</h2>
                  <StatGrid
                    stats={STRATEGIES.map((key) => ({
                      label: `${LABEL[key]} (${pct(fractionFor(key, kelly) * 100, 1)}/bet)`,
                      value: money(result.final[key]),
                      color: result.final[key] >= config.bankroll ? "text-emerald-400" : "text-red-400",
                    }))}
                  />
                </div>

                <LineChartCard
                  title="Bankroll Growth (log scale)"
                  data={result.chart}
                  xKey="bet"
                  yScale="log"
                  lines={STRATEGIES.map((key) => ({
                    dataKey: key,
                    name: LABEL[key],
                    color: COLOR[key],
                  }))}
                />

                <InsightBox>
                  With a {pct(config.winProbability)} win rate at {config.netOdds.toFixed(1)}:1
                  odds, full Kelly bets {pct(kelly * 100)} of the bankroll per
                  wager and grows it at {pct(expectedGrowthRate * 100)} per bet
                  on average — the fastest possible long-run growth rate for
                  this edge. Notice double-Kelly usually looks similar or worse
                  despite betting more: overshooting the optimal fraction adds
                  volatility without adding growth, and can even turn positive
                  growth negative. Half-Kelly trades some growth for a much
                  smoother ride, which is why many professional bettors prefer it.
                </InsightBox>
              </>
            ) : (
              <EmptyState description='Set your edge on the left and click "Run Simulation" to compare bet-sizing strategies.' />
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
