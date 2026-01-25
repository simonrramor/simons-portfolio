'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './CardSlider.module.css';

interface Card {
  id: number;
  title?: string;
  video?: string;
  poster?: string;
  image?: string;
  label?: string;
  number?: string;
}

interface CardSliderProps {
  cards?: Card[];
}

const defaultCards: Card[] = [
  { id: 1, title: 'Project 1', video: '/project1.mp4', poster: '/posters/project1.png', label: '咲く花', number: '_001' },
  { id: 2, title: 'Project 2', image: '/images/project2.png', label: 'Sling', number: '_002' },
  { id: 3, title: 'Project 3', image: '/images/project3.png', label: 'Oil on canvas', number: '_003' },
  { id: 4, title: 'Project 4', number: '_004' },
  { id: 5, title: 'Project 5', number: '_005' },
  { id: 6, title: 'Project 6', number: '_006' },
  { id: 7, title: 'Project 7', number: '_007' },
  { id: 8, title: 'Project 8', number: '_008' },
  { id: 9, title: 'Project 9', number: '_009' },
];

export default function CardSlider({ cards = defaultCards }: CardSliderProps) {
  const cardsRef = useRef<HTMLDivElement>(null);
  const translateXRef = useRef(0);
  const singleSetWidthRef = useRef(0);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [isOverCard, setIsOverCard] = useState(false);

  // Create duplicated cards for infinite scroll effect
  const duplicatedCards = [...cards, ...cards, ...cards];

  // Track mouse position globally
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleCardMouseEnter = () => setIsOverCard(true);
  const handleCardMouseLeave = () => setIsOverCard(false);

  // Saved grain settings for card 1
  const grainStyle = {
    opacity: 1.0,
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='2.65' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
    mixBlendMode: 'overlay' as React.CSSProperties['mixBlendMode'],
    filter: 'brightness(0.1) contrast(1.45)',
    animation: 'grain 0.033s steps(30) infinite',
  };

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
      } else if (newValue < 0) {
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
      <div 
        className={`${styles.customCursor} ${isOverCard ? styles.customCursorLarge : ''}`}
        style={{ left: cursorPos.x, top: cursorPos.y }}
      />
      <div className={styles.cardsWrapper}>
        <div 
          className={styles.cardsInner}
          ref={cardsRef}
        >
          {duplicatedCards.map((card, index) => (
            <div 
              key={`${card.id}-${index}`} 
              className={styles.card}
              onMouseEnter={handleCardMouseEnter}
              onMouseLeave={handleCardMouseLeave}
            >
              {card.video ? (
                <>
                  <video 
                    className={styles.cardVideo}
                    src={card.video}
                    poster={card.poster}
                    autoPlay
                    loop
                    muted
                    playsInline
                  />
                  <div className={styles.grainOverlay} style={grainStyle} />
                  {card.label && <span className={styles.cardLabel}>{card.label}</span>}
                  {card.number && <span className={styles.cardNumberLabel}>{card.number}</span>}
                </>
              ) : card.image ? (
                <>
                  <img 
                    className={styles.cardImage}
                    src={card.image}
                    alt={card.title || ''}
                  />
                  {card.label && <span className={styles.cardLabel}>{card.label}</span>}
                  {card.number && <span className={styles.cardNumberLabel}>{card.number}</span>}
                </>
              ) : (
                <>
                  <span className={styles.cardNumber}>{card.id}</span>
                  {card.number && <span className={styles.cardNumberLabel}>{card.number}</span>}
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
