'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import styles from './CardSlider.module.css';
import CardLogo from './CardLogo';

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
  showWork?: boolean;
}

const defaultCards: Card[] = [
  { id: 1, title: 'Project 1', video: '/videos/card_1_video.mp4', poster: '/posters/card_1_poster.png', label: '咲く花', number: '_001', logo: '/icons/stars-icon.svg' },
  { id: 2, title: 'Project 2', image: '/images/card_2_image.jpg', label: 'Sling', number: '_002', logo: '/icons/sling-logo.png' },
  { id: 3, title: 'Project 3', video: '/videos/card_3_video.webm', label: 'Face tracking', number: '_003', grainOnly: true, logo: '/icons/qr-code-icon.svg' },
  { id: 4, title: 'Project 4', image: '/images/card_4_image.jpg', label: 'Group Sessions', number: '_004', logo: '/icons/spotify-logo.png' },
  { id: 5, title: 'Project 5', image: '/images/card_5_image.jpg', label: 'Enhance', number: '_005', imagePosition: 'top', logo: '/icons/spotify-logo.png' },
  { id: 6, title: 'Project 6', video: '/videos/card_6_video.mp4', poster: '/posters/card_6_poster.png', label: 'Neome', number: '_006', showControls: true, logo: '/icons/neome-icon.png' },
  { id: 7, title: 'Project 7', image: '/images/card_7_image.jpg', label: 'Shared tabs', number: '_007', imagePosition: 'left', logo: '/icons/monzo-logo.png', logoHeight: 24 },
];


export default function CardSlider({ cards = defaultCards, showWork = true }: CardSliderProps) {
  const cardsRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const translateXRef = useRef(0);
  const targetXRef = useRef(0);
  const singleSetWidthRef = useRef(0);
  const [isOverCard, setIsOverCard] = useState(false);
  const [isOverLink, setIsOverLink] = useState(false);
  
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

  // Track link/button hover globally
  useEffect(() => {
    const handleLinkEnter = () => setIsOverLink(true);
    const handleLinkLeave = () => setIsOverLink(false);

    const links = document.querySelectorAll('a, button');
    links.forEach(link => {
      link.addEventListener('mouseenter', handleLinkEnter);
      link.addEventListener('mouseleave', handleLinkLeave);
    });

    return () => {
      links.forEach(link => {
        link.removeEventListener('mouseenter', handleLinkEnter);
        link.removeEventListener('mouseleave', handleLinkLeave);
      });
    };
  }, [showWork]);

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
  }, [showWork]);

  // Smooth animation loop with lerp
  useEffect(() => {
    if (!showWork || !cardsRef.current) return;
    
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
  }, [showWork]);

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
    <>
      <div 
        ref={cursorRef}
        className={`${styles.customCursor} ${isOverCard ? styles.customCursorLarge : ''} ${isOverLink ? styles.customCursorLink : ''}`}
      />
      <div className={`${styles.scrollContainer} ${showWork ? styles.scrollContainerVisible : styles.scrollContainerHidden}`}>
        <div className={styles.cardsWrapper}>
        <div 
          className={styles.cardsInner}
          ref={cardsRef}
        >
          {duplicatedCards.map((card, index) => (
            <div 
              key={`${card.id}-${index}`} 
              className={`${styles.card} ${showWork ? styles.cardAnimate : ''} ${card.hasBorder ? styles.cardWithBorder : ''}`}
              style={showWork ? { animationDelay: `${(index % cards.length) * 0.1}s` } : undefined}
              onMouseEnter={handleCardMouseEnter}
              onMouseLeave={handleCardMouseLeave}
            >
              {card.video ? (
                <>
                  <video 
                    className={styles.cardVideo}
                    src={card.video}
                    poster={card.poster}
                    preload="auto"
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
                    onTimeUpdate={(e) => {
                      const video = e.target as HTMLVideoElement;
                      // Seamless loop: seek to start before video ends
                      if (video.duration - video.currentTime < 0.1) {
                        video.currentTime = 0;
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
                    <CardLogo src={card.logo} height={card.logoHeight} />
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
                    <CardLogo src={card.logo} height={card.logoHeight} />
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
    </>
  );
}
