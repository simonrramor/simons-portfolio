'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './CardSlider.module.css';
import GrainControls, { defaultGrainSettings } from './GrainControls';

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
  const [grainSettings, setGrainSettings] = useState(defaultGrainSettings);

  // Create duplicated cards for infinite scroll effect
  const duplicatedCards = [...cards, ...cards, ...cards];

  const getGrainStyle = () => {
    const svgNoise = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='${grainSettings.baseFrequency}' numOctaves='${grainSettings.numOctaves}' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`;
    
    return {
      opacity: grainSettings.opacity,
      backgroundImage: svgNoise,
      mixBlendMode: grainSettings.blendMode as React.CSSProperties['mixBlendMode'],
      filter: `brightness(${grainSettings.brightness}) contrast(${grainSettings.contrast})`,
      animation: grainSettings.animated ? `grain ${1 / grainSettings.speed}s steps(${grainSettings.speed}) infinite` : 'none',
    };
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
    <>
      <GrainControls settings={grainSettings} onChange={setGrainSettings} />
      <div className={styles.scrollContainer}>
        <div className={styles.cardsWrapper}>
          <div 
            className={styles.cardsInner}
            ref={cardsRef}
          >
            {duplicatedCards.map((card, index) => (
              <div key={`${card.id}-${index}`} className={styles.card}>
                {card.video ? (
                  <>
                    <video 
                      className={styles.cardVideo}
                      src={card.video}
                      autoPlay
                      loop
                      muted
                      playsInline
                    />
                    <div className={styles.grainOverlay} style={getGrainStyle()} />
                    <span className={styles.cardLabel}>flower_01</span>
                  </>
                ) : (
                  <span className={styles.cardNumber}>{card.id}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
