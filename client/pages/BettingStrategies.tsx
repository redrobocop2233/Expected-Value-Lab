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
import { LineChart as LineChartIcon, Play, RotateCcw } from "lucide-react";

interface Config {
  winProbability: number; // 0-100
  bankroll: number;
  baseBet: number;
  tableLimit: number;
  spins: number;
}

const STRATEGY_NAMES = ["flat", "martingale", "fibonacci", "dalembert"] as const;
type StrategyName = (typeof STRATEGY_NAMES)[number];

const STRATEGY_LABEL: Record<StrategyName, string> = {
  flat: "Flat Betting",
  martingale: "Martingale",
  fibonacci: "Fibonacci",
  dalembert: "D'Alembert",
};

const STRATEGY_COLOR: Record<StrategyName, string> = {
  flat: "hsl(var(--primary))",
  martingale: "hsl(var(--destructive))",
  fibonacci: "hsl(var(--accent))",
  dalembert: "hsl(var(--secondary))",
};

function fibonacciSequence(length: number): number[] {
  const seq = [1, 1];
  while (seq.length < length) seq.push(seq[seq.length - 1] + seq[seq.length - 2]);
  return seq;
}
const FIB = fibonacciSequence(30);

interface StrategyState {
  bankroll: number;
  martingaleBet: number;
  fibIndex: number;
  dalembertUnits: number;
  ruined: boolean;
  peakBet: number;
}

function initState(bankroll: number): StrategyState {
  return { bankroll, martingaleBet: 1, fibIndex: 0, dalembertUnits: 1, ruined: false, peakBet: 0 };
}

function nextBet(name: StrategyName, state: StrategyState, config: Config): number {
  let raw: number;
  if (name === "flat") raw = config.baseBet;
  else if (name === "martingale") raw = state.martingaleBet * config.baseBet;
  else if (name === "fibonacci") raw = FIB[state.fibIndex] * config.baseBet;
  else raw = state.dalembertUnits * config.baseBet;
  return Math.max(1, Math.min(raw, config.tableLimit, state.bankroll));
}

function applyOutcome(name: StrategyName, state: StrategyState, won: boolean, bet: number) {
  if (won) {
    state.bankroll += bet;
    if (name === "martingale") state.martingaleBet = 1;
    if (name === "fibonacci") state.fibIndex = Math.max(0, state.fibIndex - 2);
    if (name === "dalembert") state.dalembertUnits = Math.max(1, state.dalembertUnits - 1);
  } else {
    state.bankroll -= bet;
    if (name === "martingale") state.martingaleBet *= 2;
    if (name === "fibonacci") state.fibIndex = Math.min(FIB.length - 1, state.fibIndex + 1);
    if (name === "dalembert") state.dalembertUnits += 1;
  }
  if (state.bankroll <= 0) {
    state.bankroll = 0;
    state.ruined = true;
  }
  state.peakBet = Math.max(state.peakBet, bet);
}

function simulate(config: Config) {
  const states: Record<StrategyName, StrategyState> = {
    flat: initState(config.bankroll),
    martingale: initState(config.bankroll),
    fibonacci: initState(config.bankroll),
    dalembert: initState(config.bankroll),
  };

  const history: Record<StrategyName, number>[] = [];

  for (let i = 0; i < config.spins; i++) {
    const won = Math.random() * 100 < config.winProbability;
    const point: Record<StrategyName, number> = {} as Record<StrategyName, number>;
    for (const name of STRATEGY_NAMES) {
      const state = states[name];
      if (!state.ruined) {
        const bet = nextBet(name, state, config);
        applyOutcome(name, state, won, bet);
      }
      point[name] = state.bankroll;
    }
    history.push(point);
  }

  return { states, history };
}

export default function BettingStrategies() {
  const [config, setConfig] = useState<Config>({
    winProbability: 48.6,
    bankroll: 1000,
    baseBet: 5,
    tableLimit: 500,
    spins: 500,
  });
  const [result, setResult] = useState<ReturnType<typeof simulate> | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const chartData = useMemo(() => {
    if (!result) return [];
    return result.history.slice(0, 500).map((point, i) => ({ spin: i + 1, ...point }));
  }, [result]);

  const handleSimulate = () => {
    setIsRunning(true);
    setTimeout(() => {
      setResult(simulate(config));
      setIsRunning(false);
    }, 50);
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <PageHeader
          icon={LineChartIcon}
          title="Betting Strategies Lab"
          description="Flat betting, Martingale, Fibonacci, and D'Alembert — run side by side on the exact same sequence of wins and losses, so you can see how bet sizing changes the ride without ever changing the odds."
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <ConfigPanel>
              <h2 className="text-xl font-bold">Configuration</h2>

              <SliderField
                label="Win Probability per Bet"
                value={config.winProbability}
                min={10}
                max={90}
                step={0.1}
                disabled={isRunning}
                onChange={(winProbability) => setConfig({ ...config, winProbability })}
                format={(v) => `${v.toFixed(1)}%`}
                hint="48.6% ≈ red/black on European roulette"
              />

              <SliderField
                label="Starting Bankroll"
                value={config.bankroll}
                min={200}
                max={10000}
                step={100}
                disabled={isRunning}
                onChange={(bankroll) => setConfig({ ...config, bankroll })}
                format={money}
              />

              <SliderField
                label="Base Bet"
                value={config.baseBet}
                min={1}
                max={50}
                disabled={isRunning}
                onChange={(baseBet) => setConfig({ ...config, baseBet })}
                format={money}
              />

              <SliderField
                label="Table Limit"
                value={config.tableLimit}
                min={config.baseBet * 4}
                max={5000}
                step={10}
                disabled={isRunning}
                onChange={(tableLimit) => setConfig({ ...config, tableLimit })}
                format={money}
                hint="Caps how large Martingale/Fibonacci bets can grow"
              />

              <SelectField
                label="Number of Bets"
                value={config.spins}
                disabled={isRunning}
                onChange={(spins) => setConfig({ ...config, spins: Number(spins) })}
                options={[100, 250, 500, 1000, 2000].map((n) => ({
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
                    stats={STRATEGY_NAMES.map((name) => ({
                      label: `${STRATEGY_LABEL[name]}${result.states[name].ruined ? " (ruined)" : ""}`,
                      value: money(result.states[name].bankroll),
                      color: result.states[name].ruined
                        ? "text-red-400"
                        : result.states[name].bankroll >= config.bankroll
                          ? "text-emerald-400"
                          : "text-red-400",
                    }))}
                  />
                </div>

                <LineChartCard
                  title="Bankroll Over Time by Strategy"
                  data={chartData}
                  xKey="spin"
                  lines={STRATEGY_NAMES.map((name) => ({
                    dataKey: name,
                    name: STRATEGY_LABEL[name],
                    color: STRATEGY_COLOR[name],
                  }))}
                />

                <InsightBox>
                  All four strategies faced the identical sequence of wins and
                  losses at a {pct(config.winProbability)} win rate — only the
                  bet sizing differed. None of them change the expected value
                  of a single bet. Martingale can look great until a long
                  losing streak forces a bet past the {money(config.tableLimit)}{" "}
                  table limit or your remaining bankroll, at which point it
                  can no longer double down to recover. Flat betting has the
                  same long-run expectation with far less dramatic swings.
                </InsightBox>
              </>
            ) : (
              <EmptyState description='Configure the parameters on the left and click "Run Simulation" to race all four strategies.' />
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
