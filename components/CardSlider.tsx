'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './CardSlider.module.css';

interface CardSliderProps {
  cards?: { id: number; title?: string }[];
}

const defaultCards = [
  { id: 1, title: 'Project 1' },
  { id: 2, title: 'Project 2' },
  { id: 3, title: 'Project 3' },
  { id: 4, title: 'Project 4' },
  { id: 5, title: 'Project 5' },
  { id: 6, title: 'Project 6' },
  { id: 7, title: 'Project 7' },
  { id: 8, title: 'Project 8' },
  { id: 9, title: 'Project 9' },
];

export default function CardSlider({ cards = defaultCards }: CardSliderProps) {
  const cardsRef = useRef<HTMLDivElement>(null);
  const [translateX, setTranslateX] = useState(0);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (!cardsRef.current) return;
      
      e.preventDefault();
      
      const cardsContainer = cardsRef.current;
      const cardsWidth = cardsContainer.scrollWidth;
      const viewportWidth = window.innerWidth;
      const maxTranslate = Math.max(0, cardsWidth - viewportWidth + 80);
      
      // Use deltaY (vertical scroll) to control horizontal movement
      setTranslateX(prev => {
        const newValue = prev + e.deltaY;
        return Math.min(maxTranslate, Math.max(0, newValue));
      });
    };

    window.addEventListener('wheel', handleWheel, { passive: false });

    return () => window.removeEventListener('wheel', handleWheel);
  }, []);

  return (
    <div className={styles.scrollContainer}>
      <div className={styles.cardsWrapper}>
        <div 
          className={styles.cardsInner}
          ref={cardsRef}
          style={{ transform: `translateX(-${translateX}px)` }}
        >
          {cards.map((card) => (
            <div key={card.id} className={styles.card}>
              {card.title && (
                <span className={styles.cardTitle}>{card.title}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
