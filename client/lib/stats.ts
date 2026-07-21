export function money(n: number): string {
  const sign = n < 0 ? "-" : "";
  return `${sign}₹${Math.abs(n).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function pct(n: number, digits = 2): string {
  return `${n.toFixed(digits)}%`;
}

export function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function variance(values: number[]): number {
  if (values.length === 0) return 0;
  const m = mean(values);
  return mean(values.map((v) => (v - m) ** 2));
}

export function stdDev(values: number[]): number {
  return Math.sqrt(variance(values));
}

/** Standard normal random variable via Box-Muller transform. */
export function gaussianRandom(): number {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}
