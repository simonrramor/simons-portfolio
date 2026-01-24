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
  const [isTransitioning, setIsTransitioning] = useState(true);

  // Create duplicated cards for infinite scroll effect
  const duplicatedCards = [...cards, ...cards, ...cards];

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (!cardsRef.current) return;
      
      e.preventDefault();
      
      const cardsContainer = cardsRef.current;
      const singleSetWidth = cardsContainer.scrollWidth / 3;
      
      setTranslateX(prev => {
        let newValue = prev + e.deltaY * 0.5;
        
        // If we've scrolled past the second set, jump back to first set
        if (newValue >= singleSetWidth * 2) {
          setIsTransitioning(false);
          setTimeout(() => setIsTransitioning(true), 50);
          return newValue - singleSetWidth;
        }
        
        // If we've scrolled before the first set, jump to second set
        if (newValue < 0) {
          setIsTransitioning(false);
          setTimeout(() => setIsTransitioning(true), 50);
          return newValue + singleSetWidth;
        }
        
        return newValue;
      });
    };

    window.addEventListener('wheel', handleWheel, { passive: false });

    return () => window.removeEventListener('wheel', handleWheel);
  }, []);

  // Start from the middle set
  useEffect(() => {
    if (cardsRef.current) {
      const singleSetWidth = cardsRef.current.scrollWidth / 3;
      setTranslateX(singleSetWidth);
    }
  }, []);

  return (
    <div className={styles.scrollContainer}>
      <div className={styles.cardsWrapper}>
        <div 
          className={styles.cardsInner}
          ref={cardsRef}
          style={{ 
            transform: `translateX(-${translateX}px)`,
            transition: isTransitioning ? 'transform 0.15s ease-out' : 'none'
          }}
        >
          {duplicatedCards.map((card, index) => (
            <div key={`${card.id}-${index}`} className={styles.card}>
              <span className={styles.cardNumber}>{card.id}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
