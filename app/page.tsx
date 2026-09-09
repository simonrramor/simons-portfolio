'use client';

import { useState, useCallback } from 'react';
import Header from '@/components/Header';
import CardSlider from '@/components/CardSlider';
import styles from './page.module.css';
import { GALLERY_MOTION } from '@/components/motion';
import type { CSSProperties } from 'react';

export default function Home() {
  const [showWork, setShowWork] = useState(false);
  const [exiting, setExiting] = useState(false);
  const finishExit = useCallback(() => { setShowWork(false); setExiting(false); }, []);

  const handleViewWork = () => {
    setShowWork(true);
  };

  return (
    <main className={styles.main} style={{ '--gallery-duration': `${GALLERY_MOTION.duration}ms`, '--header-delay': `${GALLERY_MOTION.headerDelay}ms`, '--gallery-enter': GALLERY_MOTION.enterEase, '--gallery-exit': GALLERY_MOTION.exitEase } as CSSProperties}>
      <Header showWork={showWork} exiting={exiting} onViewWork={handleViewWork} onReset={() => { if (showWork) setExiting(true); }} />
      <CardSlider showWork={showWork} exiting={exiting} onExitComplete={finishExit} />
    </main>
  );
}
