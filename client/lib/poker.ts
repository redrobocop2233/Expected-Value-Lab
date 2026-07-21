export interface Card {
  rank: number; // 2-14 (14 = Ace)
  suit: number; // 0-3
}

export function makeDeck(): Card[] {
  const deck: Card[] = [];
  for (let suit = 0; suit < 4; suit++) {
    for (let rank = 2; rank <= 14; rank++) {
      deck.push({ rank, suit });
    }
  }
  return deck;
}

export function removeCards(deck: Card[], used: Card[]): Card[] {
  return deck.filter(
    (c) => !used.some((u) => u.rank === c.rank && u.suit === c.suit),
  );
}

export function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Score a single 5-card hand. Higher score = better hand (compare lexicographically). */
function evaluate5(cards: Card[]): number[] {
  const ranks = cards.map((c) => c.rank).sort((a, b) => b - a);
  const suits = cards.map((c) => c.suit);
  const isFlush = suits.every((s) => s === suits[0]);

  const uniqueRanks = Array.from(new Set(ranks)).sort((a, b) => b - a);
  let straightHigh = 0;
  if (uniqueRanks.length === 5) {
    if (uniqueRanks[0] - uniqueRanks[4] === 4) straightHigh = uniqueRanks[0];
    else if (uniqueRanks.join(",") === "14,5,4,3,2") straightHigh = 5; // wheel (A-2-3-4-5)
  }

  const counts = new Map<number, number>();
  ranks.forEach((r) => counts.set(r, (counts.get(r) ?? 0) + 1));
  const groups = Array.from(counts.entries())
    .map(([rank, count]) => ({ rank, count }))
    .sort((a, b) => b.count - a.count || b.rank - a.rank);
  const pattern = groups.map((g) => g.count).join("");

  if (straightHigh && isFlush) return [8, straightHigh];
  if (pattern === "4111") return [7, groups[0].rank, groups[1].rank];
  if (pattern === "32") return [6, groups[0].rank, groups[1].rank];
  if (isFlush) return [5, ...ranks];
  if (straightHigh) return [4, straightHigh];
  if (pattern === "311") return [3, groups[0].rank, ...groups.slice(1).map((g) => g.rank)];
  if (pattern === "221") return [2, groups[0].rank, groups[1].rank, groups[2].rank];
  if (pattern === "2111") return [1, groups[0].rank, ...groups.slice(1).map((g) => g.rank)];
  return [0, ...ranks];
}

export function compareScores(a: number[], b: number[]): number {
  const len = Math.max(a.length, b.length);
  for (let i = 0; i < len; i++) {
    const av = a[i] ?? 0;
    const bv = b[i] ?? 0;
    if (av !== bv) return av - bv;
  }
  return 0;
}

function combinations5(cards: Card[]): Card[][] {
  const result: Card[][] = [];
  const n = cards.length;
  for (let a = 0; a < n; a++)
    for (let b = a + 1; b < n; b++)
      for (let c = b + 1; c < n; c++)
        for (let d = c + 1; d < n; d++)
          for (let e = d + 1; e < n; e++)
            result.push([cards[a], cards[b], cards[c], cards[d], cards[e]]);
  return result;
}

/** Best 5-card score achievable from 7 cards (2 hole + 5 board). */
export function bestScore(hole: Card[], board: Card[]): number[] {
  const all = [...hole, ...board];
  let best: number[] | null = null;
  for (const combo of combinations5(all)) {
    const score = evaluate5(combo);
    if (!best || compareScores(score, best) > 0) best = score;
  }
  return best!;
}

export const RANK_LABEL: Record<number, string> = {
  14: "A",
  13: "K",
  12: "Q",
  11: "J",
  10: "T",
};

export function cardLabel(c: Card): string {
  const suitSymbol = ["♠", "♥", "♦", "♣"][c.suit];
  return `${RANK_LABEL[c.rank] ?? c.rank}${suitSymbol}`;
}
