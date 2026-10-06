'use client';

import { useState, useCallback } from 'react';
import Header from '@/components/Header';
import ProjectList from '@/components/ProjectList';
import CardSlider, { type ProjectCategory, type ProjectView } from '@/components/CardSlider';
import styles from './page.module.css';
import { GALLERY_MOTION } from '@/components/motion';
import type { CSSProperties } from 'react';

export default function Home() {
  const [showWork, setShowWork] = useState(false);
  const [view, setView] = useState<ProjectView>('list');
  const [category, setCategory] = useState<ProjectCategory>('work');
  const [exiting, setExiting] = useState(false);
  const finishExit = useCallback(() => { setShowWork(false); setExiting(false); }, []);

  const handleViewWork = () => {
    setView('list');
    setCategory('work');
    setShowWork(true);
  };

  return (
    <main className={styles.main} style={{ '--gallery-duration': `${GALLERY_MOTION.duration}ms`, '--header-delay': `${GALLERY_MOTION.headerDelay}ms`, '--gallery-enter': GALLERY_MOTION.enterEase, '--gallery-exit': GALLERY_MOTION.exitEase } as CSSProperties}>
      <Header view={view} onViewChange={setView} category={category} onCategoryChange={setCategory} showWork={showWork} exiting={exiting} onViewWork={handleViewWork} onReset={() => { if (showWork) { if (view === 'list') finishExit(); else setExiting(true); } }} />
      {showWork && view === 'list' && (
        <ProjectList key={category} category={category} />
      )}
      <CardSlider key={category} category={category} showWork={showWork && view === 'card'} exiting={exiting && view === 'card'} onExitComplete={finishExit} />
    </main>
  );
}
