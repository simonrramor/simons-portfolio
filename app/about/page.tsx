'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import styles from './page.module.css';

const LABELS = [
  'human face', 'boy', 'human', 'a book', 'her hands', 'person', 'man',
  'woman', 'child', 'eyes', 'mouth', 'door', 'sky', 'tree', 'window',
  'face', 'shadow', 'hair', 'arm', 'hand', 'his face', 'her face',
  'a sign', 'a chair', 'a table', 'her arm', 'his hand', 'a road',
  'cloud', 'water', 'leaf', 'a wall', 'his ear', 'a phone', 'glass',
];

function generateRows(count: number): string {
  const lines: string[] = [];
  for (let i = 0; i < count; i++) {
    const idx = (i + 1).toString().padStart(3);
    const nums = Array.from({ length: 8 }, () =>
      Math.floor(Math.random() * 1900).toString().padStart(4),
    ).join(' ');
    const flag = Math.floor(Math.random() * 2);
    const label = LABELS[Math.floor(Math.random() * LABELS.length)];
    lines.push(`${idx}  ${nums}  ${flag}  ${label}`);
  }
  return lines.join('\n');
}

function ScrollingTable() {
  const text = useMemo(() => generateRows(80), []);
  return (
    <div className={styles.terminal}>
      <div className={styles.terminalContent}>
        {text}
        {'\n'}
        {text}
      </div>
    </div>
  );
}

interface BoxData {
  id: number;
  top: number;
  left: number;
  width: number;
  height: number;
  alpha: number;
}

type TreeNode =
  | { kind: 'leaf'; id: number }
  | { kind: 'branch'; direction: 'V' | 'H'; ratio: number; left: TreeNode; right: TreeNode };

const MIN_SIZE = 80;
const COUNT = 14;

let leafIdCounter = 0;

function buildTree(width: number, height: number, leafCount: number): TreeNode {
  if (leafCount <= 1 || (width < MIN_SIZE * 2 && height < MIN_SIZE * 2)) {
    return { kind: 'leaf', id: leafIdCounter++ };
  }

  const canV = width >= MIN_SIZE * 2;
  const canH = height >= MIN_SIZE * 2;
  const direction: 'V' | 'H' = canV && canH
    ? (Math.random() < width / (width + height) ? 'V' : 'H')
    : canV ? 'V' : 'H';

  const ratio = 0.35 + Math.random() * 0.3;

  const leftW = direction === 'V' ? width * ratio : width;
  const leftH = direction === 'H' ? height * ratio : height;
  const rightW = direction === 'V' ? width - leftW : width;
  const rightH = direction === 'H' ? height - leftH : height;

  const leftArea = leftW * leftH;
  const rightArea = rightW * rightH;
  let leftLeaves = Math.max(1, Math.round((leafCount - 1) * leftArea / (leftArea + rightArea)));
  if (leftLeaves >= leafCount) leftLeaves = leafCount - 1;
  const rightLeaves = leafCount - leftLeaves;

  return {
    kind: 'branch',
    direction,
    ratio,
    left: buildTree(leftW, leftH, leftLeaves),
    right: buildTree(rightW, rightH, rightLeaves),
  };
}

function randomizeRatios(node: TreeNode): TreeNode {
  if (node.kind === 'leaf') return node;
  return {
    ...node,
    ratio: 0.3 + Math.random() * 0.4,
    left: randomizeRatios(node.left),
    right: randomizeRatios(node.right),
  };
}

function computeLayout(
  node: TreeNode,
  width: number,
  height: number,
  x = 0,
  y = 0,
): Omit<BoxData, 'alpha'>[] {
  if (node.kind === 'leaf') {
    return [{ id: node.id, left: x, top: y, width, height }];
  }
  if (node.direction === 'V') {
    const leftW = width * node.ratio;
    return [
      ...computeLayout(node.left, leftW, height, x, y),
      ...computeLayout(node.right, width - leftW, height, x + leftW, y),
    ];
  }
  const topH = height * node.ratio;
  return [
    ...computeLayout(node.left, width, topH, x, y),
    ...computeLayout(node.right, width, height - topH, x, y + topH),
  ];
}

type Bezier = [number, number, number, number];

const PRESETS: { name: string; vals: Bezier }[] = [
  { name: 'linear', vals: [0, 0, 1, 1] },
  { name: 'ease', vals: [0.25, 0.1, 0.25, 1] },
  { name: 'ease-in', vals: [0.42, 0, 1, 1] },
  { name: 'ease-out', vals: [0, 0, 0.58, 1] },
  { name: 'ease-in-out', vals: [0.42, 0, 0.58, 1] },
  { name: 'snappy', vals: [0.2, 0.9, 0.4, 1] },
  { name: 'spring', vals: [0.5, 1.6, 0.5, 1] },
];

const CHART_SIZE = 200;
const CHART_PAD = 50;
const CHART_W = CHART_SIZE;
const CHART_H = CHART_SIZE + CHART_PAD * 2;
const Y_MIN = -0.6;
const Y_MAX = 1.6;

function BezierChart({
  value,
  onChange,
}: {
  value: Bezier;
  onChange: (v: Bezier) => void;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragging, setDragging] = useState<0 | 1 | null>(null);

  const toX = (x: number) => x * CHART_SIZE;
  const toY = (y: number) => CHART_PAD + (1 - y) * CHART_SIZE;

  const handlePointerDown = (idx: 0 | 1) => (e: React.PointerEvent<SVGCircleElement>) => {
    e.stopPropagation();
    e.preventDefault();
    svgRef.current?.setPointerCapture(e.pointerId);
    setDragging(idx);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (dragging === null || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const sx = ((e.clientX - rect.left) / rect.width) * CHART_W;
    const sy = ((e.clientY - rect.top) / rect.height) * CHART_H;
    const x = Math.max(0, Math.min(1, sx / CHART_SIZE));
    const y = 1 - (sy - CHART_PAD) / CHART_SIZE;
    const yClamped = Math.max(Y_MIN, Math.min(Y_MAX, y));
    const next = [...value] as Bezier;
    next[dragging * 2] = Math.round(x * 100) / 100;
    next[dragging * 2 + 1] = Math.round(yClamped * 100) / 100;
    onChange(next);
  };

  const handlePointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    if (svgRef.current?.hasPointerCapture(e.pointerId)) {
      svgRef.current.releasePointerCapture(e.pointerId);
    }
    setDragging(null);
  };

  const [x1, y1, x2, y2] = value;
  const path = `M ${toX(0)} ${toY(0)} C ${toX(x1)} ${toY(y1)} ${toX(x2)} ${toY(y2)} ${toX(1)} ${toY(1)}`;

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${CHART_W} ${CHART_H}`}
      preserveAspectRatio="xMidYMid meet"
      className={styles.bezierSvg}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <rect
        x={0}
        y={toY(1)}
        width={CHART_W}
        height={CHART_SIZE}
        fill="none"
        stroke="rgba(255,255,255,0.15)"
        strokeWidth={1}
      />
      <line
        x1={toX(0)}
        y1={toY(0)}
        x2={toX(1)}
        y2={toY(1)}
        stroke="rgba(255,255,255,0.08)"
        strokeWidth={1}
        strokeDasharray="2 4"
      />
      <line
        x1={toX(0)}
        y1={toY(0)}
        x2={toX(x1)}
        y2={toY(y1)}
        stroke="rgba(255,255,255,0.3)"
        strokeWidth={1}
      />
      <line
        x1={toX(1)}
        y1={toY(1)}
        x2={toX(x2)}
        y2={toY(y2)}
        stroke="rgba(255,255,255,0.3)"
        strokeWidth={1}
      />
      <path d={path} fill="none" stroke="white" strokeWidth={1.5} />
      <circle cx={toX(0)} cy={toY(0)} r={3} fill="rgba(255,255,255,0.5)" />
      <circle cx={toX(1)} cy={toY(1)} r={3} fill="rgba(255,255,255,0.5)" />
      <circle
        cx={toX(x1)}
        cy={toY(y1)}
        r={7}
        fill="white"
        className={styles.bezierHandle}
        onPointerDown={handlePointerDown(0)}
      />
      <circle
        cx={toX(x2)}
        cy={toY(y2)}
        r={7}
        fill="white"
        className={styles.bezierHandle}
        onPointerDown={handlePointerDown(1)}
      />
    </svg>
  );
}

export default function About() {
  const treeRef = useRef<TreeNode | null>(null);
  const alphasRef = useRef<Map<number, number>>(new Map());
  const [boxes, setBoxes] = useState<BoxData[]>([]);

  const [duration, setDuration] = useState(1);
  const [intervalMs, setIntervalMs] = useState(2000);
  const [bezier, setBezier] = useState<Bezier>([1, -0.01, 0.01, 1.01]);
  const [showControls, setShowControls] = useState(false);

  const refresh = useCallback(() => {
    if (!treeRef.current) return;
    const layout = computeLayout(treeRef.current, window.innerWidth, window.innerHeight);
    setBoxes(layout.map((b) => {
      if (!alphasRef.current.has(b.id)) {
        alphasRef.current.set(b.id, 0.02 + Math.random() * 0.13);
      }
      return { ...b, alpha: alphasRef.current.get(b.id)! };
    }));
  }, []);

  useEffect(() => {
    treeRef.current = buildTree(window.innerWidth, window.innerHeight, COUNT);
    refresh();

    const onResize = () => refresh();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [refresh]);

  useEffect(() => {
    const id = setInterval(() => {
      if (!treeRef.current) return;
      treeRef.current = randomizeRatios(treeRef.current);
      refresh();
    }, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs, refresh]);

  const easing = `cubic-bezier(${bezier[0]}, ${bezier[1]}, ${bezier[2]}, ${bezier[3]})`;

  return (
    <div
      className={styles.container}
      style={{
        '--anim-duration': `${duration}s`,
        '--anim-easing': easing,
      } as CSSProperties}
    >
      {boxes.map((box, i) => (
        <div
          key={box.id}
          className={styles.box}
          style={{
            top: `${box.top}px`,
            left: `${box.left}px`,
            width: `${box.width}px`,
            height: `${box.height}px`,
            backgroundColor: `rgba(255, 255, 255, ${box.alpha})`,
          }}
        >
          {i === 0 && <ScrollingTable />}
          <span className={`${styles.corner} ${styles.tl}`} />
          <span className={`${styles.corner} ${styles.tr}`} />
          <span className={`${styles.corner} ${styles.bl}`} />
          <span className={`${styles.corner} ${styles.br}`} />
        </div>
      ))}

      <button
        className={styles.controlsToggle}
        onClick={() => setShowControls((s) => !s)}
      >
        {showControls ? 'close' : 'tweak'}
      </button>

      {showControls && (
        <div className={styles.controlsPanel}>
          <div className={styles.controlGroup}>
            <div className={styles.controlHeader}>
              <span>duration</span>
              <span className={styles.controlValue}>{duration.toFixed(2)}s</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="3"
              step="0.05"
              value={duration}
              onChange={(e) => setDuration(+e.target.value)}
            />
          </div>

          <div className={styles.controlGroup}>
            <div className={styles.controlHeader}>
              <span>interval</span>
              <span className={styles.controlValue}>{(intervalMs / 1000).toFixed(2)}s</span>
            </div>
            <input
              type="range"
              min="200"
              max="10000"
              step="100"
              value={intervalMs}
              onChange={(e) => setIntervalMs(+e.target.value)}
            />
          </div>

          <div className={styles.controlGroup}>
            <div className={styles.controlHeader}>
              <span>cubic-bezier</span>
              <span className={styles.controlValue}>
                {bezier.map((v) => v.toFixed(2)).join(', ')}
              </span>
            </div>
            <BezierChart value={bezier} onChange={setBezier} />
          </div>

          <div className={styles.presets}>
            {PRESETS.map((p) => (
              <button
                key={p.name}
                className={styles.presetButton}
                onClick={() => setBezier(p.vals)}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
