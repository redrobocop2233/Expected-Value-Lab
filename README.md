# Expected Value Lab

An interactive lab for exploring probability, statistics, and decision
theory through simulation, starting with a full roulette simulator (European
and American wheels) that visualizes bankroll over time and compares
simulated results against the theoretical expected value.



## Tech stack

- React 18 + React Router 6 + TypeScript
- Vite
- Tailwind CSS
- Recharts (bankroll chart)
- A small set of Radix UI primitives (tooltip, toast) + `lucide-react` icons

## Getting started

```bash
pnpm install
pnpm dev        # start the dev server at http://localhost:8080
```

## Modules

All ten modules are fully built out and interactive:

| Module              | Route               | What it does |
| ------------------- | -------------------- | ------------- |
| Roulette             | `/roulette`           | European/American wheel simulator, bankroll chart, EV vs. actual comparison |
| Blackjack            | `/blackjack`          | Random vs. dealer-mimicking vs. simplified basic strategy vs. always-stand |
| Slot Machines        | `/slots`              | Configurable RTP + volatility with an exact solved paytable |
| Poker Equity         | `/poker`              | Real Monte Carlo hand-vs-hand equity calculator with a 7-card evaluator |
| Betting Strategies   | `/strategies`         | Flat, Martingale, Fibonacci, D'Alembert raced on identical outcomes |
| Expected Value       | `/expected-value`     | Build a wager and watch the simulated average converge on its EV |
| Gambler's Ruin       | `/gamblers-ruin`      | Closed-form ruin probability vs. Monte Carlo, with sample bankroll paths |
| Kelly Criterion      | `/kelly-criterion`    | Optimal bet sizing vs. half/double Kelly vs. a fixed fraction |
| Psychology & Biases  | `/psychology`         | Coin-flip streak simulator demonstrating the gambler's fallacy |
| Monte Carlo Lab      | `/monte-carlo`        | Classic π-estimation experiment with a live scatter plot |
| Finance & Investing  | `/finance`            | Index fund (GBM) vs. savings account vs. regular gambling, same horizon |


