'use client';

import { useState, useCallback } from 'react';
import Header from '@/components/Header';
import CardSlider from '@/components/CardSlider';
import styles from './page.module.css';

export default function Home() {
  const [showWork, setShowWork] = useState(false);
  const [exiting, setExiting] = useState(false);
  const finishExit = useCallback(() => { setShowWork(false); setExiting(false); }, []);

  const handleViewWork = () => {
    setShowWork(true);
  };

  return (
    <main className={styles.main}>
      <Header showWork={showWork} exiting={exiting} onViewWork={handleViewWork} onReset={() => { if (showWork) setExiting(true); }} />
      <CardSlider showWork={showWork} exiting={exiting} onExitComplete={finishExit} />
    </main>
  );
}
