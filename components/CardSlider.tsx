'use client';

import { useEffect, useRef } from 'react';
import styles from './CardSlider.module.css';

interface Card {
  id: number;
  title?: string;
  video?: string;
}

interface CardSliderProps {
  cards?: Card[];
}

const defaultCards: Card[] = [
  { id: 1, title: 'Project 1', video: '/project1.mp4' },
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
  const translateXRef = useRef(0);
  const singleSetWidthRef = useRef(0);

  // Create duplicated cards for infinite scroll effect
  const duplicatedCards = [...cards, ...cards, ...cards];

  useEffect(() => {
    if (!cardsRef.current) return;
    
    // Calculate single set width and start from middle
    singleSetWidthRef.current = cardsRef.current.scrollWidth / 3;
    translateXRef.current = singleSetWidthRef.current;
    cardsRef.current.style.transform = `translateX(-${translateXRef.current}px)`;

    const handleWheel = (e: WheelEvent) => {
      if (!cardsRef.current) return;
      
      e.preventDefault();
      
      const singleSetWidth = singleSetWidthRef.current;
      let newValue = translateXRef.current + e.deltaY * 0.5;
      
      // Wrap around seamlessly
      if (newValue >= singleSetWidth * 2) {
        newValue = newValue - singleSetWidth;
      } else if (newValue < singleSetWidth * 0) {
        newValue = newValue + singleSetWidth;
      }
      
      translateXRef.current = newValue;
      cardsRef.current.style.transform = `translateX(-${newValue}px)`;
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
        >
          {duplicatedCards.map((card, index) => (
            <div key={`${card.id}-${index}`} className={styles.card}>
              {card.video ? (
                <video 
                  className={styles.cardVideo}
                  src={card.video}
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              ) : (
                <span className={styles.cardNumber}>{card.id}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
