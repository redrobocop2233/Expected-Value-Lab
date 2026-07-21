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
| Module              | Description                                                                                                              |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Roulette            | Simulates European and American roulette to study probabilities, expected value, and long-term outcomes.                 |
| Blackjack           | Compares different playing strategies and their impact on player expectation.                                            |
| Slot Machines       | Explores RTP (Return to Player), volatility, and probability distributions using configurable slot models.               |
| Poker Equity        | Uses Monte Carlo simulations to estimate winning probabilities between poker hands.                                      |
| Betting Strategies  | Analyzes popular betting systems such as Martingale, Fibonacci, Flat Betting, and D'Alembert under identical conditions. |
| Expected Value      | Demonstrates how simulated results converge toward the theoretical expected value over many trials.                      |
| Gambler's Ruin      | Studies bankroll survival, ruin probabilities, and long-term betting dynamics.                                           |
| Kelly Criterion     | Explores optimal bankroll management through Kelly betting and compares it with alternative strategies.                  |
| Psychology & Biases | Demonstrates common cognitive biases in gambling, including the gambler's fallacy and streak misconceptions.             |
| Monte Carlo Lab     | Contains general-purpose Monte Carlo experiments for estimating probabilities and mathematical constants.                |
| Finance & Investing | Compares long-term investing with gambling to illustrate differences in expected growth and risk.                        |


