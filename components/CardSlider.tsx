'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import styles from './CardSlider.module.css';

// Progressive image component - loads low-res first, then full-res
function ProgressiveImage({ 
  src, 
  alt, 
  objectPosition,
  priority = false 
}: { 
  src: string; 
  alt: string; 
  objectPosition?: string;
  priority?: boolean;
}) {
  const [isLoaded, setIsLoaded] = useState(false);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  return (
    <>
      {/* Low-res blurred version - loads fast */}
      <Image
        className={`${styles.cardImage} ${styles.cardImageLowRes}`}
        src={src}
        alt={alt}
        fill
        sizes="50px"
        quality={1}
        style={{ 
          objectPosition,
          opacity: isLoaded ? 0 : 1,
        }}
      />
      {/* Full-res version - fades in when loaded */}
      <Image
        className={styles.cardImage}
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 50vw, 33vw"
        priority={priority}
        quality={85}
        onLoad={handleLoad}
        style={{ 
          objectPosition,
          opacity: isLoaded ? 1 : 0,
        }}
      />
    </>
  );
}

interface Card {
  id: number;
  title?: string;
  video?: string;
  poster?: string;
  image?: string;
  label?: string;
  number?: string;
  imagePosition?: string;
  logo?: string;
  logoHeight?: number;
  grainOnly?: boolean;
  showControls?: boolean;
  hasBorder?: boolean;
  darkText?: boolean;
}

interface CardSliderProps {
  cards?: Card[];
}

const defaultCards: Card[] = [
  { id: 1, title: 'Project 1', video: '/project1.mp4', poster: '/posters/project1.png', label: '咲く花', number: '_001', logo: '/images/stars-icon.svg' },
  { id: 2, title: 'Project 2', image: '/images/project2.png', label: 'Sling', number: '_002', logo: '/images/sling-logo.png' },
  { id: 3, title: 'Project 3', video: '/project7.webm', label: 'Face tracking', number: '_003', grainOnly: true, logo: '/images/qr-code-icon.svg' },
  { id: 4, title: 'Project 4', image: '/images/project4.png', label: 'Group Sessions', number: '_004', logo: '/images/spotify-logo.png' },
  { id: 5, title: 'Project 5', image: '/images/project6.png', label: 'Enhance', number: '_005', imagePosition: 'top', logo: '/images/spotify-logo.png' },
  { id: 6, title: 'Project 6', video: '/project8.mp4', label: 'Neome', number: '_006', showControls: true },
  { id: 7, title: 'Project 7', image: '/images/project5.png', label: 'Shared tabs', number: '_007', imagePosition: 'left', logo: '/images/monzo-logo.png', logoHeight: 24 },
];


export default function CardSlider({ cards = defaultCards }: CardSliderProps) {
  const cardsRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const translateXRef = useRef(0);
  const targetXRef = useRef(0);
  const singleSetWidthRef = useRef(0);
  const [isOverCard, setIsOverCard] = useState(false);
  
  // Fixed video effects for card 8
  const videoEffects = {
    brightness: 95,
    contrast: 100,
    saturation: 150,
    grain: 100,
  };

  // Create duplicated cards for infinite scroll effect
  const duplicatedCards = [...cards, ...cards, ...cards];

  // Track mouse position globally
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (cursorRef.current) {
        cursorRef.current.style.left = `${e.clientX}px`;
        cursorRef.current.style.top = `${e.clientY}px`;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleCardMouseEnter = () => setIsOverCard(true);
  const handleCardMouseLeave = () => setIsOverCard(false);

  // Grain settings with overlay filter (for project 1)
  const grainStyle = {
    opacity: 1.0,
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='2.65' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
    mixBlendMode: 'overlay' as React.CSSProperties['mixBlendMode'],
    filter: 'brightness(0.1) contrast(1.45)',
    animation: 'grain 0.033s steps(30) infinite',
  };

  // Grain only (no overlay filter)
  const grainOnlyStyle = {
    opacity: 0.3,
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='2.65' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
    mixBlendMode: 'overlay' as React.CSSProperties['mixBlendMode'],
    animation: 'grain 0.033s steps(30) infinite',
  };

  // Initialize positions and set up wheel handler
  useEffect(() => {
    if (!cardsRef.current) return;
    
    // Calculate single set width and start from middle
    singleSetWidthRef.current = cardsRef.current.scrollWidth / 3;
    translateXRef.current = singleSetWidthRef.current;
    targetXRef.current = singleSetWidthRef.current;
    cardsRef.current.style.transform = `translate3d(-${translateXRef.current}px, 0, 0)`;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      
      const singleSetWidth = singleSetWidthRef.current;
      // Normalize and cap deltaY to prevent huge jumps from fast scrolling
      const maxDelta = 100;
      const delta = Math.max(-maxDelta, Math.min(maxDelta, e.deltaY)) * 0.8;
      let newTarget = targetXRef.current + delta;
      
      // Wrap around seamlessly for target
      if (newTarget >= singleSetWidth * 2) {
        newTarget = newTarget - singleSetWidth;
        // Also adjust current position to prevent animation across the wrap
        translateXRef.current = translateXRef.current - singleSetWidth;
      } else if (newTarget < 0) {
        newTarget = newTarget + singleSetWidth;
        translateXRef.current = translateXRef.current + singleSetWidth;
      }
      
      targetXRef.current = newTarget;
    };

    window.addEventListener('wheel', handleWheel, { passive: false });

    return () => window.removeEventListener('wheel', handleWheel);
  }, []);

  // Smooth animation loop with lerp
  useEffect(() => {
    if (!cardsRef.current) return;
    
    let animationId: number;
    
    const animate = () => {
      if (!cardsRef.current) return;
      
      const current = translateXRef.current;
      const target = targetXRef.current;
      const diff = target - current;
      
      // Lerp factor (higher = more responsive)
      translateXRef.current += diff * 0.15;
      
      // Apply transform with translate3d for GPU acceleration
      cardsRef.current.style.transform = `translate3d(-${translateXRef.current}px, 0, 0)`;
      
      animationId = requestAnimationFrame(animate);
    };
    
    animationId = requestAnimationFrame(animate);
    
    return () => cancelAnimationFrame(animationId);
  }, []);

  // Video filter style for card 8
  const videoFilterStyle = {
    filter: `brightness(${videoEffects.brightness}%) contrast(${videoEffects.contrast}%) saturate(${videoEffects.saturation}%)`,
  };

  // Grain style for card 8 based on slider
  const card8GrainStyle = {
    opacity: videoEffects.grain / 100,
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='2.65' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
    mixBlendMode: 'overlay' as React.CSSProperties['mixBlendMode'],
    animation: 'grain 0.033s steps(30) infinite',
  };

  return (
    <div className={styles.scrollContainer}>
        <div 
          ref={cursorRef}
          className={`${styles.customCursor} ${isOverCard ? styles.customCursorLarge : ''}`}
        />
        <div className={styles.cardsWrapper}>
        <div 
          className={styles.cardsInner}
          ref={cardsRef}
        >
          {duplicatedCards.map((card, index) => (
            <div 
              key={`${card.id}-${index}`} 
              className={`${styles.card} ${styles.cardAnimate} ${card.hasBorder ? styles.cardWithBorder : ''}`}
              style={{ animationDelay: `${(index % cards.length) * 0.1}s` }}
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
                    style={card.showControls ? videoFilterStyle : undefined}
                    onLoadedMetadata={(e) => {
                      if (card.showControls) {
                        (e.target as HTMLVideoElement).playbackRate = 0.5;
                      }
                    }}
                  />
                  {!card.showControls && (
                    <div className={styles.grainOverlay} style={card.grainOnly ? grainOnlyStyle : grainStyle} />
                  )}
                  {card.showControls && (
                    <>
                      <div className={styles.topGradientOverlay} />
                      {videoEffects.grain > 0 && (
                        <div className={styles.grainOverlay} style={card8GrainStyle} />
                      )}
                    </>
                  )}
                  {card.label && <span className={styles.cardLabel}>{card.label}</span>}
                  {card.number && <span className={styles.cardNumberLabel}>{card.number}</span>}
                  {card.logo && (
                    <Image
                      className={styles.cardLogo}
                      src={card.logo}
                      alt="Logo"
                      width={120}
                      height={card.logoHeight || 32}
                      style={{ height: card.logoHeight || 32, width: 'auto' }}
                    />
                  )}
                </>
              ) : card.image ? (
                <>
                  <ProgressiveImage
                    src={card.image}
                    alt={card.title || ''}
                    objectPosition={card.imagePosition}
                    priority={card.id <= 4}
                  />
                  {card.label && <span className={styles.cardLabel}>{card.label}</span>}
                  {card.number && <span className={styles.cardNumberLabel}>{card.number}</span>}
                  {card.logo && (
                    <Image
                      className={styles.cardLogo}
                      src={card.logo}
                      alt="Logo"
                      width={120}
                      height={card.logoHeight || 32}
                      style={{ height: card.logoHeight || 32, width: 'auto' }}
                    />
                  )}
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
