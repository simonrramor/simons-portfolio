export const CELL_STYLES = [
  { name: 'Teal microscopy', poster: '/posters/cells-teal.jpg' },
  { name: 'Heat map', poster: '/posters/cells-heat-map.jpg' },
  { name: 'Infrared', poster: '/posters/cells-infrared-depth.jpg' },
  { name: 'X-ray film', poster: '/posters/cells-xray-film.jpg' },
] as const;

export const CELL_FADE_MS = 220;

// Teal / heat map above infrared / X-ray in one 1920 × 1080 frame.
export function cellSourceRect(index: number, videoWidth: number, videoHeight: number) {
  const width = videoWidth / 2;
  const height = videoHeight / 2;
  return [(index % 2) * width, Math.floor(index / 2) * height, width, height] as const;
}

// Interrupted transitions start from their current mixture.
export function cellBlendWeights(from: readonly number[], target: number, progress: number) {
  const t = Math.max(0, Math.min(1, progress));
  const eased = t * t * (3 - 2 * t);
  return from.map((weight, index) => weight * (1 - eased) + (index === target ? eased : 0));
}
