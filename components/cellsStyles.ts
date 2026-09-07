export const CELL_STYLES = [
  { name: 'Teal microscopy', poster: '/posters/cells-teal.jpg' },
  { name: 'Heat map', poster: '/posters/cells-heat-map.jpg' },
  { name: 'Infrared', poster: '/posters/cells-infrared.jpg' },
] as const;

export const CELL_FADE_MS = 220;

// Interrupted transitions start from their current mixture.
export function cellBlendWeights(from: readonly number[], target: number, progress: number) {
  const t = Math.max(0, Math.min(1, progress));
  const eased = t * t * (3 - 2 * t);
  return from.map((weight, index) => weight * (1 - eased) + (index === target ? eased : 0));
}
