import { useMemo, useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/sim/PageHeader";
import StatGrid from "@/components/sim/StatGrid";
import LineChartCard from "@/components/sim/LineChartCard";
import InsightBox from "@/components/sim/InsightBox";
import EmptyState from "@/components/sim/EmptyState";
import { ConfigPanel, SliderField } from "@/components/sim/Fields";
import { money, pct, gaussianRandom } from "@/lib/stats";
import { Wallet, Play, RotateCcw } from "lucide-react";

interface Config {
  initialAmount: number;
  years: number;
  expectedReturn: number; // % annual, index fund
  volatility: number; // % annual, index fund
  gamblingEdge: number; // % annual expected loss rate if gambling instead
}

interface SimResult {
  chart: Record<string, number>[];
  finalIndex: number;
  finalSavings: number;
  finalGambling: number;
}

function simulate(config: Config): SimResult {
  const months = config.years * 12;
  const dt = 1 / 12;
  const mu = config.expectedReturn / 100;
  const sigma = config.volatility / 100;
  const savingsRate = 0.03;
  const gambleMu = -config.gamblingEdge / 100;
  const gambleSigma = Math.max(0.3, sigma * 2.5);

  let index = config.initialAmount;
  let savings = config.initialAmount;
  let gambling = config.initialAmount;

  const chart: Record<string, number>[] = [
    { month: 0, index, savings, gambling },
  ];

  for (let m = 1; m <= months; m++) {
    index *= Math.exp((mu - 0.5 * sigma * sigma) * dt + sigma * Math.sqrt(dt) * gaussianRandom());
    savings *= 1 + savingsRate / 12;
    gambling *= Math.exp(
      (gambleMu - 0.5 * gambleSigma * gambleSigma) * dt + gambleSigma * Math.sqrt(dt) * gaussianRandom(),
    );
    gambling = Math.max(0, gambling);

    chart.push({ month: m, index, savings, gambling });
  }

  return { chart, finalIndex: index, finalSavings: savings, finalGambling: gambling };
}

export default function Finance() {
  const [config, setConfig] = useState<Config>({
    initialAmount: 100000,
    years: 20,
    expectedReturn: 10,
    volatility: 15,
    gamblingEdge: 5,
  });
  const [result, setResult] = useState<SimResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const cagr = result
    ? (Math.pow(result.finalIndex / config.initialAmount, 1 / config.years) - 1) * 100
    : 0;

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
          icon={Wallet}
          title="Finance & Investing Lab"
          description="The same probability math that governs a casino also governs the market — the difference is which side of the expected value you're standing on. Compare a diversified index fund against a savings account and against regularly gambling the same money."
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <ConfigPanel>
              <h2 className="text-xl font-bold">Configuration</h2>

              <SliderField
                label="Initial Amount"
                value={config.initialAmount}
                min={10000}
                max={1000000}
                step={10000}
                disabled={isRunning}
                onChange={(initialAmount) => setConfig({ ...config, initialAmount })}
                format={money}
              />

              <SliderField
                label="Time Horizon"
                value={config.years}
                min={1}
                max={40}
                disabled={isRunning}
                onChange={(years) => setConfig({ ...config, years })}
                format={(v) => `${v} years`}
              />

              <SliderField
                label="Index Fund Expected Return"
                value={config.expectedReturn}
                min={2}
                max={15}
                step={0.5}
                disabled={isRunning}
                onChange={(expectedReturn) => setConfig({ ...config, expectedReturn })}
                format={(v) => `${v}%/yr`}
              />

              <SliderField
                label="Index Fund Volatility"
                value={config.volatility}
                min={5}
                max={30}
                disabled={isRunning}
                onChange={(volatility) => setConfig({ ...config, volatility })}
                format={(v) => `${v}%/yr`}
              />

              <SliderField
                label="Gambling House Edge"
                value={config.gamblingEdge}
                min={1}
                max={15}
                step={0.5}
                disabled={isRunning}
                onChange={(gamblingEdge) => setConfig({ ...config, gamblingEdge })}
                format={(v) => `${v}%/yr`}
                hint="Effective annual expected loss rate if gambled instead"
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
                      { label: "Index Fund — Final Value", value: money(result.finalIndex), color: "text-emerald-400" },
                      { label: "Index Fund — CAGR", value: pct(cagr) },
                      { label: "Savings Account — Final Value", value: money(result.finalSavings) },
                      {
                        label: "Gambling — Final Value",
                        value: money(result.finalGambling),
                        color: "text-red-400",
                      },
                    ]}
                  />
                </div>

                <LineChartCard
                  title={`Value Over ${config.years} Years`}
                  data={result.chart}
                  xKey="month"
                  lines={[
                    { dataKey: "index", name: "Index Fund", color: "hsl(var(--primary))" },
                    { dataKey: "savings", name: "Savings Account", color: "hsl(var(--secondary))" },
                    { dataKey: "gambling", name: "Regular Gambling", color: "hsl(var(--destructive))" },
                  ]}
                />

                <InsightBox icon={Wallet}>
                  Over {config.years} years, {money(config.initialAmount)} in an
                  index fund averaging {pct(config.expectedReturn)} a year grew
                  to {money(result.finalIndex)}, while the same amount
                  regularly staked against a {pct(config.gamblingEdge)} house
                  edge fell to {money(result.finalGambling)}. Both paths are
                  driven by the same force — compounding — just pointed in
                  opposite directions by the sign of the expected return.
                  Volatility makes any single index-fund path bumpy in the
                  short run, but a persistently positive expected value wins
                  out over time exactly the way a persistently negative one
                  loses out.
                </InsightBox>
              </>
            ) : (
              <EmptyState description='Set your parameters on the left and click "Run Simulation" to compare where the same money ends up.' />
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
