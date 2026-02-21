'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import CardSlider from '@/components/CardSlider';
import DrawingCanvas from '@/components/DrawingCanvas';
import styles from './page.module.css';

export default function Home() {
  const [showWork, setShowWork] = useState(false);

  const handleViewWork = () => {
    setShowWork(true);
  };

  return (
    <main className={styles.main}>
      <DrawingCanvas />
      <Header showWork={showWork} onViewWork={handleViewWork} />
      <CardSlider showWork={showWork} />
    </main>
  );
}
