export function pct(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export function pointsRange(p10: number, p90: number): string {
  return `${Math.round(p10)}–${Math.round(p90)} point`;
}
