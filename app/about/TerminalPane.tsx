'use client';

import { memo, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import styles from './TerminalPane.module.css';

type Tone = 'green' | 'blue' | 'lavender' | 'dim' | 'greenBlock' | 'blueBlock' | 'lavenderBlock';
type Segment = { text: string; tone?: Tone };
type Line = Segment[];
type PaneKind = 'table' | 'code' | 'log' | 'cluster' | 'matrix' | 'sparse';

const KINDS: PaneKind[] = ['table', 'log', 'code', 'cluster', 'matrix', 'table', 'sparse', 'code'];
const CONTENT_LENGTHS = [16, 30, 38, 18, 58, 12, 9, 24, 46, 28, 32, 35, 10, 54, 11, 42];
const FONT_SIZES = [8.2, 13, 9.3, 8.5, 7.5, 10.4, 12.5, 11.2, 7.8, 11.8, 10, 9.6, 8.8, 9.2, 12, 10.6];
const LABELS = [
  'human face', 'boy', 'human', 'a book', 'her hands', 'person', 'man', 'woman',
  'child', 'eyes', 'mouth', 'door', 'sky', 'tree', 'window', 'face', 'shadow',
  'hair', 'arm', 'hand', 'his face', 'her face', 'a sign', 'a chair', 'a table',
  'her arm', 'his hand', 'a road', 'cloud', 'water', 'leaf', 'a wall', 'his ear',
  'a phone', 'glass',
];
const SECTIONS = ['VISIONS', 'INFERENCE', 'EMBEDDING', 'DIFFUSION', 'SAMPLING', 'DECODING', 'TRANSFORMS', 'GENESIS', 'SYNTHESIS', 'COMPOSITE'];
const STAGES = ['INPAINTING', 'OUTPAINTING', 'REFINING', 'STYLIZING', 'BLENDING', 'COMPOSITING', 'RENDERING', 'WARMING', 'COOLING'];
const SUBJECTS = ['artwork', 'frame', 'tile', 'patch', 'token', 'batch', 'sample'];
const MORPHS = ['Blobs', 'Layers', 'Heads', 'Channels', 'Tokens', 'Tiles', 'Patches', 'Frames', 'Cells'];
const PROMPTS = [
  'a man reading a book', 'sunset over mountains', 'a forest in autumn',
  'morning light through window', 'a quiet street at dusk', 'children playing in a field',
  'an empty room with chair', 'a boat on the lake', 'rainy city at night',
  'an old garden gate', 'two cats on a windowsill', 'snow falling on rooftops',
];

// A stable tape is populated before the first paint. Resizing a pane only reveals
// more of it; it does not restart its output or generate a different document.
function randomSequence(seed: number) {
  let value = seed >>> 0;
  return () => {
    value = (Math.imul(value, 1664525) + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function pythonLines(): Line[] {
  return [
    [{ text: '#!/usr/bin/env python3', tone: 'dim' }],
    [{ text: 'import ' }, { text: 'os', tone: 'lavender' }],
    [{ text: 'import ' }, { text: 'argparse', tone: 'lavender' }],
    [{ text: 'import ' }, { text: 'visions', tone: 'lavender' }],
    [{ text: 'from ' }, { text: 'PIL', tone: 'blue' }, { text: ' import Image' }],
    [{ text: 'import imageio.v3 as iio' }],
    [],
    [{ text: '# === Argument parsing (only)', tone: 'dim' }],
    [{ text: 'parser = argparse.ArgumentParser()' }],
    [{ text: 'parser.add_argument("--in", type=str)' }],
    [{ text: 'parser.add_argument("--out", type=str)' }],
    [{ text: 'parser.add_argument("--steps", default=108)' }],
    [{ text: 'args = parser.parse_args()' }],
    [],
    [{ text: 'def ' }, { text: 'process', tone: 'green' }, { text: '(path, max_steps):' }],
    [{ text: '    img = Image.open(path)' }],
    [{ text: '    ratio = img.width / img.height' }],
    [{ text: '    if ratio > 1:' }],
    [{ text: '        nw, nh = int(max_steps * ratio), max_steps' }],
    [{ text: '    else:' }],
    [{ text: '        nw, nh = max_steps, int(max_steps / ratio)' }],
    [{ text: '    return img.resize((nw, nh))' }],
    [],
    [{ text: 'def ' }, { text: 'imfit', tone: 'green' }, { text: '(img, max):' }],
    [{ text: '    ratio = img.width / img.height' }],
    [{ text: '    if ratio > 1: nw, nh = int(max * ratio), max' }],
    [{ text: '    else: nw, nh = max, int(max / ratio)' }],
    [{ text: '    return img.resize((nw, nh))' }],
    [],
    [{ text: 'def ' }, { text: 'inpaint', tone: 'green' }, { text: '(img, mask, prompt):' }],
    [{ text: '    return pipe(img, mask, prompt).images[0]' }],
    [],
    [{ text: 'for step in range(args.steps):' }],
    [{ text: '    out = process(args.in_path, step)' }],
    [{ text: '    out.save(f"out_{step:04d}.png")' }],
    [],
    [{ text: 'import ' }, { text: 'torch', tone: 'lavender' }],
    [{ text: 'import ' }, { text: 'numpy', tone: 'lavender' }, { text: ' as np' }],
    [{ text: 'from ' }, { text: 'diffusers', tone: 'blue' }, { text: ' import StableDiffusion' }],
    [],
    [{ text: 'pipe = StableDiffusion.from_pretrained(' }],
    [{ text: '    "runwayml/sd-1.5",', tone: 'green' }],
    [{ text: '    torch_dtype=torch.float16,' }],
    [{ text: ').to("cuda")' }],
    [],
    [{ text: 'def ' }, { text: 'sample', tone: 'green' }, { text: '(prompt, steps=50):' }],
    [{ text: '    g = torch.Generator(device="cuda")' }],
    [{ text: '    g.manual_seed(42)' }],
    [{ text: '    return pipe(prompt, num_inference_steps=steps, generator=g)' }],
    [],
  ];
}

function createTape(id: number, kind: PaneKind): Line[] {
  const random = randomSequence(id * 4099 + 18731);
  const integer = (min: number, max: number) => min + Math.floor(random() * (max - min + 1));
  const pick = <T,>(values: readonly T[]): T => values[integer(0, values.length - 1)];
  const rows: Line[] = [];

  if (kind === 'code') return pythonLines();

  if (kind === 'log' || kind === 'sparse') {
    for (let section = 0; section < 7; section++) {
      const morph = pick(MORPHS);
      const count = integer(8, 32);
      const steps = integer(50, 200);
      rows.push(
        [{ text: `[[=== ${pick(SECTIONS)} ===]]`, tone: 'lavenderBlock' }],
        [{ text: `Processing ${pick(SUBJECTS)}:`, tone: kind === 'log' ? 'green' : undefined }, { text: ` ${integer(100, 999)}` }],
        [{ text: 'Target area: ' }, { text: (random() * 2500).toFixed(13), tone: 'blue' }],
        [{ text: `Max steps: ${steps}` }],
        [{ text: `Source size: (${integer(800, 2000)}, ${integer(800, 2000)})` }],
        [],
        [{ text: 'Loaded data:', tone: 'green' }],
        [{ text: ` - ${morph}: ${count}` }],
        [{ text: ` - Transitions: ${integer(0, 5)}` }],
        [],
        [{ text: `=== STEP [${integer(1, steps)}/${steps}] ===`, tone: 'greenBlock' }],
        [{ text: `Expanding ${morph.toLowerCase()}: ${integer(1, count)}` }],
        [{ text: `State: {${Array.from({ length: integer(4, 11) }, (_, i) => i).join(', ')}}` }],
        [{ text: `=== ${pick(STAGES)} ===`, tone: 'blueBlock' }],
        [{ text: 'Prompt: ' }, { text: pick(PROMPTS), tone: 'lavender' }],
        [{ text: '✓ complete', tone: 'dim' }],
        [],
      );
    }
    return rows;
  }

  for (let row = 0; row < 128; row++) {
    const columns = kind === 'matrix' ? 12 : kind === 'cluster' ? 8 : 7;
    const parts: Line = [{ text: `${String(row + 1).padStart(3)}  ` }];
    for (let column = 0; column < columns; column++) {
      const value = `${String(integer(0, 1999)).padStart(4)} `;
      const selected = kind === 'cluster'
        ? (column >= 2 && column <= 5 && row % 19 >= 5 && row % 19 <= 10) || random() < 0.025
        : random() < 0.022;
      const tone: Tone | undefined = selected
        ? (kind === 'cluster' ? (Math.floor(row / 19) % 2 ? 'lavenderBlock' : 'greenBlock') : 'blueBlock')
        : undefined;
      const last = parts[parts.length - 1];
      if (last.tone === tone) last.text += value;
      else parts.push({ text: value, tone });
    }
    if (kind === 'table') {
      parts.push({ text: ` ${integer(0, 1)}  ${pick(LABELS)}` });
    } else if (kind === 'cluster') {
      parts.push({ text: ` ${(0.85 + random() * 0.1).toFixed(8)}` });
    }
    rows.push(parts);
  }
  return rows;
}

interface TerminalPaneProps {
  id: number;
  running: boolean;
}

function TerminalPane({ id, running }: TerminalPaneProps) {
  const kind = KINDS[Math.abs(id) % KINDS.length];
  const tape = useMemo(() => createTape(id, kind), [id, kind]);
  const randomRef = useRef(randomSequence(id * 7919 + 9173));
  const [cursor, setCursor] = useState(() => Math.abs(id * 7) % 37);
  const burstRef = useRef(0);

  useEffect(() => {
    if (!running) return;
    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      const random = randomRef.current;
      const inBurst = burstRef.current > 0;
      const delay = inBurst ? 75 + random() * 105 : 550 + random() * 2400;
      timer = setTimeout(() => {
        if (!inBurst) burstRef.current = 2 + Math.floor(random() * 5);
        else burstRef.current -= 1;
        const advance = kind === 'sparse' ? 1 : 1 + Math.floor(random() * (kind === 'code' ? 2 : 4));
        setCursor((position) => (position + advance) % tape.length);
        schedule();
      }, delay * (kind === 'sparse' ? 1.8 : 1));
    };
    schedule();
    return () => clearTimeout(timer);
  }, [running, kind, tape.length]);

  const visibleRows = CONTENT_LENGTHS[Math.abs(id) % CONTENT_LENGTHS.length];
  const fontSize = FONT_SIZES[Math.abs(id) % FONT_SIZES.length];

  return (
    <div
      className={`${styles.pane} ${styles[kind]}`}
      data-running={running ? 'true' : 'false'}
      style={{ '--terminal-font-size': `${fontSize}px` } as CSSProperties}
    >
      <div className={styles.content}>
        {Array.from({ length: visibleRows }, (_, offset) => {
          const line = tape[(cursor + offset) % tape.length];
          return (
            <div className={styles.line} key={offset}>
              {line.length ? line.map((segment, index) => (
                <span key={index} className={segment.tone ? styles[segment.tone] : undefined}>
                  {segment.text}
                </span>
              )) : '\u00a0'}
            </div>
          );
        })}
        {kind === 'sparse' && <span className={styles.cursor}>▋</span>}
      </div>
    </div>
  );
}

export default memo(TerminalPane);
