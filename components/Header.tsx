'use client';

import Link from 'next/link';
import styles from './Header.module.css';

interface HeaderProps {
  showWork: boolean;
  exiting?: boolean;
  onViewWork: () => void;
  onReset: () => void;
}

export default function Header({ showWork, exiting = false, onViewWork, onReset }: HeaderProps) {
  return (
    <header className={`${styles.header} ${showWork && !exiting ? styles.headerTop : styles.headerCentered} ${exiting ? styles.headerExiting : ''}`}>
      <div className={styles.headerContent}>
        <div className={styles.logo}>
          <Link href="/about" className={styles.nameAction}>Simon</Link>{' '}
          <button type="button" className={styles.nameAction} onClick={onReset}>Amor</button>
        </div>

        {!showWork && (
          <button className={styles.viewWorkButton} onClick={onViewWork}>
            View work
          </button>
        )}
        
        <div className={styles.bio}>
          <p className={styles.bioText}>
            I’m a designer based in London and co-founder of{' '}
            <a href="https://morsemoney.com" target="_blank" rel="noopener noreferrer" className={styles.bioLink}>
              Morse
            </a>
            . Before that, I worked at{' '}
            <a href="https://spotify.com" target="_blank" rel="noopener noreferrer" className={styles.bioLink}>
              Spotify
            </a>
            ,{' '}
            <a href="https://monzo.com" target="_blank" rel="noopener noreferrer" className={styles.bioLink}>
              Monzo
            </a>
            {' '}and{' '}
            <a href="https://google.com" target="_blank" rel="noopener noreferrer" className={styles.bioLink}>
              Google
            </a>
            .
          </p>
        </div>
      </div>
    </header>
  );
}
