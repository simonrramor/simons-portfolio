export const CELL_STYLES = [
  { name: 'Heat map', poster: '/posters/cells-heat-map.jpg', atlasIndex: 1, lightBackground: true },
  { name: 'Infrared', poster: '/posters/cells-infrared-depth.jpg', atlasIndex: 2, lightBackground: false },
  { name: 'X-ray film', poster: '/posters/cells-xray-film.jpg', atlasIndex: 3, lightBackground: false },
  { name: 'Teal microscopy', poster: '/posters/cells-teal.jpg', atlasIndex: 0, lightBackground: false },
] as const;

export const CELL_FADE_MS = 220;

// Teal / heat map above infrared / X-ray in one 1920 × 1080 frame.
// Each style keeps its original tile when the display order changes.
export function cellSourceRect(index: number, videoWidth: number, videoHeight: number) {
  const tile = CELL_STYLES[index].atlasIndex;
  const width = videoWidth / 2;
  const height = videoHeight / 2;
  return [(tile % 2) * width, Math.floor(tile / 2) * height, width, height] as const;
}

// Interrupted transitions start from their current mixture.
export function cellBlendWeights(from: readonly number[], target: number, progress: number) {
  const t = Math.max(0, Math.min(1, progress));
  const eased = t * t * (3 - 2 * t);
  return from.map((weight, index) => weight * (1 - eased) + (index === target ? eased : 0));
}
