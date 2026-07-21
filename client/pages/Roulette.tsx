import { useState, useMemo } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Dice6, Zap, Play, RotateCcw, Info } from "lucide-react";

interface RouletteConfig {
  type: "european" | "american";
  bankroll: number;
  betSize: number;
  spins: number;
  strategy: "red" | "black" | "even" | "odd";
}

interface SpinResult {
  number: number;
  bankroll: number;
  profit: number;
  won: boolean;
}

interface Statistics {
  finalBankroll: number;
  totalProfit: number;
  winRate: number;
  houseEdge: number;
  expectedValue: number;
  variance: number;
  stdDev: number;
  maxProfit: number;
  maxLoss: number;
  avgWinSize: number;
  avgLossSize: number;
}

const simulateRoulette = (config: RouletteConfig): SpinResult[] => {
  const results: SpinResult[] = [];
  let currentBankroll = config.bankroll;

  // Red numbers: 1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36
  const redNumbers = new Set([
    1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
  ]);

  // Even numbers: 2,4,6,...,36
  const evenNumbers = new Set([2,4,6,8,10,12,14,16,18,20,22,24,26,28,30,32,34,36]);

  const wheelSize = config.type === "european" ? 37 : 38;

  for (let i = 0; i < config.spins; i++) {
    const spin = Math.floor(Math.random() * wheelSize);
    let won = false;

    if (spin === 0 || spin === 37) {
      // Green (0 or 00)
      won = false;
    } else {
      if (config.strategy === "red") {
        won = redNumbers.has(spin);
      } else if (config.strategy === "black") {
        won = !redNumbers.has(spin);
      } else if (config.strategy === "even") {
        won = evenNumbers.has(spin);
      } else if (config.strategy === "odd") {
        won = !evenNumbers.has(spin) && spin !== 0 && spin !== 37;
      }
    }

    const profit = won ? config.betSize : -config.betSize;
    currentBankroll += profit;

    results.push({
      number: spin,
      bankroll: Math.max(0, currentBankroll),
      profit: currentBankroll - config.bankroll,
      won,
    });
  }

  return results;
};

const calculateStats = (
  results: SpinResult[],
  initialBankroll: number,
  betSize: number,
  type: "european" | "american",
): Statistics => {
  const finalBankroll = results[results.length - 1]?.bankroll ?? initialBankroll;
  const totalProfit = finalBankroll - initialBankroll;
  const wins = results.filter((r) => r.won).length;
  const winRate = (wins / results.length) * 100;

  // House edge for a single even-money bet (red/black, odd/even)
  const houseEdge = type === "european" ? 2.7 : 5.26;

  // Theoretical expected value of the total amount wagered over this many spins
  const totalWagered = betSize * results.length;
  const expectedValue = -(totalWagered * (houseEdge / 100));

  // Per-spin outcome variance/std dev: Var(X) = E[X^2] - E[X]^2, where X is
  // the profit or loss of a single spin (+betSize on a win, -betSize on a loss)
  const perSpinOutcomes = results.map((r) => (r.won ? betSize : -betSize));
  const spinMean =
    perSpinOutcomes.reduce((a, b) => a + b, 0) / perSpinOutcomes.length;
  const variance =
    perSpinOutcomes.reduce((sum, x) => sum + Math.pow(x - spinMean, 2), 0) /
    perSpinOutcomes.length;
  const stdDev = Math.sqrt(variance);

  const winSizes = results.filter((r) => r.won).map(() => betSize);
  const lossSizes = results.filter((r) => !r.won).map(() => -betSize);

  return {
    finalBankroll,
    totalProfit,
    winRate: parseFloat(winRate.toFixed(2)),
    houseEdge,
    expectedValue: parseFloat(expectedValue.toFixed(2)),
    variance: parseFloat(variance.toFixed(2)),
    stdDev: parseFloat(stdDev.toFixed(2)),
    maxProfit: Math.max(...results.map((r) => r.profit)),
    maxLoss: Math.min(...results.map((r) => r.profit)),
    avgWinSize:
      winSizes.length > 0
        ? parseFloat((winSizes.reduce((a, b) => a + b) / winSizes.length).toFixed(2))
        : 0,
    avgLossSize:
      lossSizes.length > 0
        ? parseFloat((lossSizes.reduce((a, b) => a + b) / lossSizes.length).toFixed(2))
        : 0,
  };
};

export default function Roulette() {
  const [config, setConfig] = useState<RouletteConfig>({
    type: "european",
    bankroll: 1000,
    betSize: 10,
    spins: 1000,
    strategy: "red",
  });

  const [results, setResults] = useState<SpinResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const stats = useMemo(
    () =>
      results.length > 0
        ? calculateStats(results, config.bankroll, config.betSize, config.type)
        : null,
    [results, config],
  );

  const chartData = useMemo(() => {
    return results.slice(0, Math.min(results.length, 500)).map((r, i) => ({
      spin: i + 1,
      bankroll: r.bankroll,
    }));
  }, [results]);

  const handleSimulate = () => {
    setIsRunning(true);
    // Simulate in chunks to keep UI responsive
    setTimeout(() => {
      const simResults = simulateRoulette(config);
      setResults(simResults);
      setIsRunning(false);
    }, 100);
  };

  const handleReset = () => {
    setResults([]);
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary mb-4">
            <Dice6 className="w-6 h-6" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Roulette Lab</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Simulate thousands of spins to see how probability and house edge
            converge. Watch your bankroll's journey and understand why the casino
            always wins in the long run.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Configuration Panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-card border border-accent/20 rounded-xl p-6 space-y-6 glow-ring">
              <h2 className="text-xl font-bold">Configuration</h2>

              {/* Roulette Type */}
              <div>
                <label className="block text-sm font-semibold mb-3">
                  Roulette Type
                </label>
                <div className="space-y-2">
                  {["european", "american"].map((type) => (
                    <label key={type} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="roulette-type"
                        value={type}
                        checked={config.type === type}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            type: e.target.value as "european" | "american",
                          })
                        }
                        disabled={isRunning}
                        className="w-4 h-4 accent-primary"
                      />
                      <span className="capitalize">
                        {type === "european"
                          ? "European (37 slots, 2.7% house edge)"
                          : "American (38 slots, 5.26% house edge)"}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Strategy */}
              <div>
                <label className="block text-sm font-semibold mb-3">
                  Betting Strategy
                </label>
                <div className="space-y-2">
                  {["red", "black", "even", "odd"].map((strategy) => (
                    <label
                      key={strategy}
                      className="flex items-center gap-3 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="strategy"
                        value={strategy}
                        checked={config.strategy === strategy}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            strategy: e.target.value as "red" | "black" | "even" | "odd",
                          })
                        }
                        disabled={isRunning}
                        className="w-4 h-4 accent-primary"
                      />
                      <span className="capitalize">{strategy}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Bankroll */}
              <div>
                <label htmlFor="bankroll" className="block text-sm font-semibold mb-2">
                  Initial Bankroll: ₹{config.bankroll}
                </label>
                <input
                  id="bankroll"
                  type="range"
                  min="100"
                  max="10000"
                  step="100"
                  value={config.bankroll}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      bankroll: parseInt(e.target.value),
                    })
                  }
                  disabled={isRunning}
                  className="w-full accent-primary"
                />
                <div className="text-xs text-muted-foreground mt-1">
                  ₹100 - ₹10,000
                </div>
              </div>

              {/* Bet Size */}
              <div>
                <label htmlFor="bet-size" className="block text-sm font-semibold mb-2">
                  Bet Size: ₹{config.betSize}
                </label>
                <input
                  id="bet-size"
                  type="range"
                  min="1"
                  max="100"
                  step="1"
                  value={config.betSize}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      betSize: parseInt(e.target.value),
                    })
                  }
                  disabled={isRunning}
                  className="w-full accent-primary"
                />
                <div className="text-xs text-muted-foreground mt-1">
                  ₹1 - ₹100 per spin
                </div>
              </div>

              {/* Number of Spins */}
              <div>
                <label htmlFor="spins" className="block text-sm font-semibold mb-2">
                  Number of Spins: {config.spins}
                </label>
                <select
                  id="spins"
                  value={config.spins}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      spins: parseInt(e.target.value),
                    })
                  }
                  disabled={isRunning}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                >
                  <option value={100}>100</option>
                  <option value={500}>500</option>
                  <option value={1000}>1,000</option>
                  <option value={5000}>5,000</option>
                  <option value={10000}>10,000</option>
                </select>
              </div>

              {/* Buttons */}
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
                  onClick={handleReset}
                  disabled={isRunning || results.length === 0}
                  variant="outline"
                  className="w-full"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              </div>
            </div>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-2 space-y-8">
            {results.length > 0 && stats && (
              <>
                {/* Statistics Grid */}
                <div>
                  <h2 className="text-2xl font-bold mb-4">Results</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      {
                        label: "Final Bankroll",
                        value: `₹${stats.finalBankroll.toFixed(2)}`,
                        color: stats.finalBankroll >= config.bankroll ? "text-emerald-400" : "text-red-400",
                      },
                      {
                        label: "Total Profit/Loss",
                        value: `₹${stats.totalProfit.toFixed(2)}`,
                        color: stats.totalProfit >= 0 ? "text-emerald-400" : "text-red-400",
                      },
                      {
                        label: "Win Rate",
                        value: `${stats.winRate}%`,
                        color: "text-foreground",
                      },
                      {
                        label: "House Edge",
                        value: `${stats.houseEdge}%`,
                        color: "text-foreground",
                      },
                      {
                        label: "Expected Loss (theoretical)",
                        value: `₹${Math.abs(stats.expectedValue).toFixed(2)}`,
                        color: "text-foreground",
                      },
                      {
                        label: "Std Dev per Spin",
                        value: `₹${stats.stdDev.toFixed(2)}`,
                        color: "text-foreground",
                      },
                      {
                        label: "Avg Win/Loss",
                        value: `+₹${stats.avgWinSize.toFixed(2)} / -₹${Math.abs(stats.avgLossSize).toFixed(2)}`,
                        color: "text-foreground",
                      },
                    ].map((stat) => (
                      <div key={stat.label} className="bg-card border border-border rounded-lg p-4 hover:border-accent/30 transition-colors">
                        <p className="text-sm text-muted-foreground mb-1">
                          {stat.label}
                        </p>
                        <p className={`text-2xl font-bold ${stat.color}`}>
                          {stat.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bankroll Chart */}
                <div className="bg-card border border-accent/20 rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-4">Bankroll Over Time</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="hsl(var(--border))"
                      />
                      <XAxis
                        dataKey="spin"
                        stroke="hsl(var(--muted-foreground))"
                      />
                      <YAxis
                        stroke="hsl(var(--muted-foreground))"
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="bankroll"
                        stroke="hsl(var(--primary))"
                        dot={false}
                        isAnimationActive={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Key Insights */}
                <div className="bg-primary/10 border border-primary/20 rounded-xl p-6">
                  <div className="flex gap-3">
                    <Info className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold mb-2">Key Insight</h3>
                      <p className="text-sm text-muted-foreground">
                        The {config.type} roulette has a {stats.houseEdge}%
                        house edge. Over {results.length} spins with ₹
                        {config.betSize} bets, the theoretical expected result
                        is a loss of about ₹{Math.abs(stats.expectedValue).toFixed(2)}.
                        This run actually{" "}
                        {stats.totalProfit >= 0 ? "gained" : "lost"} ₹
                        {Math.abs(stats.totalProfit).toFixed(2)} (
                        {(
                          (Math.abs(stats.totalProfit) /
                            (config.betSize * results.length)) *
                          100
                        ).toFixed(1)}
                        % of total wagered). Individual runs vary due to
                        variance, but as the number of spins grows, results
                        converge toward the negative expected value.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {results.length === 0 && (
              <div className="bg-card/50 border border-dashed border-accent/30 rounded-xl p-12 text-center">
                <Zap className="w-12 h-12 text-accent/70 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Ready to simulate?</h3>
                <p className="text-muted-foreground">
                  Configure the parameters on the left and click "Run Simulation" to
                  see how probability plays out over time.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
