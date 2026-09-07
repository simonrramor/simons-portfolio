'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import styles from './CellsCard.module.css';

const variants = [
  { name: 'Teal microscopy', video: '/videos/cells-teal.mp4', poster: '/posters/cells-teal.jpg' },
  { name: 'Heat map', video: '/videos/cells-heat-map.mp4', poster: '/posters/cells-heat-map.jpg' },
] as const;

export interface CellsPlayback {
  video: HTMLVideoElement | null;
  time: number;
}

interface CellsCardProps {
  className: string;
  style: CSSProperties;
  number?: string;
  enabled: boolean;
  variantIndex: number;
  switchTime: number;
  getPlayback: () => CellsPlayback;
  onPlaybackChange: (video: HTMLVideoElement, time: number) => void;
  onToggle: (time: number) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export default function CellsCard({
  className, style, number, enabled, variantIndex, switchTime, getPlayback, onPlaybackChange,
  onToggle, onMouseEnter, onMouseLeave,
}: CellsCardProps) {
  const cardRef = useRef<HTMLButtonElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const pointerStart = useRef({ x: 0, y: 0 });
  const previousVariant = useRef(variantIndex);
  const [visible, setVisible] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const variant = variants[variantIndex];
  const nextVariant = variants[(variantIndex + 1) % variants.length];

  useEffect(() => {
    const card = cardRef.current;
    if (!card || !enabled) return;
    const observer = new IntersectionObserver(([entry]) => {
      setVisible(entry.isIntersecting);
      if (entry.isIntersecting) setLoaded(true);
    });
    observer.observe(card);
    return () => observer.disconnect();
  }, [enabled]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const changed = previousVariant.current !== variantIndex;
    previousVariant.current = variantIndex;
    if (enabled && visible) {
      const clock = getPlayback();
      const previousVideo = clock.video;
      const time = changed ? switchTime :
        previousVideo && previousVideo.readyState >= 1 ? previousVideo.currentTime : clock.time;
      if (previousVideo && previousVideo !== video) previousVideo.pause();
      onPlaybackChange(video, time);
      if (video.readyState >= 1 && video.duration > 0) video.currentTime = time % video.duration;
      void video.play().catch(() => { /* The poster remains if autoplay is unavailable. */ });
    } else {
      video.pause();
    }
  }, [enabled, loaded, visible, variantIndex, switchTime, getPlayback, onPlaybackChange]);

  return (
    <button
      ref={cardRef}
      type="button"
      className={`${className} ${styles.cellsCard} ${variantIndex === 1 ? styles.heatMap : ''}`}
      style={style}
      tabIndex={enabled && visible ? 0 : -1}
      aria-label={`Cells: ${variant.name}. Switch to ${nextVariant.name.toLowerCase()}.`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onPointerDown={(event) => { pointerStart.current = { x: event.clientX, y: event.clientY }; }}
      onClick={(event) => {
        if (event.detail !== 0 && Math.hypot(event.clientX - pointerStart.current.x, event.clientY - pointerStart.current.y) > 10) return;
        const video = videoRef.current;
        const time = video && video.readyState >= 1 ? video.currentTime : getPlayback().time;
        onToggle(time);
      }}
    >
      <video
        ref={videoRef}
        className={styles.video}
        src={loaded ? variant.video : undefined}
        poster={variant.poster}
        preload="metadata"
        autoPlay={enabled && visible}
        muted
        loop
        playsInline
        aria-hidden="true"
        onTimeUpdate={(event) => {
          const video = event.currentTarget;
          if (getPlayback().video === video && video.readyState >= 2) onPlaybackChange(video, video.currentTime);
        }}
        onLoadedMetadata={(event) => {
          const video = event.currentTarget;
          const clock = getPlayback();
          if (enabled && visible && clock.video === video) {
            if (Number.isFinite(video.duration) && video.duration > 0) video.currentTime = clock.time % video.duration;
            void video.play().catch(() => {});
          }
        }}
      />
      <span className={styles.label}>Cells</span>
      <span className={styles.number}>{number}</span>
      <span className={styles.caption}>
        <span>{variant.name}</span>
        <span className={styles.hint}>Click to switch</span>
      </span>
    </button>
  );
}
