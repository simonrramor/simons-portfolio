'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import Image from 'next/image';
import styles from './IPhoneFoldCard.module.css';

export const IPHONE_FOLD_VIEWS = [
  {
    src: '/images/iphone-fold/partly-open-rear.webp',
    name: 'Partly open',
    alt: 'Partly open iPhone Fold concept showing the worn aluminum rear panels and central hinge.',
  },
  {
    src: '/images/iphone-fold/closed-rear.webp',
    name: 'Closed',
    alt: 'Closed iPhone Fold concept with a worn silver back, black Apple logo and black lower panel.',
  },
  {
    src: '/images/iphone-fold/inner-screen.webp',
    name: 'Inner screen',
    alt: 'Unfolded iPhone Fold concept with the original 2007 home-screen icons across its wider display.',
  },
];

interface IPhoneFoldCardProps {
  className: string;
  style: CSSProperties;
  number?: string;
  enabled: boolean;
  viewIndex: number;
  onToggle: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export default function IPhoneFoldCard({
  className, style, number, enabled, viewIndex, onToggle, onMouseEnter, onMouseLeave,
}: IPhoneFoldCardProps) {
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
      aria-label={`iPhone Fold: ${currentView.name}, view ${viewIndex + 1} of ${IPHONE_FOLD_VIEWS.length}. Show ${nextView.name.toLowerCase()}.`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onPointerDown={(event) => { pointerStart.current = { x: event.clientX, y: event.clientY }; }}
      onClick={(event) => {
        if (event.detail !== 0 && Math.hypot(event.clientX - pointerStart.current.x, event.clientY - pointerStart.current.y) > 10) return;
        onToggle();
      }}
    >
      <span className={styles.images}>
        {IPHONE_FOLD_VIEWS.map((view, index) => (
          <Image
            key={view.src}
            src={view.src}
            alt={view.alt}
            aria-hidden={index !== viewIndex}
            fill
            sizes="(max-width: 640px) 70vw, (max-width: 1024px) 40vw, 33vw"
            className={`${styles.image} ${index === viewIndex ? styles.activeImage : ''}`}
            draggable={false}
          />
        ))}
      </span>
      <span className={styles.label}>iPhone Fold</span>
      <span className={styles.number}>{number}</span>
      <span className={styles.caption}>
        <span>{currentView.name} · {viewIndex + 1}/{IPHONE_FOLD_VIEWS.length}</span>
        <span className={styles.hint}>Click to switch</span>
      </span>
    </button>
  );
}
