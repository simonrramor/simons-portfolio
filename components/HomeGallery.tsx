'use client';

import { useState, useCallback, useRef } from 'react';
import Header from '@/components/Header';
import ProjectList from '@/components/ProjectList';
import ProjectGrid from '@/components/ProjectGrid';
import CardSlider, { type ProjectView, type CardSliderHandle } from '@/components/CardSlider';
import styles from '@/app/page.module.css';
import { GALLERY_MOTION } from '@/components/motion';
import type { CSSProperties } from 'react';

export default function HomeGallery({ background = 'white' }: { background?: 'white' | 'soft-grey' }) {
  const galleryRef = useRef<CardSliderHandle>(null);
  const [showWork, setShowWork] = useState(false);
  const [view, setView] = useState<ProjectView>('card');
  const [exiting, setExiting] = useState(false);
  const finishExit = useCallback(() => { setShowWork(false); setExiting(false); }, []);

  const handleViewWork = () => {
    setView('card');
    setShowWork(true);
  };

  const header = (<Header view={view} onViewChange={setView} showWork={showWork} exiting={exiting} onViewWork={handleViewWork} onReset={() => { if (showWork) { if (view !== 'card') finishExit(); else setExiting(true); } }} />);

  return (
    <main className={`${styles.main} ${background === 'soft-grey' ? styles.softGrey : ''}`} style={{ '--gallery-duration': `${GALLERY_MOTION.duration}ms`, '--header-delay': `${GALLERY_MOTION.headerDelay}ms`, '--gallery-enter': GALLERY_MOTION.enterEase, '--gallery-exit': GALLERY_MOTION.exitEase } as CSSProperties}>
      {showWork && view === 'grid' ? (
        <div className={styles.gridScroll}>
          {header}
          <ProjectGrid onOpenProject={(id, source) => galleryRef.current?.openProject(id, source)} />
        </div>
      ) : header}
      {showWork && view === 'list' && (
        <ProjectList onOpenProject={id => galleryRef.current?.openProject(id)} />
      )}
      <CardSlider ref={galleryRef} showWork={showWork && view === 'card'} exiting={exiting && view === 'card'} onExitComplete={finishExit} />
    </main>
  );
}
