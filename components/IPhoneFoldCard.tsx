'use client';

import { useEffect, useId, useRef, useState, type CSSProperties } from 'react';
import Image from 'next/image';
import styles from './IPhoneFoldCard.module.css';

export const IPHONE_FOLD_VIEWS = [
  {
    src: '/images/iphone-fold/partly-open-rear-display.webp',
    width: 1400,
    height: 1600,
    name: 'Partly open',
    alt: 'Partly open iPhone Fold concept showing the worn aluminum rear panels and central hinge.',
  },
  {
    src: '/images/iphone-fold/closed-rear-display.webp',
    width: 1400,
    height: 1600,
    name: 'Closed',
    alt: 'Closed iPhone Fold concept with a worn silver back, black Apple logo and black lower panel.',
  },
  {
    src: '/images/iphone-fold/inner-screen-display.webp',
    width: 1400,
    height: 1600,
    name: 'Inner screen',
    alt: 'Unfolded iPhone Fold concept with the original 2007 home-screen icons across its wider display.',
  },
];

interface IPhoneFoldCardProps {
  className: string;
  style: CSSProperties;
  number?: string;
  enabled: boolean;
  expanded?: boolean;
  viewIndex: number;
  onToggle: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export default function IPhoneFoldCard({
  className, style, number, enabled, expanded = false, viewIndex, onToggle, onMouseEnter, onMouseLeave,
}: IPhoneFoldCardProps) {
  const backgroundId = useId();
  const cardRef = useRef<HTMLButtonElement>(null);
  const pointerStart = useRef({ x: 0, y: 0 });
  const [visible, setVisible] = useState(false);
  const currentView = IPHONE_FOLD_VIEWS[viewIndex];
  const nextView = IPHONE_FOLD_VIEWS[(viewIndex + 1) % IPHONE_FOLD_VIEWS.length];

  useEffect(() => {
    const card = cardRef.current;
    if (!card || !enabled) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    observer.observe(card);
    return () => observer.disconnect();
  }, [enabled]);

  return (
    <button
      ref={cardRef}
      type="button"
      className={`${className} ${styles.phoneCard}`}
      style={style}
      tabIndex={enabled && visible ? 0 : -1}
      aria-label={expanded ? `iPhone Fold: ${currentView.name}, view ${viewIndex + 1} of ${IPHONE_FOLD_VIEWS.length}. Show ${nextView.name.toLowerCase()}.` : 'Expand iPhone Fold'}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onPointerDown={(event) => { pointerStart.current = { x: event.clientX, y: event.clientY }; }}
      onClick={(event) => {
        if (event.detail !== 0 && Math.hypot(event.clientX - pointerStart.current.x, event.clientY - pointerStart.current.y) > 10) return;
        onToggle();
      }}
    >
      {IPHONE_FOLD_VIEWS.map((view, index) => (
        <svg
          key={`background-${view.src}`}
          className={`${styles.background} ${index === viewIndex ? styles.activeImage : ''}`}
          viewBox="0 0 1400 2200"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
          focusable="false"
        >
          <defs>
            {/* Repeat only a clear background patch, preserving each edit's grain. */}
            <pattern
              id={`${backgroundId}-${index}`}
              patternUnits="userSpaceOnUse"
              width={128 * 1400 / view.width}
              height={128 * 1400 / view.width}
              viewBox="0 0 128 128"
            >
              <image href={view.src} x="-32" y="-32" width={view.width} height={view.height} />
            </pattern>
          </defs>
          <rect width="1400" height="2200" fill={`url(#${backgroundId}-${index})`} />
        </svg>
      ))}
      <span className={styles.images}>
        {IPHONE_FOLD_VIEWS.map((view, index) => (
          <Image
            key={view.src}
            src={view.src}
            alt={view.alt}
            aria-hidden={index !== viewIndex}
            width={view.width}
            height={view.height}
            sizes="(max-width: 640px) 70vw, (max-width: 1024px) 40vw, 33vw"
            // Start the opening view in the initial HTML, before View Work.
            // The carousel and modal share the same compressed URLs and cache.
            preload={index === 0}
            loading={index === 0 ? undefined : enabled || expanded ? 'eager' : 'lazy'}
            fetchPriority={index === viewIndex ? 'high' : 'low'}
            className={`${styles.image} ${index === viewIndex ? styles.activeImage : ''}`}
            draggable={false}
          />
        ))}
      </span>
      {!expanded && <>
      <span className={styles.label}><span style={{ textTransform: 'none' }}>i</span>Phone Fold</span>
      <span className={styles.number}>{number}</span>
      </>}
    </button>
  );
}
