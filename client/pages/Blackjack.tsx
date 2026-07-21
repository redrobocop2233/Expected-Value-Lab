import { useMemo, useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/sim/PageHeader";
import StatGrid from "@/components/sim/StatGrid";
import LineChartCard from "@/components/sim/LineChartCard";
import InsightBox from "@/components/sim/InsightBox";
import EmptyState from "@/components/sim/EmptyState";
import { ConfigPanel, RadioField, SliderField, SelectField } from "@/components/sim/Fields";
import { money, pct } from "@/lib/stats";
import { Spade, Play, RotateCcw } from "lucide-react";

type Strategy = "random" | "mimic-dealer" | "basic" | "always-stand";

interface Config {
  strategy: Strategy;
  bankroll: number;
  betSize: number;
  hands: number;
}

type Outcome = "win" | "loss" | "push" | "blackjack" | "bust";

interface HandResult {
  outcome: Outcome;
  payout: number;
  bankroll: number;
}

// Infinite-shoe card draw. Ace is represented as 11 (soft) and reduced as needed.
function dealCard(): number {
  const rank = Math.floor(Math.random() * 13) + 1;
  if (rank === 1) return 11; // Ace
  return Math.min(rank, 10); // 10, J, Q, K all worth 10
}

function handValue(cards: number[]): { total: number; soft: boolean } {
  let total = cards.reduce((a, b) => a + b, 0);
  let aces = cards.filter((c) => c === 11).length;
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }
  return { total, soft: aces > 0 };
}

function basicStrategyShouldHit(
  total: number,
  soft: boolean,
  dealerUp: number,
): boolean {
  if (soft) return total < 18; // simplified: hit all soft hands below 18
  if (total <= 11) return true;
  if (total >= 17) return false;
  if (total === 12) return !(dealerUp >= 4 && dealerUp <= 6);
  return !(dealerUp >= 2 && dealerUp <= 6); // 13-16: stand vs weak dealer card
}

function playHand(config: Config): { outcome: Outcome; payout: number } {
  const player = [dealCard(), dealCard()];
  const dealer = [dealCard(), dealCard()];
  const dealerUp = dealer[0];

  const playerBJ = handValue(player).total === 21;
  const dealerBJ = handValue(dealer).total === 21;
  if (playerBJ || dealerBJ) {
    if (playerBJ && dealerBJ) return { outcome: "push", payout: 0 };
    if (playerBJ) return { outcome: "blackjack", payout: 1.5 };
    return { outcome: "loss", payout: -1 };
  }

  // Player's turn
  for (;;) {
    const { total, soft } = handValue(player);
    if (total > 21) return { outcome: "bust", payout: -1 };

    let shouldHit: boolean;
    if (config.strategy === "random") shouldHit = Math.random() < 0.5;
    else if (config.strategy === "always-stand") shouldHit = false;
    else if (config.strategy === "mimic-dealer") shouldHit = total < 17;
    else shouldHit = basicStrategyShouldHit(total, soft, dealerUp);

    if (!shouldHit) break;
    player.push(dealCard());
  }

  const playerFinal = handValue(player).total;
  if (playerFinal > 21) return { outcome: "bust", payout: -1 };

  // Dealer's turn (stands on all 17s)
  while (handValue(dealer).total < 17) dealer.push(dealCard());
  const dealerFinal = handValue(dealer).total;

  if (dealerFinal > 21) return { outcome: "win", payout: 1 };
  if (playerFinal > dealerFinal) return { outcome: "win", payout: 1 };
  if (playerFinal < dealerFinal) return { outcome: "loss", payout: -1 };
  return { outcome: "push", payout: 0 };
}

function simulate(config: Config): HandResult[] {
  const results: HandResult[] = [];
  let bankroll = config.bankroll;
  for (let i = 0; i < config.hands; i++) {
    const { outcome, payout } = playHand(config);
    bankroll += payout * config.betSize;
    results.push({ outcome, payout: payout * config.betSize, bankroll: Math.max(0, bankroll) });
  }
  return results;
}

const strategyLabels: Record<Strategy, string> = {
  random: "Random (coin-flip hit/stand)",
  "mimic-dealer": "Mimic the Dealer (hit under 17)",
  basic: "Simplified Basic Strategy",
  "always-stand": "Always Stand",
};

export default function Blackjack() {
  const [config, setConfig] = useState<Config>({
    strategy: "basic",
    bankroll: 1000,
    betSize: 10,
    hands: 1000,
  });
  const [results, setResults] = useState<HandResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const stats = useMemo(() => {
    if (results.length === 0) return null;
    const finalBankroll = results[results.length - 1].bankroll;
    const totalProfit = finalBankroll - config.bankroll;
    const wins = results.filter((r) => r.outcome === "win" || r.outcome === "blackjack").length;
    const blackjacks = results.filter((r) => r.outcome === "blackjack").length;
    const busts = results.filter((r) => r.outcome === "bust").length;
    const pushes = results.filter((r) => r.outcome === "push").length;
    const edge = -((totalProfit / (config.betSize * results.length)) * 100);
    return {
      finalBankroll,
      totalProfit,
      winRate: (wins / results.length) * 100,
      bustRate: (busts / results.length) * 100,
      pushRate: (pushes / results.length) * 100,
      blackjackRate: (blackjacks / results.length) * 100,
      edge,
    };
  }, [results, config]);

  const chartData = useMemo(
    () =>
      results.slice(0, 500).map((r, i) => ({ hand: i + 1, bankroll: r.bankroll })),
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
          icon={Spade}
          title="Blackjack Lab"
          description="Compare how much strategy actually matters in blackjack: random guessing, naively mimicking the dealer, and a simplified basic strategy, all played against the same infinite shoe."
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <ConfigPanel>
              <h2 className="text-xl font-bold">Configuration</h2>

              <RadioField
                label="Strategy"
                name="strategy"
                value={config.strategy}
                onChange={(strategy) => setConfig({ ...config, strategy })}
                disabled={isRunning}
                options={(Object.keys(strategyLabels) as Strategy[]).map((s) => ({
                  value: s,
                  label: strategyLabels[s],
                }))}
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
                hint="₹100 - ₹10,000"
              />

              <SliderField
                label="Bet Size"
                value={config.betSize}
                min={1}
                max={100}
                disabled={isRunning}
                onChange={(betSize) => setConfig({ ...config, betSize })}
                format={money}
                hint="₹1 - ₹100 per hand"
              />

              <SelectField
                label="Number of Hands"
                value={config.hands}
                disabled={isRunning}
                onChange={(hands) => setConfig({ ...config, hands: Number(hands) })}
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
                      { label: "Win Rate (incl. blackjacks)", value: pct(stats.winRate) },
                      { label: "Bust Rate", value: pct(stats.bustRate) },
                      { label: "Push Rate", value: pct(stats.pushRate) },
                      { label: "Blackjack Rate", value: pct(stats.blackjackRate) },
                      { label: "Effective House Edge", value: pct(stats.edge) },
                    ]}
                  />
                </div>

                <LineChartCard
                  title="Bankroll Over Time"
                  data={chartData}
                  xKey="hand"
                  lines={[{ dataKey: "bankroll", color: "hsl(var(--primary))" }]}
                />

                <InsightBox>
                  Playing "{strategyLabels[config.strategy]}" over {results.length}{" "}
                  hands at ₹{config.betSize} a hand produced an effective house
                  edge of {pct(Math.abs(stats.edge))} in this run. Real basic
                  strategy (with correct doubling and splitting, not modeled
                  here) typically holds the house edge under 1% in blackjack —
                  far lower than most casino games — while random or dealer-mimicking
                  play routinely loses several times that. Skill genuinely
                  changes the math here, unlike roulette.
                </InsightBox>
              </>
            ) : (
              <EmptyState description='Configure the parameters on the left and click "Run Simulation" to see how much strategy affects your results.' />
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
