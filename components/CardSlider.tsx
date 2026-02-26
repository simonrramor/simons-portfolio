'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import styles from './CardSlider.module.css';
import CardLogo from './CardLogo';

// Helper function to count neighbors for cellular automata
function countNeighbors(grid: number[], row: number, col: number, size: number): number {
  let count = 0;
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      if (i === 0 && j === 0) continue;
      const newRow = (row + i + size) % size;
      const newCol = (col + j + size) % size;
      count += grid[newRow * size + newCol];
    }
  }
  return count;
}

// Helper function to compare arrays
function arraysEqual(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

// Generate initial random grid
function generateRandomGrid(): number[] {
  return Array(256).fill(0).map(() => Math.random() > 0.6 ? 1 : 0);
}

function PixelGlyph() {
  const [grid, setGrid] = useState<number[]>(() => generateRandomGrid());

  useEffect(() => {
    const interval = setInterval(() => {
      setGrid(prevGrid => {
        const newGrid = [...prevGrid];
        const size = 16;
        
        for (let i = 0; i < size; i++) {
          for (let j = 0; j < size; j++) {
            const idx = i * size + j;
            const neighbors = countNeighbors(prevGrid, i, j, size);
            const alive = prevGrid[idx] === 1;
            
            // Game of Life rules
            if (alive && (neighbors < 2 || neighbors > 3)) {
              newGrid[idx] = 0;
            } else if (!alive && neighbors === 3) {
              newGrid[idx] = 1;
            }
          }
        }
        
        // If pattern becomes static, dead, or too sparse, reinitialize
        const livingCells = newGrid.filter(v => v === 1).length;
        if (livingCells === 0 || livingCells < 15 || arraysEqual(newGrid, prevGrid)) {
          return generateRandomGrid();
        }
        
        return newGrid;
      });
    }, 100);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.pixelGlyph}>
      {grid.map((pixel, i) => (
        <div
          key={i}
          className={styles.pixel}
          style={{ opacity: pixel }}
        />
      ))}
    </div>
  );
}

// Progressive image component - loads low-res first, then full-res
function ProgressiveImage({
  src,
  alt,
  objectPosition,
  objectFit = 'cover',
  scale = 1,
  priority = false
}: {
  src: string;
  alt: string;
  objectPosition?: string;
  objectFit?: 'cover' | 'contain';
  scale?: number;
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
          objectFit,
          opacity: isLoaded ? 0 : 1,
          transform: scale !== 1 ? `scale(${scale})` : undefined,
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
          objectFit,
          opacity: isLoaded ? 1 : 0,
          transform: scale !== 1 ? `scale(${scale})` : undefined,
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
  imageScale?: number;
  imageFit?: 'cover' | 'contain';
  logo?: string;
  logoHeight?: number;
  grainOnly?: boolean;
  showControls?: boolean;
  hasBorder?: boolean;
  darkText?: boolean;
  backgroundColor?: string;
  showGlyph?: boolean;
}

interface CardSliderProps {
  cards?: Card[];
  showWork?: boolean;
}

const defaultCards: Card[] = [
  { id: 0, title: 'Captr', image: '/images/card_0_image.png', label: 'Captr', number: '_001', logo: '/icons/captr-icon.png', backgroundColor: '#313131', imageFit: 'contain', imagePosition: 'bottom' },
  { id: 10, title: 'Glyph.ai', label: 'Glyph.ai', number: '_002', backgroundColor: '#F5F5F3', darkText: true, showGlyph: true, logo: '/icons/glyph-icon.png', logoHeight: 28 },
  { id: 1, title: 'Project 1', video: '/videos/card_1_video.mp4', poster: '/posters/card_1_poster.png', label: '咲く花', number: '_003', logo: '/icons/stars-icon.svg' },
  { id: 2, title: 'Project 2', image: '/images/card_2_image.jpg', label: 'Sling', number: '_004', logo: '/icons/sling-logo.png' },
  { id: 3, title: 'Project 3', video: '/videos/card_3_video.webm', label: 'Face tracking', number: '_005', grainOnly: true, logo: '/icons/qr-code-icon.svg' },
  { id: 4, title: 'Project 4', image: '/images/card_4_image.jpg', label: 'Group Sessions', number: '_006', logo: '/icons/spotify-logo.png' },
  { id: 5, title: 'Project 5', image: '/images/card_5_image.jpg', label: 'Enhance', number: '_007', imagePosition: 'top', logo: '/icons/spotify-logo.png' },
  { id: 6, title: 'Project 6', video: '/videos/card_6_video.mp4', poster: '/posters/card_6_poster.png', label: 'Neome', number: '_008', showControls: true, logo: '/icons/neome-icon.png' },
  { id: 7, title: 'Project 7', image: '/images/card_7_image.jpg', label: 'Shared tabs', number: '_009', imagePosition: 'left', logo: '/icons/monzo-logo.png', logoHeight: 24 },
  { id: 8, title: 'Project 8', image: '/images/card_8_image.png', label: 'Golden Tickets', number: '_010', imageScale: 1.2, logo: '/icons/monzo-logo.png', logoHeight: 24 },
];


export default function CardSlider({ cards = defaultCards, showWork = true }: CardSliderProps) {
  const cardsRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const translateXRef = useRef(0);
  const targetXRef = useRef(0);
  const singleSetWidthRef = useRef(0);
  const [isOverCard, setIsOverCard] = useState(false);
  const [isOverLink, setIsOverLink] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);
  
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

  // Track mouse down/up for cursor shrink
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as Element;
      if (!target.closest('a, button, [role="button"]')) {
        setIsMouseDown(true);
      }
    };
    const handleMouseUp = () => setIsMouseDown(false);

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
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
        className={`${styles.customCursor} ${isOverCard ? styles.customCursorLarge : ''} ${isOverLink || isMouseDown ? styles.customCursorLink : ''}`}
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
              style={{
                ...(showWork ? { animationDelay: `${(index % cards.length) * 0.1}s` } : {}),
                ...(card.backgroundColor ? { backgroundColor: card.backgroundColor } : {}),
              }}
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
                    objectFit={card.imageFit}
                    scale={card.imageScale}
                    priority={card.id <= 4}
                  />
                  {card.label && <span className={`${styles.cardLabel} ${card.darkText ? styles.cardLabelDark : ''}`}>{card.label}</span>}
                  {card.number && <span className={`${styles.cardNumberLabel} ${card.darkText ? styles.cardNumberLabelDark : ''}`}>{card.number}</span>}
                  {card.logo && (
                    <CardLogo src={card.logo} height={card.logoHeight} />
                  )}
                </>
              ) : (
                <>
                  {card.showGlyph && <PixelGlyph />}
                  {card.label && <span className={`${styles.cardLabel} ${card.darkText ? styles.cardLabelDark : ''}`}>{card.label}</span>}
                  {card.number && <span className={`${styles.cardNumberLabel} ${card.darkText ? styles.cardNumberLabelDark : ''}`}>{card.number}</span>}
                  {card.logo && (
                    <CardLogo src={card.logo} height={card.logoHeight} />
                  )}
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
