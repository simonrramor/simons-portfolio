// Replace only the border-connected flat backdrop; keep all other pixels intact.
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
const files = [
  'morse-investments', 'morse-savings', 'morse-bill-splits',
  'morse-bill-pay', 'morse-growth',
  'spotify-global-privacy-controls', 'spotify-local-files',
  'monzo-get-paid-early', 'monzo-bills-pots',
];
const red = [255, 59, 48];
(async () => {
  for (const name of files) {
    const source = fileURLToPath(new URL(`../public/images/${name}.png`, import.meta.url));
    const { data, info } = await sharp(source).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const original = Buffer.from(data);
    const { width, height } = info;
    const size = width * height;
    const backdrop = Array.from(data.subarray(0, 3));
    const visited = new Uint8Array(size);
    const queue = new Int32Array(size);
    let tail = 0;
    const enqueue = index => {
      if (visited[index]) return;
      const offset = index * 4;
      if (!backdrop.every((channel, i) => Math.abs(data[offset + i] - channel) <= 2)) return;
      visited[index] = 1;
      queue[tail++] = index;
    };
    for (let x = 0; x < width; x++) { enqueue(x); enqueue((height - 1) * width + x); }
    for (let y = 0; y < height; y++) { enqueue(y * width); enqueue(y * width + width - 1); }
    for (let head = 0; head < tail; head++) {
      const index = queue[head];
      const x = index % width;
      if (x > 0) enqueue(index - 1);
      if (x < width - 1) enqueue(index + 1);
      if (index >= width) enqueue(index - width);
      if (index < size - width) enqueue(index + width);
    }
    if (tail < size * 0.4 || tail > size * 0.9) throw Error(`Unexpected background coverage: ${name}`);
    for (let i = 0; i < size; i++) {
      if (visited[i]) { data.set(red, i * 4); data[i * 4 + 3] = 255; }
      else for (let c = 0; c < 4; c++) if (data[i * 4 + c] !== original[i * 4 + c]) throw Error('Foreground changed');
    }
    const output = source.replace('.png', '-red.png');
    await sharp(data, { raw: info }).png().toFile(output);
    console.log(`${name}: ${(100 * tail / size).toFixed(1)}% backdrop replaced; foreground unchanged`);
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
