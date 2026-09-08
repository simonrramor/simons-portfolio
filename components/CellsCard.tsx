'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { useCellsPlayback } from './CellsPlayback';
import { CELL_STYLES, CELL_FADE_MS, cellBlendWeights, cellSourceRect } from './cellsStyles';
import styles from './CellsCard.module.css';

interface CellsCardProps {
  className: string;
  style: CSSProperties;
  number?: string;
  enabled: boolean;
  expanded?: boolean;
  variantIndex: number;
  onToggle: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export default function CellsCard({
  className, style, number, enabled, expanded = false, variantIndex, onToggle, onMouseEnter, onMouseLeave,
}: CellsCardProps) {
  const cardRef = useRef<HTMLButtonElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const identity = useRef(Symbol('cells-card'));
  const pointerStart = useRef({ x: 0, y: 0 });
  const transition = useRef({
    from: CELL_STYLES.map((_, index) => Number(index === variantIndex)),
    target: variantIndex,
    started: 0,
  });
  const [visible, setVisible] = useState(false);
  const { getVideo, setVisible: reportVisibility, resume } = useCellsPlayback();
  const variant = CELL_STYLES[variantIndex];
  const nextVariant = CELL_STYLES[(variantIndex + 1) % CELL_STYLES.length];

  useEffect(() => {
    const now = performance.now();
    const previous = transition.current;
    transition.current = {
      from: cellBlendWeights(previous.from, previous.target, (now - previous.started) / CELL_FADE_MS),
      target: variantIndex,
      started: now,
    };
  }, [variantIndex]);

  useEffect(() => {
    const card = cardRef.current;
    const id = identity.current;
    if (!card || !enabled) return;
    const observer = new IntersectionObserver(([entry]) => {
      setVisible(entry.isIntersecting);
      reportVisibility(id, entry.isIntersecting);
    });
    observer.observe(card);
    return () => {
      observer.disconnect();
      reportVisibility(id, false);
    };
  }, [enabled, reportVisibility]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !enabled || !visible) return;
    const context = canvas.getContext('2d', { alpha: false });
    if (!context) return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;

    const draw = (now: number) => {
      const video = getVideo();
      if (video && video.readyState >= 2 && !video.seeking) {
        const { from, target, started } = transition.current;
        const weights = cellBlendWeights(from, target,
          reducedMotion.matches ? 1 : (now - started) / CELL_FADE_MS);
        context.globalAlpha = 1;
        context.globalCompositeOperation = 'source-over';
        context.fillStyle = '#000';
        context.fillRect(0, 0, canvas.width, canvas.height);
        // Additive weighted composition avoids a dark dip during the fade.
        // All tiles come from the SAME decoded frame, with motion continuing.
        context.globalCompositeOperation = 'lighter';
        weights.forEach((weight, index) => {
          if (weight <= 0) return;
          context.globalAlpha = weight;
          context.drawImage(video, ...cellSourceRect(index, video.videoWidth, video.videoHeight),
            0, 0, canvas.width, canvas.height);
        });
        context.globalCompositeOperation = 'source-over';
        context.globalAlpha = 1;
        canvas.style.opacity = '1';
      }
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [enabled, visible, getVideo]);

  return (
    <button
      ref={cardRef}
      type="button"
      className={`${className} ${styles.cellsCard} ${variant.lightBackground ? styles.heatMap : ''}`}
      style={{ ...style, backgroundImage: `url("${variant.poster}")` }}
      tabIndex={enabled && visible ? 0 : -1}
      aria-label={expanded ? `Cells: ${variant.name}. Switch to ${nextVariant.name.toLowerCase()}.` : 'Expand Cells'}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onPointerDown={(event) => { pointerStart.current = { x: event.clientX, y: event.clientY }; }}
      onClick={(event) => {
        if (event.detail !== 0 && Math.hypot(event.clientX - pointerStart.current.x, event.clientY - pointerStart.current.y) > 10) return;
        resume();
        onToggle();
      }}
    >
      <canvas ref={canvasRef} className={styles.canvas} width={960} height={540} aria-hidden="true" />
      <span className={styles.label}>Cells</span>
      <span className={styles.number}>{number}</span>
      <span className={styles.caption}>
        <span>{variant.name}</span>
        <span className={styles.hint}>{expanded ? 'Click to switch' : 'Click to expand'}</span>
      </span>
    </button>
  );
}
