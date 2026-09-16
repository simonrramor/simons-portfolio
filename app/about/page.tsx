'use client';

import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import TerminalPane from './TerminalPane';
import { advanceTree, createTree, layoutTree, paneCount, type PaneBox, type TerminalTree } from './terminal-layout';
import styles from './page.module.css';

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
  const sceneRef = useRef<HTMLDivElement>(null);
  const treeRef = useRef<TerminalTree | null>(null);
  const sizeRef = useRef({ width: 0, height: 0 });
  const countRef = useRef(0);
  const [boxes, setBoxes] = useState<PaneBox[]>([]);
  const [duration, setDuration] = useState(0.55);
  const [intervalMs, setIntervalMs] = useState(1450);
  const [bezier, setBezier] = useState<Bezier>([0.65, 0, 0.35, 1]);
  const [showControls, setShowControls] = useState(false);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(true);
  const [visible, setVisible] = useState(true);
  const running = !paused && !reducedMotion && visible;

  const refresh = useCallback(() => {
    const { width, height } = sizeRef.current;
    if (treeRef.current) setBoxes(layoutTree(treeRef.current, width, height));
  }, []);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotion = () => setReducedMotion(media.matches);
    const updateVisibility = () => setVisible(!document.hidden);
    updateMotion();
    updateVisibility();
    media.addEventListener('change', updateMotion);
    document.addEventListener('visibilitychange', updateVisibility);
    return () => {
      media.removeEventListener('change', updateMotion);
      document.removeEventListener('visibilitychange', updateVisibility);
    };
  }, []);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    const resize = () => {
      const { width, height } = scene.getBoundingClientRect();
      if (!width || !height) return;
      sizeRef.current = { width, height };
      const count = paneCount(width);
      if (!treeRef.current || count !== countRef.current) {
        treeRef.current = createTree(width, height, count);
        countRef.current = count;
      }
      refresh();
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(scene);
    return () => observer.disconnect();
  }, [refresh]);

  useEffect(() => {
    if (!running) return;
    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      timer = setTimeout(() => {
        if (treeRef.current) {
          const { width, height } = sizeRef.current;
          treeRef.current = advanceTree(treeRef.current, width, height);
          refresh();
        }
        schedule();
      }, Math.max(duration * 1000 + 150, intervalMs * (0.7 + Math.random() * 0.6)));
    };
    schedule();
    return () => clearTimeout(timer);
  }, [duration, intervalMs, refresh, running]);

  return (
    <main
      ref={sceneRef}
      className={styles.container}
      data-running={running}
      aria-label="Animated terminal experiment"
      style={{
        '--anim-duration': `${duration}s`,
        '--anim-easing': `cubic-bezier(${bezier.join(',')})`,
      } as CSSProperties}
    >
      <div className={styles.scene} aria-hidden="true">
        {boxes.map((box) => (
          <div
            key={box.id}
            className={styles.box}
            data-pane={box.id}
            style={{ top: box.top, left: box.left, width: box.width, height: box.height }}
          >
            <TerminalPane id={box.id} running={running} />
            <span className={`${styles.corner} ${styles.tl}`} />
            <span className={`${styles.corner} ${styles.tr}`} />
            <span className={`${styles.corner} ${styles.bl}`} />
            <span className={`${styles.corner} ${styles.br}`} />
          </div>
        ))}
      </div>

      <div className={styles.controlsToolbar}>
        <button
          className={styles.controlsToggle}
          onClick={() => setPaused((value) => !value)}
          aria-label={paused ? 'Resume animation' : 'Pause animation'}
          aria-pressed={paused}
          disabled={reducedMotion}
        >
          {reducedMotion ? 'motion off' : paused ? 'resume' : 'pause'}
        </button>
        <button
          className={styles.controlsToggle}
          onClick={() => setShowControls((value) => !value)}
          aria-expanded={showControls}
          aria-controls="terminal-controls"
        >
          {showControls ? 'close' : 'tweak'}
        </button>
      </div>

      {showControls && (
        <div className={styles.controlsPanel} id="terminal-controls">
          <div className={styles.controlGroup}>
            <div className={styles.controlHeader}>
              <label htmlFor="motion-duration">duration</label>
              <span className={styles.controlValue}>{duration.toFixed(2)}s</span>
            </div>
            <input id="motion-duration" type="range" min="0.05" max="3" step="0.05" value={duration}
              onChange={(event) => setDuration(+event.target.value)} />
          </div>
          <div className={styles.controlGroup}>
            <div className={styles.controlHeader}>
              <label htmlFor="motion-interval">interval</label>
              <span className={styles.controlValue}>{(intervalMs / 1000).toFixed(2)}s</span>
            </div>
            <input id="motion-interval" type="range" min="200" max="10000" step="100" value={intervalMs}
              onChange={(event) => setIntervalMs(+event.target.value)} />
          </div>
          <div className={styles.controlGroup}>
            <div className={styles.controlHeader}>
              <span>cubic-bezier</span>
              <span className={styles.controlValue}>{bezier.map((value) => value.toFixed(2)).join(', ')}</span>
            </div>
            <BezierChart value={bezier} onChange={setBezier} />
          </div>
          <div className={styles.presets}>
            {PRESETS.map((preset) => (
              <button key={preset.name} className={styles.presetButton} onClick={() => setBezier(preset.vals)}>
                {preset.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
