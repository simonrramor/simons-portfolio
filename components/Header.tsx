'use client';

import Link from 'next/link';
import styles from './Header.module.css';

interface HeaderProps {
  showWork: boolean;
  onViewWork: () => void;
}

export default function Header({ showWork, onViewWork }: HeaderProps) {
  return (
    <header className={`${styles.header} ${showWork ? styles.headerTop : styles.headerCentered}`}>
      <div className={styles.headerContent}>
        <Link href="/about" className={styles.logo}>
          Simon Amor
        </Link>

        {!showWork && (
          <button className={styles.viewWorkButton} onClick={onViewWork}>
            View Work
          </button>
        )}
        
        <div className={styles.bio}>
          <p className={styles.bioText}>
            London-based designer and Co-Founder of{' '}
            <a href="https://morsemoney.com" target="_blank" rel="noopener noreferrer" className={styles.bioLink}>
              Morse
            </a>
            . Previously building at{' '}
            <a href="https://spotify.com" target="_blank" rel="noopener noreferrer" className={styles.bioLink}>
              Spotify
            </a>
            ,{' '}
            <a href="https://monzo.com" target="_blank" rel="noopener noreferrer" className={styles.bioLink}>
              Monzo
            </a>
            ,{' '}
            <a href="https://google.com" target="_blank" rel="noopener noreferrer" className={styles.bioLink}>
              Google
            </a>
            {' '}and more.
          </p>
        </div>
      </div>
    </header>
  );
}
