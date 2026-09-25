export function nextRandom(state: number): { value: number; state: number } {
  let x = state | 0
  x ^= x << 13; x ^= x >>> 17; x ^= x << 5
  return { value: (x >>> 0) / 4294967296, state: x >>> 0 }
}

export function shuffled<T>(items: T[], seed: number): { items: T[]; state: number } {
  const copy = [...items]
  let state = seed || 1
  for (let i = copy.length - 1; i > 0; i--) {
    const next = nextRandom(state); state = next.state
    const j = Math.floor(next.value * (i + 1)); [copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return { items: copy, state }
}
