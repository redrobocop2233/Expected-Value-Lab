import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import {
  BarChart3,
  TrendingDown,
  Lightbulb,
  Zap,
  Brain,
  ArrowRight,
  Dice6,
  Spade,
  LineChart,
  Target,
  Compass,
  TrendingUp,
  Dice5,
  FlaskConical,
  Wallet,
} from "lucide-react";

const modules = [
  {
    title: "Roulette",
    description:
      "Simulate European & American roulette. See bankroll convergence and house edge in action.",
    href: "/roulette",
    icon: Dice6,
  },
  {
    title: "Blackjack",
    description:
      "Compare random play vs. dealer-mimicking vs. simplified basic strategy. Measure skill's real impact.",
    href: "/blackjack",
    icon: Spade,
  },
  {
    title: "Slot Machines",
    description:
      "Configure RTP and volatility. Understand why 96% RTP doesn't mean what you think.",
    href: "/slots",
    icon: Zap,
  },
  {
    title: "Poker Equity",
    description:
      "A real Monte Carlo hand-vs-hand equity calculator, built on a full 7-card evaluator.",
    href: "/poker",
    icon: Compass,
  },
  {
    title: "Betting Strategies",
    description:
      "Martingale, Fibonacci, D'Alembert, and flat betting — watch them all race on one graph.",
    href: "/strategies",
    icon: LineChart,
  },
  {
    title: "Expected Value",
    description:
      "The foundation of all gambling math. Build a wager and watch it converge to its EV.",
    href: "/expected-value",
    icon: Target,
  },
  {
    title: "Gambler's Ruin",
    description:
      "The closed-form probability of going broke before hitting your target, versus simulation.",
    href: "/gamblers-ruin",
    icon: TrendingDown,
  },
  {
    title: "Kelly Criterion",
    description:
      "Optimal bet sizing for long-run growth — and why over-betting your edge backfires.",
    href: "/kelly-criterion",
    icon: Dice5,
  },
  {
    title: "Psychology & Biases",
    description:
      "Gambler's fallacy, hot hand illusion, loss aversion. Why we make bad decisions.",
    href: "/psychology",
    icon: Brain,
  },
  {
    title: "Monte Carlo Lab",
    description:
      "The classic pi-estimation experiment: random points, a live scatter plot, real confidence intervals.",
    href: "/monte-carlo",
    icon: FlaskConical,
  },
  {
    title: "Finance & Investing",
    description:
      "Index funds vs. savings vs. regular gambling — same starting capital, same time horizon.",
    href: "/finance",
    icon: Wallet,
  },
];

const whyItMatters = [
  {
    icon: TrendingDown,
    title: "Understand Expected Value",
    description:
      "The most important concept in gambling, investing, and decision making. Watch how it determines long-term outcomes.",
  },
  {
    icon: Brain,
    title: "Recognize Cognitive Biases",
    description:
      "Learn how your brain deceives you: gambler's fallacy, illusion of control, sunk cost fallacy, and more. See them in action.",
  },
  {
    icon: Zap,
    title: "Apply to Finance",
    description:
      "The same mathematical tools apply to stocks, crypto, and investing. Learn why financial markets are different from casinos.",
  },
  {
    icon: BarChart3,
    title: "Master Simulation",
    description:
      "Monte Carlo simulations, confidence intervals, variance, and convergence. Tools used in finance and science.",
  },
];

const chipColor = ["text-primary", "text-secondary", "text-accent"];

export default function Index() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent/40 bg-card text-xs font-bold uppercase tracking-wider text-accent mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              Interactive probability simulations
            </div>
            <h1 className="neon-heading text-5xl sm:text-7xl font-black tracking-tight mb-6 leading-tight">
              Why Does the Casino Always Win?
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Explore probability, statistics, and decision theory through
              interactive simulations. Understand the mathematics behind
              gambling, investing, and life decisions.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/roulette"
                className="inline-flex items-center justify-center px-8 py-3 rounded-lg bg-gradient-to-r from-primary to-secondary text-primary-foreground font-bold transition-all hover:opacity-90 glow-ring"
              >
                Start Exploring <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center justify-center px-8 py-3 rounded-lg border border-accent/40 text-accent font-bold hover:bg-accent/10 transition-colors"
              >
                Learn More
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Key Insight */}
      <section className="py-16 bg-card/60 border-y border-accent/20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-card border border-accent/25 rounded-2xl p-8 sm:p-12 glow-ring-accent">
            <div className="flex gap-4 items-start">
              <Lightbulb className="w-8 h-8 text-accent flex-shrink-0 mt-0.5" />
              <div>
                <h2 className="text-2xl font-bold mb-3 text-foreground">
                  The Core Question
                </h2>
                <p className="text-lg text-muted-foreground mb-4">
                  Most gambling simulators just spin wheels and show outcomes.
                  This laboratory goes deeper.
                </p>
                <p className="text-base text-muted-foreground">
                  Even when players win big occasionally, over thousands of
                  spins the average return converges toward the negative
                  expected value. This is why{" "}
                  <strong className="text-accent">
                    the house always wins in the long run
                  </strong>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modules Grid */}
      <section id="features" className="py-20 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground">
              Interactive Modules
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Experiment with probability through these interactive labs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((feature) => {
              const Icon = feature.icon;
              return (
                <Link
                  key={feature.href}
                  to={feature.href}
                  className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 transition-all hover:border-accent/50 hover:glow-ring-accent"
                >
                  <div className="relative">
                    <div className="inline-flex items-center justify-center w-11 h-11 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 text-primary mb-4 group-hover:from-primary/30 group-hover:to-secondary/30 transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-foreground group-hover:text-accent transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {feature.description}
                    </p>
                    <div className="flex items-center text-sm font-semibold text-accent group-hover:translate-x-1 transition-transform">
                      Explore <ArrowRight className="ml-2 w-4 h-4" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why This Matters */}
      <section className="py-20 sm:py-32 bg-card/40 border-y border-accent/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold mb-12 text-center text-foreground">
            Why This Matters
          </h2>

          <div className="space-y-8">
            {whyItMatters.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="flex gap-4 items-start">
                  <Icon
                    className={`w-8 h-8 flex-shrink-0 mt-0.5 ${chipColor[idx % chipColor.length]}`}
                  />
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-foreground">
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-primary/10 via-card to-secondary/10 border-y border-accent/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-foreground">
            Ready to Explore?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Start with Roulette to see how simulations reveal the mathematics
            of probability in action.
          </p>
          <Link
            to="/roulette"
            className="inline-flex items-center justify-center px-8 py-3 rounded-lg bg-gradient-to-r from-primary to-secondary text-primary-foreground font-bold transition-all hover:opacity-90 glow-ring"
          >
            Launch Roulette Lab <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </section>
    </Layout>
  );
}
