'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import styles from './CellsCard.module.css';
import { isConstrainedConnection } from './network';

interface CellsPlayer {
  getVideo: () => HTMLVideoElement | null;
  setVisible: (card: symbol, visible: boolean) => void;
  resume: () => void;
}

const CellsContext = createContext<CellsPlayer | null>(null);

export function CellsPlaybackProvider({ children }: { children: ReactNode }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const visibleCards = useRef(new Set<symbol>());
  const constrained = useRef(isConstrainedConnection());
  const [loaded, setLoaded] = useState(false);
  const getVideo = useCallback(() => videoRef.current, []);

  const syncPlayback = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (visibleCards.current.size > 0 && !document.hidden && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      void video.play().catch(() => { /* Keep the poster or last frame; retry on click. */ });
    } else {
      video.pause();
    }
  }, []);

  const resume = useCallback(() => {
    setLoaded(true);
    requestAnimationFrame(syncPlayback);
  }, [syncPlayback]);

  const setVisible = useCallback((card: symbol, visible: boolean) => {
    if (visible) {
      visibleCards.current.add(card);
      if (!constrained.current) setLoaded(true);
    } else {
      visibleCards.current.delete(card);
    }
    syncPlayback();
  }, [syncPlayback]);

  useEffect(() => {
    if (loaded) syncPlayback();
  }, [loaded, syncPlayback]);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    query.addEventListener('change', syncPlayback);
    document.addEventListener('visibilitychange', syncPlayback);
    return () => {
      query.removeEventListener('change', syncPlayback);
      document.removeEventListener('visibilitychange', syncPlayback);
    };
  }, [syncPlayback]);

  const player = useMemo(() => ({ getVideo, setVisible, resume }), [getVideo, setVisible, resume]);

  return (
    <CellsContext.Provider value={player}>
      {/* One decoder serves every carousel copy. All four styles are packed
          into each video frame, so a style change cannot seek or drift. */}
      <video
        ref={videoRef}
        className={styles.source}
        src={loaded ? '/videos/cells-styles-xray-sync.mp4' : undefined}
        preload={loaded ? 'metadata' : 'none'}
        muted
        playsInline
        loop
        aria-hidden="true"
        onCanPlay={resume}
      />
      {children}
    </CellsContext.Provider>
  );
}

export function useCellsPlayback() {
  const player = useContext(CellsContext);
  if (!player) throw new Error('CellsCard requires CellsPlaybackProvider');
  return player;
}
