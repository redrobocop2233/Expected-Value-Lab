import { useMemo, useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/sim/PageHeader";
import StatGrid from "@/components/sim/StatGrid";
import LineChartCard from "@/components/sim/LineChartCard";
import InsightBox from "@/components/sim/InsightBox";
import EmptyState from "@/components/sim/EmptyState";
import { ConfigPanel, RadioField, SelectField } from "@/components/sim/Fields";
import { pct } from "@/lib/stats";
import {
  type Card,
  makeDeck,
  removeCards,
  shuffle,
  bestScore,
  compareScores,
  cardLabel,
} from "@/lib/poker";
import { Compass, Play, RotateCcw } from "lucide-react";

interface Matchup {
  label: string;
  hero: Card[];
  villain: Card[] | null; // null = random opponent hand each trial
}

const matchups: Matchup[] = [
  {
    label: "A♠A♥ vs K♠K♥ (classic coin-flip-proof pair)",
    hero: [{ rank: 14, suit: 0 }, { rank: 14, suit: 1 }],
    villain: [{ rank: 13, suit: 0 }, { rank: 13, suit: 1 }],
  },
  {
    label: "A♠K♠ (suited) vs Q♥Q♦",
    hero: [{ rank: 14, suit: 0 }, { rank: 13, suit: 0 }],
    villain: [{ rank: 12, suit: 1 }, { rank: 12, suit: 2 }],
  },
  {
    label: "A♠K♥ (offsuit) vs J♠J♥",
    hero: [{ rank: 14, suit: 0 }, { rank: 13, suit: 1 }],
    villain: [{ rank: 11, suit: 0 }, { rank: 11, suit: 1 }],
  },
  {
    label: "7♠2♦ (worst hand) vs random hand",
    hero: [{ rank: 7, suit: 0 }, { rank: 2, suit: 2 }],
    villain: null,
  },
  {
    label: "A♠A♥ vs random hand",
    hero: [{ rank: 14, suit: 0 }, { rank: 14, suit: 1 }],
    villain: null,
  },
];

interface Trial {
  outcome: "win" | "tie" | "loss";
}

function runTrial(hero: Card[], villainFixed: Card[] | null): Trial {
  const deck0 = removeCards(makeDeck(), hero);
  const villain = villainFixed ?? shuffle(deck0).slice(0, 2);
  const deck = villainFixed ? removeCards(deck0, villainFixed) : removeCards(deck0, villain);
  const board = shuffle(deck).slice(0, 5);

  const heroScore = bestScore(hero, board);
  const villainScore = bestScore(villain, board);
  const cmp = compareScores(heroScore, villainScore);
  return { outcome: cmp > 0 ? "win" : cmp < 0 ? "loss" : "tie" };
}

export default function Poker() {
  const [matchupIndex, setMatchupIndex] = useState(0);
  const [trials, setTrials] = useState(2000);
  const [results, setResults] = useState<Trial[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const matchup = matchups[matchupIndex];

  const stats = useMemo(() => {
    if (results.length === 0) return null;
    const wins = results.filter((r) => r.outcome === "win").length;
    const ties = results.filter((r) => r.outcome === "tie").length;
    const losses = results.filter((r) => r.outcome === "loss").length;
    const equity = ((wins + ties / 2) / results.length) * 100;
    return {
      winRate: (wins / results.length) * 100,
      tieRate: (ties / results.length) * 100,
      lossRate: (losses / results.length) * 100,
      equity,
    };
  }, [results]);

  const chartData = useMemo(() => {
    const points: { trial: number; equity: number }[] = [];
    let winSum = 0;
    let tieSum = 0;
    const step = Math.max(1, Math.floor(results.length / 200));
    results.forEach((r, i) => {
      if (r.outcome === "win") winSum++;
      if (r.outcome === "tie") tieSum++;
      if ((i + 1) % step === 0 || i === results.length - 1) {
        points.push({
          trial: i + 1,
          equity: ((winSum + tieSum / 2) / (i + 1)) * 100,
        });
      }
    });
    return points;
  }, [results]);

  const handleSimulate = () => {
    setIsRunning(true);
    setTimeout(() => {
      const out: Trial[] = [];
      for (let i = 0; i < trials; i++) out.push(runTrial(matchup.hero, matchup.villain));
      setResults(out);
      setIsRunning(false);
    }, 50);
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <PageHeader
          icon={Compass}
          title="Poker Equity Lab"
          description="Run a real Monte Carlo simulation to see the exact win probability of one starting hand against another, dealt out over thousands of random boards."
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <ConfigPanel>
              <h2 className="text-xl font-bold">Configuration</h2>

              <RadioField
                label="Matchup"
                name="matchup"
                value={String(matchupIndex)}
                disabled={isRunning}
                onChange={(v) => setMatchupIndex(Number(v))}
                options={matchups.map((m, i) => ({ value: String(i), label: m.label }))}
              />

              <SelectField
                label="Number of Trials"
                value={trials}
                disabled={isRunning}
                onChange={(v) => setTrials(Number(v))}
                options={[500, 1000, 2000, 5000].map((n) => ({
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
            <div className="bg-card border border-accent/20 rounded-xl p-6 flex flex-wrap gap-6 justify-center text-center">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Hero</p>
                <div className="flex gap-2 text-2xl font-bold">
                  {matchup.hero.map((c) => (
                    <span
                      key={cardLabel(c)}
                      className={c.suit === 1 || c.suit === 2 ? "text-red-500" : "text-foreground"}
                    >
                      {cardLabel(c)}
                    </span>
                  ))}
                </div>
              </div>
              <div className="self-center text-muted-foreground font-semibold">vs</div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Villain</p>
                <div className="flex gap-2 text-2xl font-bold">
                  {matchup.villain ? (
                    matchup.villain.map((c) => (
                      <span
                        key={cardLabel(c)}
                        className={c.suit === 1 || c.suit === 2 ? "text-red-500" : "text-foreground"}
                      >
                        {cardLabel(c)}
                      </span>
                    ))
                  ) : (
                    <span className="text-muted-foreground text-base font-normal">
                      random hand, redealt every trial
                    </span>
                  )}
                </div>
              </div>
            </div>

            {results.length > 0 && stats ? (
              <>
                <div>
                  <h2 className="text-2xl font-bold mb-4">Results</h2>
                  <StatGrid
                    stats={[
                      { label: "Hero Equity", value: pct(stats.equity), color: "text-primary" },
                      { label: "Win Rate", value: pct(stats.winRate) },
                      { label: "Tie Rate", value: pct(stats.tieRate) },
                      { label: "Loss Rate", value: pct(stats.lossRate) },
                    ]}
                  />
                </div>

                <LineChartCard
                  title="Equity Estimate Converging"
                  data={chartData}
                  xKey="trial"
                  lines={[{ dataKey: "equity", color: "hsl(var(--primary))" }]}
                  yDomain={[0, 100]}
                />

                <InsightBox>
                  After {results.length.toLocaleString()} randomly dealt boards,
                  the hero's equity settled around {pct(stats.equity)}. Early on
                  the estimate swings wildly — that's the same variance that
                  makes a single poker hand a poor test of skill. Over enough
                  hands, though, the person holding the statistical edge wins
                  more often than not, which is exactly why strong players seek
                  out spots like this one, not just the highest-probability
                  showdown of the moment.
                </InsightBox>
              </>
            ) : (
              <EmptyState description='Pick a matchup on the left and click "Run Simulation" to calculate its equity.' />
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
