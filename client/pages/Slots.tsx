import { useMemo, useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/sim/PageHeader";
import StatGrid from "@/components/sim/StatGrid";
import LineChartCard from "@/components/sim/LineChartCard";
import InsightBox from "@/components/sim/InsightBox";
import EmptyState from "@/components/sim/EmptyState";
import { ConfigPanel, SliderField, RadioField, SelectField } from "@/components/sim/Fields";
import { money, pct, stdDev } from "@/lib/stats";
import { Zap, Play, RotateCcw } from "lucide-react";

type Volatility = "low" | "medium" | "high";

interface Config {
  rtp: number; // 85-98, percent
  volatility: Volatility;
  bankroll: number;
  betSize: number;
  spins: number;
}

interface PaytableTier {
  probability: number;
  multiplier: number;
}

// Fixed shape per volatility: a "small win" tier and a solved "jackpot" tier,
// so that whatever RTP the person picks is hit exactly. Hit frequency drops
// and the jackpot size grows as volatility increases, at the same RTP.
const volatilityProfiles: Record<
  Volatility,
  { pSmall: number; smallMult: number; pJackpot: number }
> = {
  low: { pSmall: 0.45, smallMult: 0.8, pJackpot: 0.05 },
  medium: { pSmall: 0.25, smallMult: 0.8, pJackpot: 0.03 },
  high: { pSmall: 0.1, smallMult: 0.8, pJackpot: 0.01 },
};

function buildPaytable(rtpPercent: number, volatility: Volatility): PaytableTier[] {
  const rtp = rtpPercent / 100;
  const { pSmall, smallMult, pJackpot } = volatilityProfiles[volatility];
  const jackpotMult = (rtp - pSmall * smallMult) / pJackpot;
  const p0 = 1 - pSmall - pJackpot;
  return [
    { probability: p0, multiplier: 0 },
    { probability: pSmall, multiplier: smallMult },
    { probability: pJackpot, multiplier: jackpotMult },
  ];
}

function spin(paytable: PaytableTier[]): number {
  const r = Math.random();
  let cumulative = 0;
  for (const tier of paytable) {
    cumulative += tier.probability;
    if (r < cumulative) return tier.multiplier;
  }
  return 0;
}

interface SpinResult {
  bankroll: number;
  won: number; // currency amount won this spin (0 if none)
  multiplier: number;
}

function simulate(config: Config): SpinResult[] {
  const paytable = buildPaytable(config.rtp, config.volatility);
  const results: SpinResult[] = [];
  let bankroll = config.bankroll;
  for (let i = 0; i < config.spins; i++) {
    const multiplier = spin(paytable);
    const won = multiplier * config.betSize;
    bankroll += won - config.betSize;
    results.push({ bankroll: Math.max(0, bankroll), won, multiplier });
  }
  return results;
}

export default function Slots() {
  const [config, setConfig] = useState<Config>({
    rtp: 96,
    volatility: "medium",
    bankroll: 1000,
    betSize: 10,
    spins: 1000,
  });
  const [results, setResults] = useState<SpinResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const stats = useMemo(() => {
    if (results.length === 0) return null;
    const finalBankroll = results[results.length - 1].bankroll;
    const totalProfit = finalBankroll - config.bankroll;
    const totalWagered = config.betSize * results.length;
    const totalReturned = results.reduce((sum, r) => sum + r.won, 0);
    const actualRtp = (totalReturned / totalWagered) * 100;
    const hits = results.filter((r) => r.multiplier > 0).length;
    const hitFrequency = (hits / results.length) * 100;
    const biggestWin = Math.max(...results.map((r) => r.won));
    const perSpinNet = results.map((r) => r.won - config.betSize);
    return {
      finalBankroll,
      totalProfit,
      actualRtp,
      hitFrequency,
      biggestWin,
      spinStdDev: stdDev(perSpinNet),
    };
  }, [results, config]);

  const chartData = useMemo(
    () => results.slice(0, 500).map((r, i) => ({ spin: i + 1, bankroll: r.bankroll })),
    [results],
  );

  const handleSimulate = () => {
    setIsRunning(true);
    setTimeout(() => {
      setResults(simulate(config));
      setIsRunning(false);
    }, 50);
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <PageHeader
          icon={Zap}
          title="Slot Machine Lab"
          description="Set the RTP (return to player) and volatility of a slot machine and watch what a target payout percentage actually looks like across thousands of spins."
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <ConfigPanel>
              <h2 className="text-xl font-bold">Configuration</h2>

              <SliderField
                label="Target RTP"
                value={config.rtp}
                min={85}
                max={98}
                step={0.5}
                disabled={isRunning}
                onChange={(rtp) => setConfig({ ...config, rtp })}
                format={(v) => `${v}%`}
                hint="Real-world slots typically run 85% - 98%"
              />

              <RadioField
                label="Volatility"
                name="volatility"
                value={config.volatility}
                disabled={isRunning}
                onChange={(volatility) => setConfig({ ...config, volatility })}
                options={[
                  { value: "low", label: "Low — frequent small wins" },
                  { value: "medium", label: "Medium — balanced" },
                  { value: "high", label: "High — rare, large wins" },
                ]}
              />

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

              <SliderField
                label="Bet Size"
                value={config.betSize}
                min={1}
                max={100}
                disabled={isRunning}
                onChange={(betSize) => setConfig({ ...config, betSize })}
                format={money}
                hint="Per spin"
              />

              <SelectField
                label="Number of Spins"
                value={config.spins}
                disabled={isRunning}
                onChange={(spins) => setConfig({ ...config, spins: Number(spins) })}
                options={[100, 500, 1000, 5000, 10000].map((n) => ({
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
                      {
                        label: "Final Bankroll",
                        value: money(stats.finalBankroll),
                        color: stats.finalBankroll >= config.bankroll ? "text-emerald-400" : "text-red-400",
                      },
                      {
                        label: "Total Profit/Loss",
                        value: money(stats.totalProfit),
                        color: stats.totalProfit >= 0 ? "text-emerald-400" : "text-red-400",
                      },
                      { label: "Target RTP", value: pct(config.rtp) },
                      { label: "Actual RTP (this run)", value: pct(stats.actualRtp) },
                      { label: "Hit Frequency", value: pct(stats.hitFrequency) },
                      { label: "Biggest Single Win", value: money(stats.biggestWin) },
                      { label: "Std Dev per Spin", value: money(stats.spinStdDev) },
                    ]}
                  />
                </div>

                <LineChartCard
                  title="Bankroll Over Time"
                  data={chartData}
                  xKey="spin"
                  lines={[{ dataKey: "bankroll", color: "hsl(var(--primary))" }]}
                />

                <InsightBox>
                  This machine was configured for a {pct(config.rtp)} RTP with{" "}
                  {config.volatility} volatility, and over {results.length} spins
                  the realized RTP was {pct(stats.actualRtp)} — short runs wobble
                  around the target. Notice the hit frequency was only{" "}
                  {pct(stats.hitFrequency)}: RTP tells you the average share of
                  wagered money returned over the long run, but volatility
                  determines how choppy the path there feels. Two machines with
                  identical RTP can feel completely different to play.
                </InsightBox>
              </>
            ) : (
              <EmptyState description='Configure the RTP and volatility on the left and click "Run Simulation" to see how they shape the ride.' />
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
