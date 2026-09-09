'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import styles from './CardSlider.module.css';
import CardLogo from './CardLogo';
import CardVideo from './CardVideo';
import { GALLERY_MOTION } from './motion';
import CellsCard from './CellsCard';
import IPhoneFoldCard, { IPHONE_FOLD_VIEWS } from './IPhoneFoldCard';
import { CellsPlaybackProvider } from './CellsPlayback';
import { CELL_STYLES } from './cellsStyles';
import { useCardHoverSound } from './useCardHoverSound';

const CARD_TRANSITION = { duration: 320, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' };

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
      if (document.hidden || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
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

function RotationData({ dark }: { dark?: boolean }) {
  const [values, setValues] = useState({ rot: -5.6, z: 13.6, y: 3.7, x: -3.7 });

  useEffect(() => {
    const interval = setInterval(() => {
      if (document.hidden || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      setValues(prev => ({
        rot: prev.rot + (Math.random() - 0.5) * 2.4,
        z: prev.z + (Math.random() - 0.5) * 3.0,
        y: prev.y + (Math.random() - 0.5) * 1.8,
        x: prev.x + (Math.random() - 0.5) * 1.8,
      }));
    }, 80);
    return () => clearInterval(interval);
  }, []);

  const fmt = (v: number) => {
    const sign = v >= 0 ? '+' : '-';
    const abs = Math.abs(v).toFixed(1).padStart(4, '0');
    return `${sign}${abs}`;
  };

  return (
    <div className={`${styles.rotationData} ${dark ? styles.rotationDataDark : ''}`}>
      <div className={styles.rotationLine}>ROT: {fmt(values.rot)} DEG</div>
      <div className={styles.rotationValues}>
        <span>Z: {fmt(values.z)}</span>
        <span>Y: {fmt(values.y)}</span>
        <span>X: {fmt(values.x)}</span>
      </div>
    </div>
  );
}

// Retain decoded images across carousel/modal mounts so opening never restarts a fade.
const readyImages = new Set<string>();
const warmingImages = new Map<string, Promise<void>>();
function warmImage(src: string): Promise<void> {
  if (readyImages.has(src)) return Promise.resolve();
  const pending = warmingImages.get(src);
  if (pending) return pending;
  const image = new window.Image();
  image.src = src;
  const loading = image.decode().then(() => { readyImages.add(src); }).catch(() => {
    // Loading failures stay retryable; they must never block an interaction.
  }).finally(() => { warmingImages.delete(src); });
  warmingImages.set(src, loading);
  return loading;
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
  const [isLoaded, setIsLoaded] = useState(() => readyImages.has(src));

  const handleLoad = useCallback(() => {
    readyImages.add(src);
    setIsLoaded(true);
  }, [src]);

  return (
    <>
      {/* Low-res blurred version - loads fast */}
      <Image
        className={`${styles.cardImage} ${styles.cardImageLowRes}`}
        src={src}
        alt=""
        aria-hidden="true"
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
  cells?: boolean;
  iphoneFold?: boolean;
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
  noOverlay?: boolean;
  videoScale?: number;
  showControls?: boolean;
  hasBorder?: boolean;
  darkText?: boolean;
  backgroundColor?: string;
  showGlyph?: boolean;
  showRotation?: boolean;
  description?: string;
  gallery?: { video: string; poster: string; title: string; backgroundColor?: string }[];
  speakers?: { name: string; company: string }[];
}

interface CardSliderProps {
  cards?: Card[];
  showWork?: boolean;
  exiting?: boolean;
  onExitComplete?: () => void;
}

const defaultCards: Card[] = [
  {
    id: 13, title: 'Morse Card', video: '/videos/morse-card.mp4', poster: '/posters/morse-card.png', label: 'Morse Card', number: '_001', logo: '/icons/morse-logo.png', logoHeight: 32, noOverlay: true, videoScale: 1, backgroundColor: '#000000', hasBorder: true,
    description: 'A rotating 3D card study for Morse, exploring the card’s surface, branding and appearance in motion.',
    gallery: [{
      video: '/videos/morse-card-white.mp4',
      poster: '/posters/morse-card-white.png',
      title: 'White Morse Card',
      backgroundColor: '#ffffff',
    }],
  },
  { id: 12, iphoneFold: true, title: 'iPhone Fold', label: 'iPhone Fold', number: '_002', description: 'A folding iPhone concept exploring a worn aluminium finish and central hinge. Click the image to cycle through three views.' },
  { id: 11, cells: true, title: 'Cells', label: 'Cells', number: '_003', description: 'A moving cellular study, viewed through different colour treatments. Click the image to switch between microscopy, heat map and infrared views.' },
  {
    id: 9, title: 'Mostly working', video: '/videos/card_9_video.mp4', label: 'Mostly working', number: '_004', noOverlay: true, videoScale: 0.7, showRotation: true, backgroundColor: '#FBFAFC', hasBorder: true, darkText: true,
    description: 'A monthly(ish) AI meetup for London designers to get hands-on with AI tools and unpack what they mean for the future of design. When I have time, I make fun event artwork.',
    gallery: [{
      video: '/videos/mostly-working-christine-rode.mp4',
      poster: '/posters/mostly-working-christine-rode.png',
      title: 'Christine Røde speaker animation',
    }],
    speakers: [
      { name: 'Domingo Widen', company: 'Intercom' },
      { name: 'ÌníOlúwa Abíódún', company: 'Intercom' },
      { name: 'Rich Cahill', company: 'Lovable' },
      { name: 'Ben Strak', company: 'Monzo' },
      { name: 'Raphaël Guilleminot', company: 'Meta' },
      { name: 'Robert van Klinken', company: 'DuckDuckGo' },
      { name: 'James Storer', company: 'Monzo' },
      { name: 'Kate Pincott', company: 'Multiverse' },
      { name: 'Christine Røde', company: 'The Browser Company' },
    ],
  },
  { id: 0, title: 'Captr', image: '/images/captr-detail.webp', label: 'Captr', number: '_005', logo: '/icons/captr-icon.png', backgroundColor: '#313131', imageFit: 'contain', imagePosition: 'bottom', description: 'An AI-powered screen capture tool with annotation and sharing, bringing captured content and the context around it into one workflow.' },
  { id: 10, title: 'Glyph.ai', label: 'Glyph.ai', number: '_006', backgroundColor: '#F5F5F3', darkText: true, showGlyph: true, logo: '/icons/glyph-icon.png', logoHeight: 28, description: 'A generative identity system built on cellular automata. The evolving pixel patterns give the identity a changing visual expression rather than a single fixed mark.' },
  { id: 1, title: 'Project 1', video: '/videos/card_1_video.mp4', poster: '/posters/card_1_poster.png', label: '咲く花', number: '_007', logo: '/icons/stars-icon.svg', description: 'Procedural animation experiment exploring organic motion and bloom.' },
  { id: 2, title: 'Sling', image: '/images/card_2_image.jpg', label: 'Sling', number: '_008', logo: '/icons/sling-logo.png', description: 'Send and receive digital dollars and euros around the world in seconds.' },
  { id: 3, title: 'Project 3', video: '/videos/card_3_video.webm', label: 'Face tracking', number: '_009', grainOnly: true, logo: '/icons/qr-code-icon.svg', description: 'Browser-based face tracking with real-time landmark detection.' },
  { id: 4, title: 'Group Sessions', image: '/images/spotify-group-sessions.webp', label: 'Group Sessions', number: '_010', logo: '/icons/spotify-logo.png', description: 'Collaborative listening experience for shared music sessions on Spotify.' },
  { id: 5, title: 'Enhance', image: '/images/spotify-enhance.webp', label: 'Enhance', number: '_011', imagePosition: 'top', logo: '/icons/spotify-logo.png', description: 'AI tools for providing personalized recommendations that blend with the mood, genre, and style of your existing music.' },
  { id: 6, title: 'Project 6', video: '/videos/card_6_video.mp4', poster: '/posters/card_6_poster.png', label: 'Neome', number: '_012', showControls: true, logo: '/icons/neome-icon.png', description: 'Voice-controlled smart speaker designed for the modern home.' },
  { id: 7, title: 'Shared tabs', image: '/images/monzo-shared-tabs.webp', label: 'Shared tabs', number: '_013', imagePosition: 'left', logo: '/icons/monzo-logo.png', logoHeight: 24, description: 'Shared tabs for splitting expenses with friends on Monzo. The feature brings a group’s shared spending together so people can see and settle what they owe.' },
  { id: 8, title: 'Golden Tickets', image: '/images/monzo-golden-tickets.webp', label: 'Golden Tickets', number: '_014', imageScale: 1.2, logo: '/icons/monzo-logo.png', logoHeight: 24, description: 'Gamified referral system with collectible golden ticket rewards on Monzo.' },
];


export default function CardSlider({ cards = defaultCards, showWork = true, exiting = false, onExitComplete }: CardSliderProps) {
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [mediaView, setMediaView] = useState(0);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const sourceCardRef = useRef<HTMLElement | null>(null);
  const backgroundAnimationsRef = useRef<Animation[]>([]);
  const panelAnimationsRef = useRef<Animation[]>([]);
  const scrimRef = useRef<HTMLDivElement>(null);
  const cardAnimationRef = useRef<Animation | null>(null);
  const closingRef = useRef(false);
  const openingRectRef = useRef<DOMRect | null>(null);
  const pointerStartRef = useRef({ x: 0, y: 0 });
  const openCard = (card: Card, index: number) => {
    const source = cardsRef.current?.children[index] as HTMLElement | undefined;
    sourceCardRef.current = source ?? null;
    closingRef.current = false;
    openingRectRef.current = source?.getBoundingClientRect() ?? null;
    source?.focus({ preventScroll: true });
    setMediaView(0);
    setSelectedCard(card);
    setIsOverCard(false);
  };

  const animateBackground = useCallback((opening: boolean) => {
    const dialog = dialogRef.current;
    const scrim = scrimRef.current;
    if (!dialog || !scrim) return;
    const background = Array.from(dialog.parentElement?.children ?? [])
      .filter((element): element is HTMLElement => element instanceof HTMLElement && element !== dialog);
    // Sample before cancelling so an interrupted opening reverses without a jump.
    const filters = background.map(element => getComputedStyle(element).filter);
    const opacity = getComputedStyle(scrim).opacity;
    backgroundAnimationsRef.current.forEach(animation => animation.cancel());
    const timing = {
      ...CARD_TRANSITION,
      duration: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : CARD_TRANSITION.duration,
      fill: 'forwards' as FillMode,
    };
    backgroundAnimationsRef.current = [
      ...background.map((element, index) => element.animate([
        { filter: filters[index] === 'none' ? 'blur(0px)' : filters[index] },
        { filter: opening ? 'blur(12px)' : 'blur(0px)' },
      ], timing)),
      scrim.animate([{ opacity }, { opacity: opening ? 1 : 0 }], timing),
    ];
  }, []);

  const animatePanel = useCallback((opening: boolean) => {
    const elements = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>('[data-modal-chrome]') ?? []);
    const opacities = elements.map(element => getComputedStyle(element).opacity);
    panelAnimationsRef.current.forEach(animation => animation.cancel());
    panelAnimationsRef.current = elements.map((element, index) => element.animate([
      { opacity: opening ? 0 : opacities[index] },
      { opacity: opening ? 1 : 0 },
    ], {
      ...CARD_TRANSITION,
      duration: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : CARD_TRANSITION.duration,
      fill: 'forwards',
    }));
  }, []);

  const closeCard = () => {
    const dialog = dialogRef.current;
    if (!dialog?.open || closingRef.current) return;
    closingRef.current = true;
    animateBackground(false);
    animatePanel(false);
    const panel = dialog.querySelector<HTMLElement>('[data-expanded-card]');
    panel?.setAttribute('data-transitioning', '');
    const card = dialog.querySelector<HTMLElement>('[data-expanded-media] > *');
    const destination = sourceCardRef.current?.getBoundingClientRect() ?? openingRectRef.current;
    if (!card || !destination || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      cardAnimationRef.current?.cancel();
      if (sourceCardRef.current) sourceCardRef.current.style.visibility = '';
      dialog.close();
      return;
    }
    // Start from the current animated position, even if expansion is still running.
    const currentStyle = getComputedStyle(card);
    const currentTransform = currentStyle.transform;
    const currentWidth = currentStyle.width;
    const currentHeight = currentStyle.height;
    cardAnimationRef.current?.cancel();
    const expanded = card.getBoundingClientRect();
    const animation = card.animate([
      { transform: currentTransform, width: currentWidth, height: currentHeight },
      { transform: `translate(${destination.x + destination.width / 2 - expanded.x - expanded.width / 2}px, ${destination.y + destination.height / 2 - expanded.y - expanded.height / 2}px) `, width: `${destination.width}px`, height: `${destination.height}px` },
    ], { ...CARD_TRANSITION, fill: 'forwards' });
    cardAnimationRef.current = animation;
    animation.onfinish = () => {
      if (sourceCardRef.current) sourceCardRef.current.style.visibility = '';
      dialog.close();
      animation.cancel();
    };
  };

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!selectedCard || !dialog) return;
    dialog.showModal();
    animateBackground(true);
    animatePanel(true);
    const panel = dialog.querySelector<HTMLElement>('[data-expanded-card]');
    const media = dialog.querySelector<HTMLElement>('[data-expanded-media]');
    const card = media?.firstElementChild as HTMLElement | null;
    const source = openingRectRef.current;
    const sourceElement = sourceCardRef.current;
    let resizeObserver: ResizeObserver | undefined;
    if (card && media && source) {
      // Morph the frame into a square; object-fit keeps the media proportional.
      const sizeMedia = () => {
        const bounds = media.getBoundingClientRect();
        const width = Math.min(bounds.width, bounds.height);
        card.style.width = `${width}px`;
        card.style.height = `${width}px`;
        const controls = media.querySelector<HTMLElement>('[data-gallery-controls]');
        if (controls) { controls.style.width = `${width}px`; controls.style.height = `${width}px`; }
      };
      sizeMedia();
      resizeObserver = new ResizeObserver(sizeMedia);
      resizeObserver.observe(media);
      const destination = card.getBoundingClientRect();
      if (sourceElement) sourceElement.style.visibility = 'hidden';
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        panel?.setAttribute('data-transitioning', '');
        const animation = card.animate([
          { transform: `translate(${source.x + source.width / 2 - destination.x - destination.width / 2}px, ${source.y + source.height / 2 - destination.y - destination.height / 2}px) `, width: `${source.width}px`, height: `${source.height}px` },
          { transform: 'translate(0, 0)', width: `${destination.width}px`, height: `${destination.height}px` },
        ], CARD_TRANSITION);
        cardAnimationRef.current = animation;
        animation.onfinish = () => panel?.removeAttribute('data-transitioning');
      }
    }
    return () => {
      resizeObserver?.disconnect();
      if (sourceElement) sourceElement.style.visibility = '';
      cardAnimationRef.current?.cancel();
      backgroundAnimationsRef.current.forEach(animation => animation.cancel());
      panelAnimationsRef.current.forEach(animation => animation.cancel());
      backgroundAnimationsRef.current = [];
      panelAnimationsRef.current = [];
    };
  }, [selectedCard, animateBackground, animatePanel]);

  const cardsRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = cardsRef.current;
    if (!container || !showWork) return;
    let stopped = false;
    let active = 0;
    const queued = new Set<string>();
    const queue: string[] = [];
    const drain = () => {
      while (!stopped && active < 2 && queue.length) {
        const src = queue.shift()!;
        active++;
        void warmImage(src).finally(() => { active--; drain(); });
      }
    };
    const prepare = (element: Element) => {
      element.querySelectorAll('img').forEach(image => {
        const src = image.getAttribute('src');
        if (!src || queued.has(src)) return;
        queued.add(src);
        queue.push(src);
      });
      drain();
    };
    // Warm cards just before they enter view, without downloading the entire gallery.
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          prepare(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { root: scrollContainerRef.current, rootMargin: '0px 400px' });
    Array.from(container.children).forEach(element => observer.observe(element));
    const onIntent = (event: Event) => {
      const target = event.target as Element;
      const card = target.closest('[aria-label^="Expand"]');
      if (card) prepare(card);
    };
    container.addEventListener('pointerover', onIntent);
    container.addEventListener('focusin', onIntent);
    return () => {
      stopped = true;
      observer.disconnect();
      container.removeEventListener('pointerover', onIntent);
      container.removeEventListener('focusin', onIntent);
    };
  }, [showWork, cards]);

  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorTrailRef = useRef<HTMLDivElement>(null);
  const translateXRef = useRef(0);
  const targetXRef = useRef(0);
  const singleSetWidthRef = useRef(0);
  const touchLastXRef = useRef(0);
  const touchVelocityRef = useRef(0);
  const lastTouchTimeRef = useRef(0);
  const [isOverCard, setIsOverCard] = useState(false);
  const [isOverLink, setIsOverLink] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  const [cellsVariant, setCellsVariant] = useState(0);
  const [phoneView, setPhoneView] = useState(0);
  const togglePhoneView = useCallback(() => {
    setPhoneView((current) => (current + 1) % IPHONE_FOLD_VIEWS.length);
  }, []);
  const toggleCellsView = useCallback(() => {
    setCellsVariant((current) => (current + 1) % CELL_STYLES.length);
  }, []);

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
      if (cursorTrailRef.current) {
        cursorTrailRef.current.style.left = `${e.clientX}px`;
        cursorTrailRef.current.style.top = `${e.clientY}px`;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Derive hover from the current hit target: buttons can disappear without mouseleave.
  useEffect(() => {
    const updateHover = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      const card = target?.closest(`.${styles.card}`);
      setIsOverCard(Boolean(card));
      setIsOverLink(Boolean(target?.closest('a, button')) && !card);
    };
    const resetHover = () => {
      setIsOverCard(false);
      setIsOverLink(false);
      setIsMouseDown(false);
    };
    // View work removes the hovered button, so clear its state after the DOM updates.
    const frame = requestAnimationFrame(resetHover);
    window.addEventListener('mousemove', updateHover);
    window.addEventListener('mouseover', updateHover);
    window.addEventListener('blur', resetHover);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('mousemove', updateHover);
      window.removeEventListener('mouseover', updateHover);
      window.removeEventListener('blur', resetHover);
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

  useEffect(() => {
    const query = window.matchMedia('(any-hover: hover) and (any-pointer: fine)');
    const update = () => setIsTouchDevice(!query.matches);
    const frame = requestAnimationFrame(update);
    query.addEventListener('change', update);
    return () => { cancelAnimationFrame(frame); query.removeEventListener('change', update); };
  }, []);

  const { playSound: playHoverSound, muted, toggleMuted } = useCardHoverSound();
  useEffect(() => {
    if (!exiting) return;
    const visible = Array.from(cardsRef.current?.children ?? []).filter((element): element is HTMLElement => {
      const bounds = element.getBoundingClientRect();
      return element instanceof HTMLElement && bounds.right > 0 && bounds.left < window.innerWidth;
    }).reverse();
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let soundFrame = 0;
    const startTime = document.timeline.currentTime;
    const animations = visible.map((card, index) => {
      const current = getComputedStyle(card);
      const animation = card.animate([
        { transform: current.transform, opacity: current.opacity },
        { transform: 'translateY(100vh)', opacity: 0 },
      ], { duration: reduced ? 0 : GALLERY_MOTION.duration, delay: reduced ? 0 : index * GALLERY_MOTION.stagger,
        easing: GALLERY_MOTION.exitEase, fill: 'forwards' });
      if (typeof startTime === 'number') animation.startTime = startTime;
      return animation;
    });
    const sounded = new Set<number>();
    const syncSounds = () => {
      animations.forEach((animation, index) => {
        const at = index * GALLERY_MOTION.stagger + GALLERY_MOTION.duration - GALLERY_MOTION.arrival;
        if (!sounded.has(index) && Number(animation.currentTime ?? 0) >= at && playHoverSound()) sounded.add(index);
      });
      if (sounded.size < animations.length) soundFrame = requestAnimationFrame(syncSounds);
    };
    if (!reduced) soundFrame = requestAnimationFrame(syncSounds);
    let cancelled = false;
    void Promise.all(animations.map(animation => animation.finished)).then(() => {
      if (!cancelled) onExitComplete?.();
    }).catch(() => {});
    return () => {
      cancelled = true;
      cancelAnimationFrame(soundFrame);
      animations.forEach(animation => animation.cancel());
    };
  }, [exiting, onExitComplete, playHoverSound]);

  useEffect(() => {
    const container = cardsRef.current;
    if (!container || !showWork || exiting || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let frame: number;
    let arrivals: { card: HTMLElement; animation: Animation; at: number }[] | undefined;
    const tick = () => {
      if (!arrivals) {
        // Only the initial visible run, beginning with card 1 in the middle copy.
        arrivals = Array.from(container.children).slice(cards.length, cards.length * 2)
          .flatMap(element => {
            const card = element as HTMLElement;
            const bounds = card.getBoundingClientRect();
            if (bounds.right <= 0 || bounds.left >= window.innerWidth) return [];
            const animation = card.getAnimations().find(item =>
              item instanceof CSSAnimation && item.animationName.includes('slideInFromBottom'));
            if (!animation?.effect) return [];
            const timing = animation.effect.getTiming();
            // Lead the visual settling by 200ms so the pip feels aligned with arrival.
            return [{ card, animation, at: (timing.delay ?? 0) + GALLERY_MOTION.arrival }];
          });
      }
      arrivals = arrivals.filter(arrival => {
        if (Number(arrival.animation.currentTime ?? 0) < arrival.at) return true;
        const bounds = arrival.card.getBoundingClientRect();
        if (dialogRef.current?.open || document.hidden || bounds.right <= 0 || bounds.left >= window.innerWidth) return false;
        // Judge visibility in the resting row, not the still-moving vertical position.
        // Keep early arrivals pending while the first gesture unlocks the audio engine.
        return !playHoverSound() && Number(arrival.animation.currentTime ?? 0) < arrival.at + 1000;
      });
      if (arrivals.length) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [showWork, exiting, cards.length, playHoverSound]);

  const handleCardMouseEnter = (expanded: boolean) => {
    setIsOverCard(true);
    if (!expanded && !selectedCard && showWork && !exiting) playHoverSound();
  };
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

  // Shared wrap-around helper for infinite scroll
  const wrapTarget = useCallback((newTarget: number) => {
    const singleSetWidth = singleSetWidthRef.current;
    if (singleSetWidth <= 0) return;
    const wrapped = singleSetWidth + ((newTarget % singleSetWidth) + singleSetWidth) % singleSetWidth;
    translateXRef.current += wrapped - newTarget;
    newTarget = wrapped;
    targetXRef.current = newTarget;
  }, []);

  // Initialize positions and set up wheel + touch handlers
  useEffect(() => {
    if (!cardsRef.current) return;
    const container = scrollContainerRef.current;
    if (!container) return;

    const track = cardsRef.current;
    const firstCard = track.children[0] as HTMLElement | undefined;
    const nextSetFirstCard = track.children[cards.length] as HTMLElement | undefined;
    if (!firstCard || !nextSetFirstCard) return;

    const updateMeasurements = () => {
      // Measure the repeat distance, including the gap between card sets.
      const width = nextSetFirstCard.getBoundingClientRect().left - firstCard.getBoundingClientRect().left;
      if (width <= 0) return;
      const previousWidth = showWork ? singleSetWidthRef.current : 0;
      if (previousWidth > 0) {
        const progress = ((translateXRef.current % previousWidth) + previousWidth) % previousWidth;
        const pendingScroll = targetXRef.current - translateXRef.current;
        translateXRef.current = width + progress / previousWidth * width;
        targetXRef.current = translateXRef.current + pendingScroll / previousWidth * width;
      } else {
        translateXRef.current = width;
        targetXRef.current = width;
      }
      singleSetWidthRef.current = width;
      wrapTarget(targetXRef.current);
      track.style.transform = `translate3d(-${translateXRef.current}px, 0, 0)`;
    };

    updateMeasurements();
    const resizeObserver = new ResizeObserver(updateMeasurements);
    resizeObserver.observe(container);
    resizeObserver.observe(firstCard);

    const handleWheel = (e: WheelEvent) => {
      if (!showWork || exiting || dialogRef.current?.open || e.ctrlKey) return;
      e.preventDefault();
      const maxDelta = 100;
      const delta = Math.max(-maxDelta, Math.min(maxDelta, Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY)) * 0.8;
      wrapTarget(targetXRef.current + delta);
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchLastXRef.current = e.touches[0].clientX;
      touchVelocityRef.current = 0;
      lastTouchTimeRef.current = Date.now();
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!showWork || exiting || dialogRef.current?.open) return;
      e.preventDefault();
      const currentX = e.touches[0].clientX;
      const delta = touchLastXRef.current - currentX;
      const now = Date.now();
      const dt = now - lastTouchTimeRef.current;
      if (dt > 0) touchVelocityRef.current = delta / dt;
      lastTouchTimeRef.current = now;
      touchLastXRef.current = currentX;
      wrapTarget(targetXRef.current + delta);
    };

    const handleTouchEnd = () => {
      const momentum = touchVelocityRef.current * 150;
      wrapTarget(targetXRef.current + momentum);
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('wheel', handleWheel);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [showWork, exiting, cards.length, wrapTarget]);

  useEffect(() => {
    const track = cardsRef.current;
    const container = scrollContainerRef.current;
    if (!track || !container) return;
    const update = (entries: IntersectionObserverEntry[]) => entries.forEach(entry => {
      const card = entry.target as HTMLElement;
      card.inert = !showWork || !entry.isIntersecting;
      card.setAttribute('aria-hidden', String(card.inert));
    });
    const observer = new IntersectionObserver(update, { root: scrollContainerRef.current, threshold: 0.01 });
    Array.from(track.children).forEach(card => observer.observe(card));
    const onKey = (event: KeyboardEvent) => {
      if (!showWork || exiting || dialogRef.current?.open || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      const current = (event.target as Element).closest(`.${styles.card}`);
      if (!current) return;
      event.preventDefault();
      const list = Array.from(track.children) as HTMLElement[];
      let index = list.indexOf(current as HTMLElement);
      index = event.key === 'Home' ? cards.length : event.key === 'End' ? cards.length * 2 - 1 : index + (event.key === 'ArrowRight' ? 1 : -1);
      const next = list[(index + list.length) % list.length];
      const bounds = next.getBoundingClientRect();
      const contentLeft = container.getBoundingClientRect().left + parseFloat(getComputedStyle(container).paddingLeft);
      targetXRef.current = translateXRef.current + bounds.left - contentLeft;
      translateXRef.current = targetXRef.current;
      track.style.transform = `translate3d(-${targetXRef.current}px, 0, 0)`;
      next.inert = false;
      next.removeAttribute('aria-hidden');
      next.focus({ preventScroll: true });
    };
    track.addEventListener('keydown', onKey);
    return () => { observer.disconnect(); track.removeEventListener('keydown', onKey); };
  }, [showWork, exiting, cards.length]);

  // Smooth animation loop with lerp
  useEffect(() => {
    if (!showWork || exiting || selectedCard || !cardsRef.current) return;

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
  }, [showWork, exiting, selectedCard]);

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

  const renderCard = (card: Card, index: number, expanded = false) => card.iphoneFold ? (
            <IPhoneFoldCard
              key={`${card.id}-${index}`}
              className={`${styles.card} ${expanded ? styles.expandedCard : showWork ? styles.cardAnimate : ''}`}
              style={!expanded && showWork ? { animationDelay: `${(index % cards.length) * GALLERY_MOTION.stagger / 1000}s` } : {}}
              number={card.number}
              enabled={showWork}
              expanded={expanded}
              viewIndex={phoneView}
              onToggle={expanded ? togglePhoneView : () => openCard(card, index)}
              onMouseEnter={() => handleCardMouseEnter(expanded)}
              onMouseLeave={handleCardMouseLeave}
            />
          ) : card.cells ? (
            <CellsCard
              key={`${card.id}-${index}`}
              className={`${styles.card} ${expanded ? styles.expandedCard : showWork ? styles.cardAnimate : ''}`}
              style={!expanded && showWork ? { animationDelay: `${(index % cards.length) * GALLERY_MOTION.stagger / 1000}s` } : {}}
              number={card.number}
              enabled={showWork}
              expanded={expanded}
              variantIndex={cellsVariant}
              onToggle={expanded ? toggleCellsView : () => openCard(card, index)}
              onMouseEnter={() => handleCardMouseEnter(expanded)}
              onMouseLeave={handleCardMouseLeave}
            />
          ) : (
<div
              role={expanded ? undefined : 'button'}
              tabIndex={expanded || !showWork ? -1 : 0}
              aria-label={expanded ? undefined : `Expand ${card.label || card.title}`}
              onPointerDown={(event) => { pointerStartRef.current = { x: event.clientX, y: event.clientY }; }}
              onClick={(event) => {
                if (!expanded && (event.detail === 0 || Math.hypot(event.clientX - pointerStartRef.current.x, event.clientY - pointerStartRef.current.y) < 10)) openCard(card, index);
              }}
              onKeyDown={(event) => {
                if (!expanded && (event.key === 'Enter' || event.key === ' ')) {
                  event.preventDefault();
                  openCard(card, index);
                }
              }}
              key={`${card.id}-${index}`}
              className={`${styles.card} ${expanded ? styles.expandedCard : showWork ? styles.cardAnimate : ''} ${card.hasBorder ? styles.cardWithBorder : ''}`}
              style={{
                ...(!expanded && showWork ? { animationDelay: `${(index % cards.length) * GALLERY_MOTION.stagger / 1000}s` } : {}),
                ...(card.backgroundColor ? { backgroundColor: card.backgroundColor } : {}),
              }}
              onMouseEnter={() => handleCardMouseEnter(expanded)}
              onMouseLeave={handleCardMouseLeave}
            >
              {card.video ? (
                <>
                  <CardVideo
                    key={card.video}
                    enabled={expanded || (showWork && !selectedCard && !exiting)}
                    className={styles.cardVideo}
                    src={card.video}
                    poster={card.poster}
                    aria-label={card.title}
                    loop
                    muted
                    playsInline
                    style={{
                      ...(card.showControls ? videoFilterStyle : {}),
                      ...(card.videoScale ? { width: `${card.videoScale * 100}%`, height: `${card.videoScale * 100}%`, objectFit: 'contain' as const, margin: 'auto' } : {}),
                    }}
                    onLoadedMetadata={(e) => {
                      if (expanded) {
                        const sourceVideo = sourceCardRef.current?.querySelector('video');
                        if (sourceVideo && sourceVideo.getAttribute('src') === card.video) e.currentTarget.currentTime = sourceVideo.currentTime;
                      }
                      if (card.showControls) {
                        (e.target as HTMLVideoElement).playbackRate = 0.5;
                      }
                    }}
                    onTimeUpdate={expanded && mediaView > 0 && selectedCard?.gallery ? undefined : (e) => {
                      const video = e.target as HTMLVideoElement;
                      // Seamless loop: seek to start before video ends
                      if (video.duration - video.currentTime < 0.1) {
                        video.currentTime = 0;
                      }
                    }}
                  />
                  {!card.showControls && !card.noOverlay && (
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
                  {card.showRotation && <RotationData dark={card.darkText} />}
                  {card.label && <span className={`${styles.cardLabel} ${card.darkText ? styles.cardLabelDark : ''}`}>{card.label}</span>}
                  {card.number && <span className={`${styles.cardNumberLabel} ${card.darkText ? styles.cardNumberLabelDark : ''}`}>{card.number}</span>}
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
                    priority={expanded || card.id <= 4}
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
          );

  const viewCount = selectedCard?.iphoneFold ? IPHONE_FOLD_VIEWS.length : selectedCard?.cells ? CELL_STYLES.length : selectedCard?.gallery ? selectedCard.gallery.length + 1 : 0;
  const activeView = selectedCard?.iphoneFold ? phoneView : selectedCard?.cells ? cellsVariant : mediaView;
  const galleryItem = selectedCard?.gallery?.[mediaView - 1];
  const expandedCard = selectedCard && galleryItem
    ? { ...selectedCard, ...galleryItem, videoScale: 1, showRotation: false }
    : selectedCard;
  const selectView = (index: number) => {
    if (selectedCard?.iphoneFold) setPhoneView((index + viewCount) % viewCount);
    else if (selectedCard?.cells) setCellsVariant((index + viewCount) % viewCount);
    else if (selectedCard?.gallery) setMediaView((index + viewCount) % viewCount);
  };

  return (
    <CellsPlaybackProvider>
      <button type="button" className={styles.soundToggle} aria-pressed={muted} onClick={toggleMuted}>{muted ? 'Sound off' : 'Sound on'}</button>
      {!isTouchDevice && (
        <>
          <div
            ref={cursorTrailRef}
            className={`${styles.customCursorTrail} ${isOverCard || isOverLink || isMouseDown ? styles.customCursorTrailLink : ''}`}
          />
          <div
            ref={cursorRef}
            className={`${styles.customCursor} ${isOverCard || isOverLink || isMouseDown ? styles.customCursorLink : ''}`}
          />
        </>
      )}
      <div ref={scrollContainerRef} className={`${styles.scrollContainer} ${showWork ? styles.scrollContainerVisible : styles.scrollContainerHidden}`}>
        <div className={styles.cardsWrapper}>
        <div
          className={styles.cardsInner}
          ref={cardsRef}
        >
          {duplicatedCards.map((card, index) => renderCard(card, index))}
        </div>
      </div>
    </div>
      <dialog
        ref={dialogRef}
        className={styles.expandedDialog}
        aria-labelledby="expanded-project-title"
        onClose={() => { closingRef.current = false; setSelectedCard(null); }}
        onCancel={(event) => { event.preventDefault(); closeCard(); }}
        onClick={(event) => { if (event.target === event.currentTarget) closeCard(); }}
      >
        <div ref={scrimRef} className={styles.modalScrim} aria-hidden="true" />
        {selectedCard && (
          <div data-expanded-card className={styles.expandedContent}>
            <div data-modal-chrome className={styles.modalSurface} aria-hidden="true" />
            <div data-expanded-media className={styles.expandedMedia}>
              {expandedCard && renderCard(expandedCard, 0, true)}
              {viewCount > 1 && (
                <div data-gallery-controls data-modal-chrome className={styles.galleryControls}>
                  <button type="button" className={`${styles.galleryArrow} ${styles.galleryPrevious}`} aria-label="Previous gallery item" onClick={() => selectView(activeView - 1)}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m14 6-6 6 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </button>
                  <button type="button" className={`${styles.galleryArrow} ${styles.galleryNext}`} aria-label="Next gallery item" onClick={() => selectView(activeView + 1)}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m10 6 6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </button>
                  <div className={styles.galleryDots} role="group" aria-label="Gallery selection">
                    {Array.from({ length: viewCount }, (_, index) => (
                      <button key={index} type="button" className={styles.galleryDot} aria-label={`Show gallery item ${index + 1} of ${viewCount}`} aria-pressed={activeView === index} onClick={() => selectView(index)}><span /></button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div data-modal-chrome className={styles.expandedDetails}>
              <h2 id="expanded-project-title" className={styles.expandedTitle}>{selectedCard.label || selectedCard.title}</h2>
              {selectedCard.description && <p className={styles.expandedDescription}>{selectedCard.description}</p>}
              {selectedCard.speakers && (
                <section className={styles.speakers} aria-labelledby="project-speakers-title">
                  <h3 id="project-speakers-title">Speakers</h3>
                  <ul>
                    {selectedCard.speakers.map(speaker => (
                      <li key={speaker.name}>{speaker.name} <span>({speaker.company})</span></li>
                    ))}
                  </ul>
                </section>
              )}
              {selectedCard.title === 'Morse Card' && <a className={styles.projectLink} href="https://morsemoney.com" target="_blank" rel="noopener noreferrer">Visit Morse ↗</a>}
            </div>
            <button data-modal-chrome autoFocus type="button" className={styles.closeButton} aria-label="Close expanded card" onClick={closeCard}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.5" /></svg>
            </button>
          </div>
        )}
      </dialog>
    </CellsPlaybackProvider>
  );
}
